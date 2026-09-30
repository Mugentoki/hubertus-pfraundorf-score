<template>
    <div class="scoreboard">
        <header class="print-header">
            <img
                class="print-header__logo"
                src="../assets/images/logo.png"
                alt=""
            />
            <div class="print-header__text">
                <h1 class="print-header__title">{{ printHeader.title }}</h1>
                <p class="print-header__subtitle">{{ printHeader.subtitle }}</p>
            </div>
        </header>
        <h1 class="scoreboard__title">{{ printHeader.title || mutatedResult.name }}</h1>
        <p class="scoreboard__subtitle" v-if="printHeader.subtitle">{{ printHeader.subtitle }}</p>
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
                 <thead>
                     <tr>
                        <th class="scoreboard__faktor-cell">Aufgelegt</th>
                        <th class="scoreboard__faktor-cell">Pistole</th>
                        <th>Platz</th>
                        <th>Name</th>
                        <th>Ergebnis</th>
                        <th>Original</th>
                        <th>Einzelergebnisse</th>
                    </tr>
                 </thead>
                 <tbody>
                     <tr v-for="(competitor, index) in group.competitors" :key="competitor.fullName">
                        <td class="scoreboard__faktor-cell">
                            <input
                                type="checkbox"
                                :checked="faktorsAssignments[competitor.fullName] === 'aufgelegt'"
                                @change="setFaktorAssignment(competitor.fullName, 'aufgelegt')"
                            />
                        </td>
                        <td class="scoreboard__faktor-cell">
                            <input
                                type="checkbox"
                                :checked="faktorsAssignments[competitor.fullName] === 'pistole'"
                                @change="setFaktorAssignment(competitor.fullName, 'pistole')"
                            />
                        </td>
                        <th>{{ index + 1 }}</th>
                        <td>{{ competitor.fullName }}</td>  
                        <td>{{ getDisplayResult(competitor) }}</td>
                        <td>{{ getOriginalResult(competitor) }}</td>
                        <td class="scoreboard__series-collection" v-html="joinSeriesCollectionScores(competitor.seriesCollections)"></td>
                     </tr>
                 </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useResultStore } from '../stores/result';
import { storeToRefs } from 'pinia'

const resultStore = useResultStore();
const { mutatedResult, printHeader, resultModifiers } = storeToRefs(resultStore);

const faktorsAssignments = computed(() =>
    resultModifiers.value.faktors?.assignments || {}
);

function getOriginalResult(competitor) {
    const info = competitor.rankingResult;
    const value = info ? info.value : competitor.originalTotalScoreDecimal;
    const unit = info ? (info.unit === 'teiler' ? 'Teiler' : 'Ring') : 'Ring';
    return Number.isFinite(value) ? `${value} ${unit}` : '–';
}

function getDisplayResult(competitor) {
    const info = competitor.rankingResult;
    const value = info ? info.value : competitor.statistics.totalScoreDecimal;
    const unit = info ? (info.unit === 'teiler' ? 'Teiler' : 'Ring') : 'Ring';
    return Number.isFinite(value) ? `${value} ${unit}` : '–';
}

function setFaktorAssignment(fullName, type) {
    const isAlreadyAssigned = resultStore.resultModifiers.faktors.assignments[fullName] === type;
    resultStore.setFaktorAssignment(fullName, isAlreadyAssigned ? 'none' : type);
}

function joinSeriesCollectionScores(seriesCollections) {
    return seriesCollections
        .map(collection =>
            collection.statistics.ringValues
                .map(value => `<span>${value}</span>`)
                .join('')
        )
        .join('');
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

    .scoreboard__subtitle {
        font-size: 1.2rem;
    }
}

.scoreboard-group {
    .scoreboard-group__name {
        font-size: 1.4rem;
    }
}

.scoreboard__series-collection {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
}

.print-header { display: none; }

@media print {
    .print-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }
    .print-header__logo { width: 84px; height: auto; }
    .print-header__text { text-align: center; color: #000; }
    .print-header__title { font-size: 2rem; font-weight: 700; }
    .print-header__subtitle { font-size: 1.2rem; }

    .scoreboard__title,
    .scoreboard__subtitle { display: none; }

    .scoreboard-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8rem;
        color: #000;
    }
    .scoreboard-table th,
    .scoreboard-table td {
        border: 1px solid #000;
        padding: 0.2rem 0.4rem;
        background: #fff !important;
        color: #000 !important;
    }
    .scoreboard-table th.scoreboard__faktor-cell,
    .scoreboard-table td.scoreboard__faktor-cell { display: none; }
    .scoreboard-table thead th {
        background: #d9e2f3 !important;
        text-align: center;
        font-weight: 700;
    }
    .scoreboard-table tbody tr:nth-child(even) td { background: #f4f4f4 !important; }
    .scoreboard-table th:nth-child(1),
    .scoreboard-table td:nth-child(1) { text-align: center; }
    .scoreboard-table th:nth-child(5),
    .scoreboard-table td:nth-child(5) { text-align: left; }
    .scoreboard-table td:nth-child(7) { text-align: left; }
    .scoreboard-table tr { break-inside: avoid; }
}
</style>