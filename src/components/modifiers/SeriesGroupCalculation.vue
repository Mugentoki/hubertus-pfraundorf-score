<template>
    <SidebarCard title="Berechnung der Seriengruppen">
        <form class="series-grouping-calculation">
            <select
                id="series-grouping-calculation-select"
                v-model="calculationModifier.type"
            >
                <option
                    v-for="option in calculationOptions" :key="option.type"
                    :value="option.type"
                    :disabled="option.disabled"
                >
                    {{ option.label }}
                </option>
            </select>
            <label for="series-grouping-calculation-select">{{ getActiveOptionDescription }}</label>
            <fieldset id="series-grouping-calculation-options">
                <legend>Optionen:</legend>

                <template v-if="activeModifier === 'summary'">
                    <label for="summary-amount">
                        <input
                            id="summary-amount"
                            name="summaryAmount"
                            type="number"
                            step="1"
                            min="1"
                            v-model="calculationModifier.options.summaryAmount"
                        />
                        <span>Anzahl Serien</span>
                    </label>
                </template>

                <template v-if="activeModifier === 'target'">
                    <label for="target-teiler">
                        <input
                            id="target-teiler"
                            name="targetTeiler"
                            type="number"
                            step="1"
                            min="0"
                            v-model="calculationModifier.options.targetTeiler"
                        />
                        <span>Ziel Teiler</span>
                    </label>
                    <label for="target-ring">
                        <input
                            id="target-ring"
                            name="targetRing"
                            type="number"
                            step="1"
                            min="0"
                            max="110"
                            v-model="calculationModifier.options.targetRing"
                        />
                        <span>Ziel Ring</span>
                    </label>
                </template>
            </fieldset>
        </form>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from '../SidebarCard.vue';
import { computed, ref, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useResultStore } from '../../stores/result';

const resultStore = useResultStore();
const { resultModifiers } = storeToRefs(resultStore);
const { setSeriesGroupCalculationModifier } = resultStore;

const calculationModifier = ref({
    type: 'single',
    options: {
        summaryAmount: 1,
        targetTeiler: 0,
        targetRing: 110
    }
});

const calculationOptions = [
    {
        type: 'single',
        label: 'Einzelserie',
        description: "Es wird jeweils die beste Serie und/oder der beste Teiler unter allen Serien, innerhalb der Gruppierung, zur Berechnung verwendet.",
        disabled: false
    },
    {
        type: 'summary',
        label: 'Summe',
        description: "Es wird die Summe der besten angegebenen Anzahl von Serien verwendet. Sind zu wenige Serien in der Gruppe, zählen diese als 0 Ring.",
        disabled: false
    },
    {
        type: 'average',
        label: 'Durchschnitt',
        description: "Es wird der Durchschnitt aller Serien innerhalb der Gruppierung berechnet.",
        disabled: false
    },
    {
        type: 'midrange',
        label: 'Mittlerer Bereich',
        description: "Es wird der Durchschnitt der besten und schlechtesten Serie berechnet. Fehlende Serien werden mit 0 Ring aufgefüllt.",
        disabled: false
    },
    {
        type: 'target',
        label: 'Festgelegtes Ziel',
        description: "Es wird die näheste Serie und nähester Teiler anhand der Angaben berechnet.",
        disabled: false
    }
]

const getActiveOptionDescription = computed(() => {
    const activeOption = calculationOptions.find(option => option.type === resultModifiers.value.seriesGroupCalculation.type);
    return activeOption.description;
});

const activeModifier = computed(() => {
    return resultModifiers.value.seriesGroupCalculation.type;
});

watch(calculationModifier,
    (newModifier, oldModifier) => {
        setSeriesGroupCalculationModifier(calculationModifier.value);
    },
    { deep: true }
);
</script>

<style>
.series-grouping-calculation {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    select,
    option {
        cursor: pointer;
    }

    label {
        font-size: var(--font-small);
    }
}

#series-grouping-calculation-options {
    display: none;
    margin-top: 0.5rem;
    flex-direction: column;
    gap: 1rem;

    &:has(input) {
        display: flex;
    }

    input {
        max-width: 50px;
        min-width: 50px;
    }

    label > span {
        margin-left: 0.5rem;
    }
}
</style>