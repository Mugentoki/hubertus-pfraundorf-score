<template>
    <SidebarCard title="Rangsortierung">
        <form class="ranking">
            <select
                id="ranking-select"
                v-model="rankingModifier.type"
            >
                <option
                    v-for="option in rankingOptions" :key="option.type"
                    :value="option.type"
                >
                    {{ option.label }}
                </option>
            </select>
            <label for="ranking-select">{{ getActiveOptionDescription }}</label>

            <template v-if="rankingModifier.type === 'adlerserie'">
                <label for="adler-start-with-teiler">
                    <input
                        id="adler-start-with-teiler"
                        name="adlerStartWithTeiler"
                        type="checkbox"
                        v-model="rankingModifier.options.adlerStartWithTeiler"
                    />
                    <span>Erster Platz: bester Teiler</span>
                </label>
            </template>
        </form>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from '../SidebarCard.vue';
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useResultStore } from '../../stores/result';

const resultStore = useResultStore();
const { resultModifiers } = storeToRefs(resultStore);
const { setRankingModifier } = resultStore;

const rankingModifier = ref({
    type: 'ring',
    options: {
        adlerStartWithTeiler: false
    }
});

const rankingOptions = [
    {
        type: 'ring',
        label: 'Ring',
        description: "Rangfolge nach Ringergebnis: Der Schütze mit dem besten Ringergebnis wird auf Platz 1 gesetzt. Bei gleichem Ringergebnis entscheidet der beste Teiler."
    },
    {
        type: 'teiler',
        label: 'Teiler',
        description: "Rangfolge nach Teilerergebnis: Der Schütze mit dem besten Teiler wird auf Platz 1 gesetzt. Bei gleichem Teiler entscheidet der zweitbeste Teiler."
    },
    {
        type: 'adlerserie',
        label: 'Adlerserie',
        description: "Abwechselnde Platzierung: Der erste Platz geht nach bestem Ringergebnis, der zweite nach bestem Teiler, dann wechselt ab. Jeder Schütze wird nur einmal platziert. Gleichstand: bester Teiler bzw. bestes Ringergebnis entscheidet."
    }
];

const getActiveOptionDescription = computed(() => {
    const activeOption = rankingOptions.find(option => option.type === resultModifiers.value.ranking?.type);
    return activeOption ? activeOption.description : '';
});

watch(rankingModifier,
    () => {
        setRankingModifier(rankingModifier.value);
    },
    { deep: true }
);
</script>

<style>
.ranking {
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

.ranking input[type="checkbox"] {
    max-width: 50px;
}

.ranking label > span {
    margin-left: 0.5rem;
}
</style>
