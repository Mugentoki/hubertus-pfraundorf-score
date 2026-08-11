<template>
    <SidebarCard title="Berechnung der Seriengruppen">
        <div class="series-grouping-calculation">
            <select id="series-grouping-calculation-select" @change="updateCalculationType">
                <option
                    v-for="option in calculationOptions" :key="option.type"
                    :value="option.type"
                    :disabled="option.disabled"
                >
                    {{ option.label }}
                </option>
            </select>
            <label for="series-grouping-calculation-select">{{ getActiveOptionDescription }}</label>
        </div>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from '../SidebarCard.vue';
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useResultStore } from '../../stores/result';

const resultStore = useResultStore();
const { resultModifiers } = storeToRefs(resultStore);
const { setSeriesGroupCalculationModifier } = resultStore;

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
        description: "Es wird die Summe der angegebenen Anzahl von Serien verwendet. Sind zu wenige Serien in der Gruppe, zählen diese als 0 Ring.",
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
    const activeOption = calculationOptions.find(option => option.type === resultModifiers.value.seriesGroupCalculation);
    return activeOption.description;
});

function updateCalculationType(event) {
    const activeOption = event.target.value;
    setSeriesGroupCalculationModifier(activeOption);
}
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
</style>