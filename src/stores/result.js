import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { calculateResult } from '../lib/resultCalculation';

export const useResultStore = defineStore('result', () => {
    /* state properties */
    const originalResult = ref(null);
    const mutatedResult = ref(null);
    const printHeader = ref({ title: '', subtitle: '' });
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
        },
        faktors: {
            aufgelegt: { ring: 0.95, teiler: 1.5 },
            pistole:   { ring: 1,    teiler: 0.33 },
            assignments: {} // { [fullName]: 'aufgelegt' | 'pistole' }
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

    function setPrintHeaderTitle(title) {
        printHeader.value.title = title;
    }

    function setPrintHeaderSubtitle(subtitle) {
        printHeader.value.subtitle = subtitle;
    }

    function initPrintHeader(title, subtitle) {
        printHeader.value = { title: title ?? '', subtitle: subtitle ?? '' };
    }

    function initFaktors() {
        resultModifiers.value.faktors = {
            aufgelegt: { ring: 0.95, teiler: 1.5 },
            pistole:   { ring: 1,    teiler: 0.33 },
            assignments: {}
        };
    }

    function setFaktorsValue(discipline, key, value) {
        const newValue = Number(value);
        if (!Number.isFinite(newValue)) return;
        resultModifiers.value.faktors[discipline][key] = newValue;
    }

    function setFaktorAssignment(fullName, type) {
        const assignments = resultModifiers.value.faktors.assignments;
        if (type === 'none') {
            delete assignments[fullName];
        } else {
            assignments[fullName] = type;
        }
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
        printHeader,
        resultModifiers,

        hasLoadedResults,

        setOriginalResult,
        setMutatedResult,
        initPrintHeader,
        initFaktors,
        setFaktorsValue,
        setFaktorAssignment,
        setPrintHeaderTitle,
        setPrintHeaderSubtitle,
        setResultModifiers,
        recalculateResult,
        setCompetitorGroupingModifier,
        setSeriesGroupCalculationModifier,
        setSeriesGroupingModifier,
        setRankingModifier
    }
});