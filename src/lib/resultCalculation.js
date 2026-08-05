import { toRaw } from 'vue';

export function calculateResult(originalResult, resultModifiers) {
    let mutatedResult = structuredClone(toRaw(originalResult));

    mutatedResult = competitorGrouping(mutatedResult, resultModifiers.competitorGrouping);
    mutatedResult = seriesGrouping(mutatedResult, resultModifiers.seriesGrouping);

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

    return result;
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
            const series = competitor.seriesCollections[0];

            series.forEach((serie) => {
                const seriesGroup = getGroupName(serie.timestamp, groupingModifier);

                seriesCollections[seriesGroup] ??= [];
                seriesCollections[seriesGroup].push(serie);
            });

            competitor.seriesCollections = seriesCollections.filter(Boolean);
        });
    });

    return result;
}

function getGroupName(timestamp, groupingModifier) {
    const date = new Date(timestamp);

    switch (groupingModifier) {
        case 'day':
                return getDayOfTimestamp(timestamp);
            break;
        case 'week':
            console.log(getWeekOfTimestamp(timestamp));
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