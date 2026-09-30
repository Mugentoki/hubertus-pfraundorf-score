<template>
    <SidebarCard title="Faktor">
        <div class="faktors-config">
            <fieldset id="faktor-aufgelegt">
                <legend>Aufgelegt</legend>
                <label for="faktor-aufgelegt-ring">
                    <input
                        id="faktor-aufgelegt-ring"
                        name="faktorRingAufgelegt"
                        type="number"
                        step="0.01"
                        min="0"
                        v-model.number="aufgelegtRingFactor"
                    />
                    <span>Ring-Faktor</span>
                </label>
                <label for="faktor-aufgelegt-teiler">
                    <input
                        id="faktor-aufgelegt-teiler"
                        name="faktorTeilerAufgelegt"
                        type="number"
                        step="0.01"
                        min="0"
                        v-model.number="aufgelegtTeilerFactor"
                    />
                    <span>Teiler-Faktor</span>
                </label>
            </fieldset>
            <fieldset id="faktor-pistole">
                <legend>Pistole</legend>
                <label for="faktor-pistole-ring">
                    <input
                        id="faktor-pistole-ring"
                        name="faktorRingPistole"
                        type="number"
                        step="0.01"
                        min="0"
                        v-model.number="pistoleRingFactor"
                    />
                    <span>Ring Faktor</span>
                </label>
                <label for="faktor-pistole-teiler">
                    <input
                        id="faktor-pistole-teiler"
                        name="faktorTeilerPistole"
                        type="number"
                        step="0.01"
                        min="0"
                        v-model.number="pistoleTeilerFactor"
                    />
                    <span>Teiler Faktor</span>
                </label>
            </fieldset>
        </div>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from '../SidebarCard.vue';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useResultStore } from '../../stores/result';

const resultStore = useResultStore();
const { resultModifiers } = storeToRefs(resultStore);

function createFactorValueComputed(discipline, key) {
    return computed({
        get: () => resultModifiers.value.faktors[discipline][key],
        set: (value) => resultStore.setFaktorsValue(discipline, key, value)
    });
}

const aufgelegtRingFactor = createFactorValueComputed('aufgelegt', 'ring');
const aufgelegtTeilerFactor = createFactorValueComputed('aufgelegt', 'teiler');
const pistoleRingFactor = createFactorValueComputed('pistole', 'ring');
const pistoleTeilerFactor = createFactorValueComputed('pistole', 'teiler');
</script>

<style>
.faktors-config {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;

    fieldset {
        border: 1px solid var(--ui-border-color);
        border-radius: calc(var(--corner-default) * 0.5);
        padding: 0.5rem;
    }

    legend {
        font-weight: bold;
        font-size: var(--font-normal);
        font-family: sans-serif;
    }

    label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--font-small);
        margin-bottom: 0.25rem;
    }

    input[type="number"] {
        width: 75px;
        padding: 0.25rem 0.5rem;
    }

    label > span {
        flex: 1;
        text-align: right;
    }
}
</style>