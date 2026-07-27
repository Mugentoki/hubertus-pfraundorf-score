import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useResultStore = defineStore('result', () => {
    /* state properties */
    const originalResult = ref(null);
    const mutatedResult = ref(null);

    /* getters */
    const getOriginalResult = computed(() => originalResult);
    const getMutatedResult = computed(() => mutated);
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

    return {
        originalResult,
        mutatedResult,

        getOriginalResult,
        getMutatedResult,
        hasLoadedResults,

        setOriginalResult,
        setMutatedResult
    }
});