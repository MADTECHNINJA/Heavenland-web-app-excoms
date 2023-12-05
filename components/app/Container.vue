<template>
    <div :class="route.path !== '/' && 'text-center md:text-left w-full flex flex-col max-w-[88rem] mx-auto'">
        <slot />
    </div>
</template>

<script lang="ts" setup>
    import { useRoute } from '#app';

    const route = useRoute();
</script>

<style scoped></style>
