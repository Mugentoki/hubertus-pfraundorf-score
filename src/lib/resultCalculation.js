import { toRaw } from 'vue';

export function calculateResult(originalResult, resultModifiers) {
    let mutatedResult = structuredClone(toRaw(originalResult));

    const teilerInfo = extractCompetitorTeilers(mutatedResult);

    competitorGrouping(mutatedResult, resultModifiers.competitorGrouping);
    seriesGrouping(mutatedResult, resultModifiers.seriesGrouping);
    seriesGroupCalculation(mutatedResult, resultModifiers.seriesGroupCalculation);

    applyRanking(mutatedResult, resultModifiers.ranking, teilerInfo);

    console.log(mutatedResult);

    return mutatedResult;
}

/**
 * Collects, for every competitor, all finite `shot.teiler` values over all
 * shots of all series of all collections and returns a Map keyed by the
 * competitor object reference. Each entry contains the lowest teiler (`best`)
 * and the second-lowest teiler (`second`); duplicates are allowed and values
 * may come from the same series. Non-finite values (empty/missing teiler
 * strings) are filtered out; a competitor with fewer than two finite values
 * gets `Infinity` for the missing position and therefore always loses a
 * teiler tie-break.
 *
 * Must be called on the result clone before series grouping/calculation can
 * remove collections, so the keys are taken from the fresh pre-filter data.
 *
 * @param {*} result
 * @returns {Map<*, { best: number, second: number }>}
 */
function extractCompetitorTeilers(result) {
    const teilerInfo = new Map();

    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            const teilers = [];
            competitor.seriesCollections.forEach((collection) => {
                collection.series.forEach((serie) => {
                    (serie.shots ?? []).forEach((shot) => {
                        // Number(null)/Number('') are 0, so guard against
                        // missing/empty values explicitly, not just non-finite
                        const teiler = Number(shot.teiler);
                        const usable = shot.teiler !== null
                            && shot.teiler !== undefined
                            && shot.teiler !== ''
                            && Number.isFinite(teiler);

                        if (usable) {
                            teilers.push(teiler);
                        }
                    });
                });
            });

            teilers.sort((a, b) => a - b);
            teilerInfo.set(competitor, {
                best: teilers[0] ?? Infinity,
                second: teilers[1] ?? Infinity
            });
        });
    });

    return teilerInfo;
}

/**
 * Sorts every group's competitors according to the ranking modifier.
 *
 * - `ring`: highest computed "Ergebnis" (`statistics.totalScoreDecimal`)
 *   first, tie → best (lowest) teiler, still tied → import order
 *   (stable sort keeps it).
 * - `teiler`: best (lowest) teiler first, tie → second-best teiler,
 *   still tied → import order.
 * - `adlerserie`: alternating draft placing every competitor exactly once:
 *   pick i is a teiler pick when `options.adlerStartWithTeiler` toggles the
 *   parity, otherwise it is a ring pick. Each pick scans the remaining
 *   competitors in import order and only takes a candidate that is strictly
 *   better (teiler pick: lower best teiler, tie → higher "Ergebnis"; ring
 *   pick: higher "Ergebnis", tie → lower best teiler), so first-seen wins.
 * - Any other or unknown type is a no-op.
 *
 * The teiler keys are taken from the pre-filter snapshot built by
 * `extractCompetitorTeilers` (average/midrange remove whole collections
 * during calculation); the ring key always comes from the computed result
 * value, which is a number in every calculation mode. Degenerate
 * competitors have `Infinity` teiler values and therefore always lose
 * teiler tie-breaks.
 *
 * @param {*} result
 * @param {*} rankingModifier
 * @param {Map<*, { best: number, second: number }>} teilerInfo
 */
