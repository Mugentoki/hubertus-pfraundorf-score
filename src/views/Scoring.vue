<template>
    <div class="scoring-view">
        <div class="scoring-sidebar">
            <PrintHeader />
            <CompetitorGrouping />
            <SeriesGrouping />
            <SeriesGroupCalculation />
            <Ranking />
            <Faktors />
            <button type="button" class="print-button" @click="printScoreboard">Auswertung drucken</button>
        </div>
        <div class="scoring-table">
            <Scoreboard />
        </div>
    </div>
</template>

<script setup>
import Scoreboard from '../components/Scoreboard.vue';
import PrintHeader from '../components/modifiers/PrintHeader.vue';
import CompetitorGrouping from '../components/modifiers/CompetitorGrouping.vue';
import SeriesGrouping from '../components/modifiers/SeriesGrouping.vue';
import SeriesGroupCalculation from '../components/modifiers/SeriesGroupCalculation.vue';
import Ranking from '../components/modifiers/Ranking.vue';
import Faktors from '../components/modifiers/Faktors.vue';

function printScoreboard() {
    window.print();
}
</script>

<style>
.scoring-view {
    width: 100%;
    height: 100%;
    display: flex;
}

.scoring-sidebar {
    min-width: 350px;
    border-right: 4px solid var(--ui-border-color);
    background-color: rgba(0,0,0,.25);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
}

.scoring-table {
    width: 100%;
}

.print-button {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: var(--app-highlight-color);
    color: var(--default-text-color);
    border: none;
    border-radius: var(--corner-default);
    font-size: var(--font-normal);
    font-weight: 700;
    cursor: pointer;
}

@media print {
    html, body, #app {
        height: auto !important;
        width: auto !important;
        background: #fff !important;
    }
    .scoring-view { display: block; height: auto; }
    .scoring-sidebar { display: none !important; }
    .scoring-table { width: auto; }
    .scoreboard { padding: 0; }
    .scoreboard__title { display: none; }
}
</style>