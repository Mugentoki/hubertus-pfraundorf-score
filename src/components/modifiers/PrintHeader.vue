<template>
    <SidebarCard title="Druckkopf">
        <div class="print-header-config">
            <label for="print-header-title">
                <input
                    id="print-header-title"
                    name="printHeaderTitle"
                    type="text"
                    v-model="printHeaderTitle"
                />
                <span>Titel</span>
            </label>
            <label for="print-header-subtitle">
                <input
                    id="print-header-subtitle"
                    name="printHeaderSubtitle"
                    type="text"
                    v-model="printHeaderSubtitle"
                />
                <span>Untertitel</span>
            </label>
        </div>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from '../SidebarCard.vue';
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useResultStore } from '../../stores/result';

const resultStore = useResultStore();
const { printHeader } = storeToRefs(resultStore);

const printHeaderTitle = computed({
    get: () => printHeader.value.title,
    set: (value) => resultStore.setPrintHeaderTitle(value),
});

const printHeaderSubtitle = computed({
    get: () => printHeader.value.subtitle,
    set: (value) => resultStore.setPrintHeaderSubtitle(value),
});
</script>

<style>
.print-header-config {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    label {
        font-size: var(--font-small);
    }
}

.print-header-config input {
    width: 100%;
}

.print-header-config label > span {
    margin-left: 0.5rem;
}
</style>