function applyRanking(result, rankingModifier, teilerInfo) {
    if (!rankingModifier) {
        rankingModifier = { type: 'ring', options: { adlerStartWithTeiler: false } };
    }

    result.groups.forEach((group) => {
        switch (rankingModifier.type) {
            case 'ring':
                group.competitors.sort((a, b) =>
                    compareNumbers(a.statistics.totalScoreDecimal, b.statistics.totalScoreDecimal)
                    || compareTeilerValue(teilerInfo.get(a).best, teilerInfo.get(b).best)
                );
                break;
            case 'teiler':
                group.competitors.sort((a, b) =>
                    compareTeilerValue(teilerInfo.get(a).best, teilerInfo.get(b).best)
                    || compareTeilerValue(teilerInfo.get(a).second, teilerInfo.get(b).second)
                );
                break;
            case 'adlerserie':
                group.competitors = adlerserieDraft(
                    group.competitors,
                    teilerInfo,
                    rankingModifier.options.adlerStartWithTeiler
                );
                break;
            default:
                break;
        }
    });
}

/**
 * Runs the alternating Adlerserie draft over one group's competitors and
 * returns a new array with every competitor exactly once. See `applyRanking`
 * for the pick semantics.
 *
 * @param {*} competitors
 * @param {Map<*, { best: number, second: number }>} teilerInfo
 * @param {boolean} startWithTeiler
 * @returns {Array}
 */
function adlerserieDraft(competitors, teilerInfo, startWithTeiler) {
    const remaining = [...competitors];
    const ordered = [];

    while (remaining.length > 0) {
        const useTeilerPick = startWithTeiler
            ? ordered.length % 2 === 0
            : ordered.length % 2 === 1;

        let pickedIndex = 0;

        for (let i = 1; i < remaining.length; i++) {
            const beats = useTeilerPick
                ? isTeilerPickBetter(remaining[i], remaining[pickedIndex], teilerInfo)
                : isRingPickBetter(remaining[i], remaining[pickedIndex], teilerInfo);

            if (beats) {
                pickedIndex = i;
            }
        }

        ordered.push(remaining.splice(pickedIndex, 1)[0]);
    }

    return ordered;
}

/**
 * Strict-improvement comparison for an Adlerserie teiler pick:
 * lower best teiler wins, tie → higher "Ergebnis".
 *
 * @param {*} a
 * @param {*} b
 * @param {Map<*, { best: number, second: number }>} teilerInfo
 * @returns {boolean}
 */
function isTeilerPickBetter(a, b, teilerInfo) {
    const bestA = teilerInfo.get(a).best;
    const bestB = teilerInfo.get(b).best;

    return bestA < bestB
        || (bestA === bestB && a.statistics.totalScoreDecimal > b.statistics.totalScoreDecimal);
}

/**
 * Strict-improvement comparison for an Adlerserie ring pick:
 * higher "Ergebnis" wins, tie → lower best teiler.
 *
 * @param {*} a
 * @param {*} b
 * @param {Map<*, { best: number, second: number }>} teilerInfo
 * @returns {boolean}
 */
function isRingPickBetter(a, b, teilerInfo) {
    const bestA = teilerInfo.get(a).best;
    const bestB = teilerInfo.get(b).best;

    return a.statistics.totalScoreDecimal > b.statistics.totalScoreDecimal
        || (a.statistics.totalScoreDecimal === b.statistics.totalScoreDecimal && bestA < bestB);
}

/**
 * Sort comparator for teiler values (lower wins). `Infinity` marks
 * "no value at all" and therefore ranks after every finite teiler.
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function compareTeilerValue(a, b) {
    if (a === b) {
        return 0;
    }
    if (a === Infinity) {
        return 1;
    }
    if (b === Infinity) {
        return -1;
    }

    return a - b;
}

/**
 * Descending sort comparator for ring scores (higher wins).
 * Non-finite values (missing/invalid "Ergebnis") rank after all finite scores.
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function compareNumbers(a, b) {
    if (a === b) {
        return 0;
    }
    if (!Number.isFinite(a)) {
        return 1;
    }
    if (!Number.isFinite(b)) {
        return -1;
    }

    return b - a;
}

/**
 * Applies modifiers for compeitor grouping
 * For available cases see "groupingOptions"
 * in ./components/modifiers/CompetitorGrouping.vue
 *
 * @param {*} result
 * @param {*} groupingModifier
 * @returns
 */
