<template>
    <div class="scoring-view">
        <div class="scoring-sidebar">
            <CompetitorGrouping />
            <SeriesGrouping />
            <SeriesGroupCalculation />
        </div>
        <div class="scoring-table">
            <Scoreboard />
        </div>
    </div>
</template>

<script setup>
import Scoreboard from '../components/Scoreboard.vue';
import CompetitorGrouping from '../components/modifiers/CompetitorGrouping.vue';
import SeriesGrouping from '../components/modifiers/SeriesGrouping.vue';
import SeriesGroupCalculation from '../components/modifiers/SeriesGroupCalculation.vue';
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
}

.scoring-table {
    width: 100%;
}
</style>