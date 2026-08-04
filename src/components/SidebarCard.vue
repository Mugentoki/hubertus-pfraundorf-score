<template>
    <div class="sidebar-card">
        <strong class="sidebar-card__title">{{ title }}</strong>
        <div class="sidebar-card__body">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String
})
</script>

<style>
.sidebar-card {
    width: 100%;
    padding: 0.5rem;
    background-color: var(--ui-background-color);
    border-radius: var(--corner-default);
    border: 2px solid var( --ui-border-color);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>