function competitorGrouping(result, groupingModifier) {
    switch (groupingModifier) {
        case 'team':
           // split the result into teams based on some criteria
           // Todo: Get a example file for teams and implement
           break;
        case 'none':
        default:
            // nothing to do, since by default we have one single group
            break;
    }
}

/**
 * Applies modifiers for series grouping
 * For available cases see "groupingOptions"
 * in ./components/modifiers/SeriesGrouping.vue
 * 
 * @param {*} result 
 * @param {*} groupingModifier 
 * @returns 
 */
function seriesGrouping(result, groupingModifier) {
    if (groupingModifier === 'none') return result;

    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            const seriesCollections = [];
            const collection = competitor.seriesCollections[0];

            collection.series.forEach((serie) => {
                const seriesGroup = getGroupName(serie.timestamp, groupingModifier);

                seriesCollections[seriesGroup] ??= {
                    series: [],
                    statistics: {
                        ring: 0,
                        teiler: 0,
                        ringValues: []
                    }
                };
                seriesCollections[seriesGroup].series.push(serie);
            });

            competitor.seriesCollections = seriesCollections.filter(Boolean);
        });
    });
}

/**
 * Calculates the series groups results, based on the modifier settings
 * @param {*} result 
 * @param {*} seriesGroupCalculationModifier 
 */
function seriesGroupCalculation(result, seriesGroupCalculationModifier) {

    // add results to seriesCollection.statistics
    switch (seriesGroupCalculationModifier.type) {
        case 'single':
            // find best single series and best teiler
            getBestGroupSeriesAndTeiler(result);
            break;
        case 'summary':
            // sum best x numbers of series (use modifier option summaryAmount for it) - + add best teiler
            getGroupSeriesSumAndTeiler(result, seriesGroupCalculationModifier);
            break;
        case 'average':
            // calculate average per collection, best X collections (options.bestAmount) + best teiler
            getGroupSeriesAverageAndTeiler(result, seriesGroupCalculationModifier);
            break;
        case 'midrange':
            // midrange per collection, best X collections (options.bestAmount) + best teiler
            getGroupSeriesMidrangeAndTeiler(result, seriesGroupCalculationModifier);
            break;
        case 'target':
            // closest series / teiler to given target -- use options targetTeiler and targetRing
            getGroupSeriesTargetAndTeiler(result, seriesGroupCalculationModifier);
            break;
        default:
            break;
    }
}

function getGroupName(timestamp, groupingModifier) {
    const date = new Date(timestamp);

    switch (groupingModifier) {
        case 'day':
                return getDayOfTimestamp(timestamp);
            break;
        case 'week':
                return getWeekOfTimestamp(timestamp);
            break;
    }

}

function getDayOfTimestamp(timestamp) {
    const date = new Date(timestamp);
    const start = new Date(date.getFullYear(), 0, 0);

    return Math.floor((date - start) / 86400000);
}

/* Implements ISO calendar week */
function getWeekOfTimestamp(timestamp) {
    const date = new Date(timestamp);

    // Move to Thursday of the current week
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));

    // Find the first day of the ISO week-year
    const yearStart = new Date(date.getFullYear(), 0, 1);

    return Math.ceil(
        ((date - yearStart) / 86400000 + 1) / 7
    );
}

function getBestGroupSeriesAndTeiler(result) {
    let tmpSeries = 0;
    let tmpTeiler = 9999;

    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            competitor.seriesCollections.forEach((collection) => {
                collection.series.forEach((serie) => {
                    tmpSeries = Math.max(tmpSeries, serie.totalScoreDecimal);
                    tmpTeiler = Math.min(tmpTeiler, serie.bestTeiler);
                });

                collection.statistics.ring = tmpSeries;
                collection.statistics.ringValues.push(tmpSeries);
                collection.statistics.teiler = tmpTeiler;
            });
        });
    });
}

