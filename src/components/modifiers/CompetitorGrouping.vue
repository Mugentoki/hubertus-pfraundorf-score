<template>
    <SidebarCard title="Gruppierung der Schützen">
        <div class="competitor-grouping">
            <select id="competitor-grouping-select" @change="updateGroupingType">
                <option
                    v-for="option in groupingOptions" :key="option.type"
                    :value="option.type"
                    :disabled="option.disabled"
                >
                    {{ option.label }}
                </option>
            </select>
            <label for="competitor-grouping-select">{{ getActiveOptionDescription }}</label>
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
const { setCompetitorGroupingModifier } = resultStore;

const groupingOptions = [
    {
        type: 'none',
        label: 'Keine Gruppierung',
        description: "Es findet keine Gruppierung nach Team/Mannschaft statt.",
        disabled: false
    },
    {
        type: 'team',
        label: 'Mannschaft',
        description: "Die Schützen werden nach der jeweils hinterlegten Mannschaft sortiert.",
        disabled: true
    }
]

const getActiveOptionDescription = computed(() => {
    const activeOption = groupingOptions.find(option => option.type === resultModifiers.value.competitorGrouping);
    return activeOption.description;
});

function updateGroupingType(event) {
    const activeOption = event.target.value;
    setCompetitorGroupingModifier(activeOption);
}
</script>

<style>
.competitor-grouping {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    label {
        font-size: var(--font-small);
    }
}
</style>