import { toRaw } from 'vue';

export function calculateResult(originalResult, resultModifiers) {
    let mutatedResult = structuredClone(toRaw(originalResult));

    competitorGrouping(mutatedResult, resultModifiers.competitorGrouping);
    seriesGrouping(mutatedResult, resultModifiers.seriesGrouping);
    seriesGroupCalculation(mutatedResult, resultModifiers.seriesGroupCalculation);

    console.log(mutatedResult);

    return mutatedResult;
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
            // calculate average from all series inside collection - + add best teiler
            getGroupSeriesAverageAndTeiler(result);
            break;
        case 'midrange':
            // average of best and worst series inside collection - + add best teiler
            getGroupSeriesMidrangeAndTeiler(result);
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
 * Calculates the average of all series per series collection
 * and takes the best teiler of all series
 *
 * @param {*} result
 */
function getGroupSeriesAverageAndTeiler(result) {
    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            let bestAverage = 0;
            let bestTeiler = 9999;

            competitor.seriesCollections.forEach((collection) => {
                let sum = 0;
                collection.series.forEach((serie) => {
                    sum += serie.totalScoreDecimal;
                });

                // guard: 0 series → 0 rings (avoids 0/0 = NaN, matches summary behavior)
                const average = collection.series.length === 0
                    ? 0
                    : Math.round((sum / collection.series.length) * 10) / 10;

                collection.statistics.ring = average;
                collection.statistics.ringValues.push(average);

                let currentBestTeiler = 9999;
                collection.series.forEach((serie) => {
                    currentBestTeiler = Math.min(currentBestTeiler, serie.bestTeiler);
                });
                collection.statistics.teiler = currentBestTeiler;

                bestAverage = average > bestAverage ? average : bestAverage;
                bestTeiler = currentBestTeiler < bestTeiler ? currentBestTeiler : bestTeiler;
            });

            competitor.statistics.totalScoreDecimal = bestAverage;
            competitor.statistics.bester_teiler = bestTeiler;
        });
    });
}

/**
 * Calculates the midrange (best + worst) / 2 of all series per series collection
 * and takes the best teiler of all series
 *
 * @param {*} result
 */
function getGroupSeriesMidrangeAndTeiler(result) {
    result.groups.forEach((group) => {
        group.competitors.forEach((competitor) => {
            let bestMidrange = 0;
            let bestTeiler = 9999;

            competitor.seriesCollections.forEach((collection) => {
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

                collection.statistics.ring = midrange;
                collection.statistics.ringValues.push(midrange);

                let currentBestTeiler = 9999;
                collection.series.forEach((serie) => {
                    currentBestTeiler = Math.min(currentBestTeiler, serie.bestTeiler);
                });
                collection.statistics.teiler = currentBestTeiler;

                bestMidrange = midrange > bestMidrange ? midrange : bestMidrange;
                bestTeiler = currentBestTeiler < bestTeiler ? currentBestTeiler : bestTeiler;
            });

            competitor.statistics.totalScoreDecimal = bestMidrange;
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