function getGroupSeriesSumAndTeiler(result, modifier) {
    const amount = modifier.options.summaryAmount;

    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            let tmpSeries = 0;
            let tmpTeiler = 9999;

            competitor.seriesCollections.forEach((collection) => {
                const bestSeries = sortSeriesDescending(collection.series).slice(0, amount);

                let sum = 0;
                bestSeries.forEach((serie) => {
                    sum += serie.totalScoreDecimal;
                });

                sum = Math.round(sum * 10) / 10;

                collection.statistics.ring = sum;
                collection.statistics.ringValues.push(sum);
                tmpSeries = sum > tmpSeries ? sum : tmpSeries;

                let bestTeiler = 9999;
                collection.series.forEach((serie) => {
                    bestTeiler = Math.min(bestTeiler, serie.bestTeiler);
                });
                collection.statistics.teiler = bestTeiler;
                tmpTeiler = bestTeiler < tmpTeiler ? bestTeiler : tmpTeiler;
            });

            competitor.statistics.bester_teiler = tmpTeiler;
            competitor.statistics.totalScoreDecimal = tmpSeries;
        });
    });
}

/**
 * Calculates the average of all series per series collection,
 * keeps only the best X collections (X = options.bestAmount) per competitor,
 * and sums their group results into totalScoreDecimal.
 * The best teiler is always the lowest bestTeiler across all series of all
 * collections, computed before filtering.
 *
 * @param {*} result
 * @param {*} seriesGroupCalculationModifier
 */
function getGroupSeriesAverageAndTeiler(result, seriesGroupCalculationModifier) {
    const amount = Math.max(1, Number(seriesGroupCalculationModifier.options.bestAmount) || 1);

    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            const scoredCollections = competitor.seriesCollections.map((collection) => {
                let sum = 0;
                collection.series.forEach((serie) => {
                    sum += serie.totalScoreDecimal;
                });

                // guard: 0 series → 0 rings (avoids 0/0 = NaN, matches summary behavior)
                const average = collection.series.length === 0
                    ? 0
                    : Math.round((sum / collection.series.length) * 10) / 10;

                let currentBestTeiler = 9999;
                collection.series.forEach((serie) => {
                    currentBestTeiler = Math.min(currentBestTeiler, serie.bestTeiler);
                });

                return { collection, score: average, teiler: currentBestTeiler };
            });

            let bestTeiler = 9999;
            scoredCollections.forEach(({ teiler }) => {
                bestTeiler = Math.min(bestTeiler, teiler);
            });

            const selected = new Set(
                [...scoredCollections]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, amount)
                    .map(({ collection }) => collection)
            );

            let sumOfKeptScores = 0;
            const keptCollections = scoredCollections
                .filter(({ collection }) => selected.has(collection))
                .map(({ collection, score, teiler }) => {
                    collection.statistics.ring = score;
                    collection.statistics.ringValues.push(score);
                    collection.statistics.teiler = teiler;
                    sumOfKeptScores += score;
                    return collection;
                });

            competitor.seriesCollections = keptCollections;
            competitor.statistics.totalScoreDecimal = Math.round(sumOfKeptScores * 10) / 10;
            competitor.statistics.bester_teiler = bestTeiler;
        });
    });
}

/**
 * Calculates the midrange (best + worst) / 2 per series collection,
 * keeps only the best X collections (X = options.bestAmount) per competitor,
 * and sums their group results into totalScoreDecimal.
 * The best teiler is always the lowest bestTeiler across all series of all
 * collections, computed before filtering.
 *
 * @param {*} result
 * @param {*} seriesGroupCalculationModifier
 */
