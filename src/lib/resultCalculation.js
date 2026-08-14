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
            console.log('single');
            break;
        case 'summary':
            // sum best x numbers of series (use modifier option summaryAmount for it) - + add best teiler
            console.log('summary');
            break;
        case 'average':
            // calculate average from all series inside collection - + add best teiler
            console.log('average');
            break;
        case 'midrange':
            // calculate average from best and worst series inside collection - + add best teiler
            console.log('midrange');
            break;
        case 'target':
            // calculate closest series / teiler to given target -- use options targetTeiler and targetRing
            console.log('target');
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