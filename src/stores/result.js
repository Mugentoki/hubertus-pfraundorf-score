import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useResultStore = defineStore('result', () => {
    /* state properties */
    const originalResult = ref(null);
    const mutatedResult = ref(null);
    const resultModifiers = ref({
        competitorGrouping: 'none'
    })

    /* getters */
    const getOriginalResult = computed(() => originalResult);
    const getMutatedResult = computed(() => mutated);
    const hasLoadedResults = computed(() => {
        return (originalResult.value !== null && mutatedResult.value !== null) ? true : false;
    });
    const getResultModifiers = computed(() => resultModifiers);

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

    return {
        originalResult,
        mutatedResult,
        resultModifiers,

        getOriginalResult,
        getMutatedResult,
        hasLoadedResults,
        getResultModifiers,

        setOriginalResult,
        setMutatedResult,
        setResultModifiers,
        setCompetitorGroupingModifier
    }
});