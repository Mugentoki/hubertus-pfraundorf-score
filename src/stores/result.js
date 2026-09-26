import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { calculateResult } from '../lib/resultCalculation';

export const useResultStore = defineStore('result', () => {
    /* state properties */
    const originalResult = ref(null);
    const mutatedResult = ref(null);
    const resultModifiers = ref({
        competitorGrouping: 'none',
        seriesGrouping: 'none',
        seriesGroupCalculation: {
            type: 'single',
            options: {}
        },
        ranking: {
            type: 'ring',
            options: {
                adlerStartWithTeiler: false
            }
        }
    })

    /* getters */
    const hasLoadedResults = computed(() => {
        return (originalResult.value !== null && mutatedResult.value !== null) ? true : false;
    });

    /* actions */
    function setOriginalResult(result) {
        originalResult.value = result;
    }

    function setMutatedResult(result) {
        mutatedResult.value = result;
    }

    function setResultModifiers(modifiers) {
        resultModifiers.value = modifiers;
    }

    function setCompetitorGroupingModifier(modifier) {
        resultModifiers.value.competitorGrouping = modifier;
    }

    function setSeriesGroupingModifier(modifier) {
        resultModifiers.value.seriesGrouping = modifier;
    }

    function setSeriesGroupCalculationModifier(modifier) {
        resultModifiers.value.seriesGroupCalculation = modifier;
    }

    function setRankingModifier(modifier) {
        resultModifiers.value.ranking = modifier;
    }

    function recalculateResult() {
        mutatedResult.value = calculateResult(originalResult.value, resultModifiers.value);
    }

    watch(resultModifiers,
        () => {
            recalculateResult();
        },
        { deep: true}
    );

    return {
        originalResult,
        mutatedResult,
        resultModifiers,

        hasLoadedResults,

        setOriginalResult,
        setMutatedResult,
        setResultModifiers,
        recalculateResult,
        setCompetitorGroupingModifier,
        setSeriesGroupCalculationModifier,
        setSeriesGroupingModifier,
        setRankingModifier
    }
});