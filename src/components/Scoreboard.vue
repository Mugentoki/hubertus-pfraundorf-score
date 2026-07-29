<template>
    <div class="scoreboard">
        <table class="scoreboard-table">
            <thead>
                <tr>
                    <th>Platz</th>
                    <th>Name</th>
                    <th>Ergebnis</th>
                    <th>Einzelergebnisse</th>
                </tr>
            </thead>
            <tbdoy>
                <tr>
                    <th>1</th>
                    <th>Jemand</th>
                    <th>1000 Ring</th>
                    <th>98 80 93 48</th>
                </tr>
            </tbdoy>
        </table>
    </div>
</template>

<script setup>
import { useResultStore } from '../stores/result';
import { storeToRefs } from 'pinia'

const resultStore = useResultStore();
const { mutatedResult } = storeToRefs(resultStore);
</script>

<style>
.scoreboard,
.scoreboard-table {
    width: 100%;
}
</style>