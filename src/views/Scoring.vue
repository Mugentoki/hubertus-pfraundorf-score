<template>
    <div class="scoring-view">
        <div class="scoring-sidebar"></div>
        <div class="scoring-table">
            <Scoreboard />
        </div>
    </div>
</template>

<script setup>
import Scoreboard from '../components/Scoreboard.vue';
</script>

<style>
.scoring-view {
    width: 100%;
    height: 100%;
    display: flex;
}

.scoring-sidebar {
    min-width: 350px;
    border-right: 4px solid black;
    background-color: rgba(0,0,0,.25);
}

.scoring-table {
    width: 100%;
}
</style>