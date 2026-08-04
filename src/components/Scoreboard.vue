<template>
    <div class="scoreboard">
        <h1 class="scoreboard__title">{{ mutatedResult.name }}</h1>
        <div
            v-for="group in mutatedResult.groups"
            :key="mutatedResult.groups.name"
            class="scoreboard-group"
        >
            <strong
                v-if="mutatedResult.groups.length > 1"
                class="scoreboard-group__name"
            >
                {{ group.name }}
           </strong>

            <table class="scoreboard-table">
                <tbody>
                    <tr>
                        <th>Platz</th>
                        <th>Name</th>
                        <th>Ergebnis</th>
                        <th>Einzelergebnisse</th>
                    </tr>
                    <tr v-for="(competitor, index) in group.competitors" :key="competitor.fullName">
                        <th>{{ index + 1 }}</th>
                        <td>{{ competitor.fullName }}</td>
                        <td>{{ competitor.statistics.totalScoreDecimal }}</td>
                        <td>{{ joinSeriesCollectionScores(competitor.seriesCollections) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { useResultStore } from '../stores/result';
import { storeToRefs } from 'pinia'

const resultStore = useResultStore();
const { mutatedResult } = storeToRefs(resultStore);

function joinSeriesCollectionScores(seriesCollection) {
    let joinedScores = "";

    seriesCollection.forEach((serie) => {
        joinedScores += serie.totalScoreDecimal + " ";
    });

    return joinedScores;
}
</script>

<style>
.scoreboard,
.scoreboard-table {
    width: 100%;
}

.scoreboard-table {
    text-align: left;

    th, td {
        padding: 0.25rem 0.5rem;
    }
}

.scoreboard {
    padding: 1rem;

    .scoreboard__title {
        font-size: 2.2rem;
    }
}

.scoreboard-group {
    .scoreboard-group__name {
        font-size: 1.4rem;
    }
}
</style>