function getGroupSeriesMidrangeAndTeiler(result, seriesGroupCalculationModifier) {
    const amount = Math.max(1, Number(seriesGroupCalculationModifier.options.bestAmount) || 1);

    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            const scoredCollections = competitor.seriesCollections.map((collection) => {
                let best = 0;
                let worst = Infinity;
                collection.series.forEach((serie) => {
                    best = Math.max(best, serie.totalScoreDecimal);
                    worst = Math.min(worst, serie.totalScoreDecimal);
                });

                // guard: 0 series -> 0 rings (avoids Infinity, matches summary behavior)
                const midrange = collection.series.length === 0
                    ? 0
                    : Math.round(((best + worst) / 2) * 10) / 10;

                let currentBestTeiler = 9999;
                collection.series.forEach((serie) => {
                    currentBestTeiler = Math.min(currentBestTeiler, serie.bestTeiler);
                });

                return { collection, score: midrange, teiler: currentBestTeiler };
            });

            let bestTeiler = 9999;
            scoredCollections.forEach(({ teiler }) => {
                bestTeiler = Math.min(bestTeiler, teiler);
            });

            const selected = new Set(
                [...scoredCollections]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, amount)
                    .map(({ collection }) => collection)
            );

            let sumOfKeptScores = 0;
            const keptCollections = scoredCollections
                .filter(({ collection }) => selected.has(collection))
                .map(({ collection, score, teiler }) => {
                    collection.statistics.ring = score;
                    collection.statistics.ringValues.push(score);
                    collection.statistics.teiler = teiler;
                    sumOfKeptScores += score;
                    return collection;
                });

            competitor.seriesCollections = keptCollections;
            competitor.statistics.totalScoreDecimal = Math.round(sumOfKeptScores * 10) / 10;
            competitor.statistics.bester_teiler = bestTeiler;
        });
    });
}

/**
 * Picks, per series collection and per competitor, the series whose ring is closest
 * to the given target ring and (independently) the series whose teiler is closest
 * to the given target teiler. On an exact tie the first series in order wins.
 *
 * @param {*} result
 * @param {*} seriesGroupCalculationModifier
 */
function getGroupSeriesTargetAndTeiler(result, seriesGroupCalculationModifier) {
    const targetRing = Number(seriesGroupCalculationModifier.options.targetRing) ?? 0;
    const targetTeiler = Number(seriesGroupCalculationModifier.options.targetTeiler) ?? 0;

    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            let overallBestRing = 0;
            let overallBestRingDiff = Infinity;
            let overallBestTeiler = 0;
            let overallBestTeilerDiff = Infinity;

            competitor.seriesCollections.forEach((collection) => {
                let collectionBestRing = 0;
                let collectionBestRingDiff = Infinity;
                let collectionBestTeiler = 0;
                let collectionBestTeilerDiff = Infinity;

                collection.series.forEach((serie) => {
                    const ringDiff = Math.abs(serie.totalScoreDecimal - targetRing);
                    if (ringDiff < collectionBestRingDiff) {
                        collectionBestRingDiff = ringDiff;
                        collectionBestRing = serie.totalScoreDecimal;
                    }
                    if (ringDiff < overallBestRingDiff) {
                        overallBestRingDiff = ringDiff;
                        overallBestRing = serie.totalScoreDecimal;
                    }

                    const teilerDiff = Math.abs(serie.bestTeiler - targetTeiler);
                    if (teilerDiff < collectionBestTeilerDiff) {
                        collectionBestTeilerDiff = teilerDiff;
                        collectionBestTeiler = serie.bestTeiler;
                    }
                    if (teilerDiff < overallBestTeilerDiff) {
                        overallBestTeilerDiff = teilerDiff;
                        overallBestTeiler = serie.bestTeiler;
                    }
                });

                // guard: 0 series -> collection contributes 0 ring / teiler (init values)
                collection.statistics.ring = collectionBestRing;
                collection.statistics.ringValues.push(collectionBestRing);
                collection.statistics.teiler = collectionBestTeiler;
            });

            competitor.statistics.totalScoreDecimal = overallBestRing;
            competitor.statistics.bester_teiler = overallBestTeiler;
        });
    });
}

/**
 * Sorts an array of series by descending totalScoreDecimal
 */
function sortSeriesDescending(series) {
    return series.sort((a, b) => b.totalScoreDecimal - a.totalScoreDecimal)
}