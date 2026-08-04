<template>
    <SidebarCard title="Gruppierung der Serien">
        <div class="series-grouping">
            <select id="series-grouping-select" @change="updateGroupingType">
                <option
                    v-for="option in groupingOptions" :key="option.type"
                    :value="option.type"
                    :disabled="option.disabled"
                >
                    {{ option.label }}
                </option>
            </select>
            <label for="series-grouping-select">{{ getActiveOptionDescription }}</label>
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
const { setSeriesGroupingModifier } = resultStore;

const groupingOptions = [
    {
        type: 'none',
        label: 'Keine Gruppierung',
        description: "Die Serien werden nicht nach Tag/Woche etc. gruppiert.",
        disabled: false
    },
    {
        type: 'day',
        label: 'Tag',
        description: "Die Serien werden nach Tag gruppiert, an dem sie geschossen wurden.",
        disabled: false
    },
    {
        type: 'week',
        label: 'Woche',
        description: "Die Serien werden nach Woche gruppiert, innerhalb der sie geschossen wurden.",
        disabled: false
    }
]

const getActiveOptionDescription = computed(() => {
    const activeOption = groupingOptions.find(option => option.type === resultModifiers.value.seriesGrouping);
    return activeOption.description;
});

function updateGroupingType(event) {
    const activeOption = event.target.value;
    setSeriesGroupingModifier(activeOption);
}
</script>

<style>
.series-grouping {
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