import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { calculateResult } from '../lib/resultCalculation';

export const useResultStore = defineStore('result', () => {
    /* state properties */
    const originalResult = ref(null);
    const mutatedResult = ref(null);
    const resultModifiers = ref({
        competitorGrouping: 'none'
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
        setCompetitorGroupingModifier
    }
});