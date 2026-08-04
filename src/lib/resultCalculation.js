export function calculateResult(originalResult, resultModifiers) {
    let mutatedResult = originalResult;

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
    console.log('result', result);
    switch (groupingModifier) {
        case 'day':
            // group the series of each competitor into days
            // todo: implement
            break;
        case 'week':
            // group the series of each competitor into weeks
            // todo: implement
            break;
        case 'none':
        default:
            // nothing to do, since by default all series are in one group
            break;
    }

    return result;
}