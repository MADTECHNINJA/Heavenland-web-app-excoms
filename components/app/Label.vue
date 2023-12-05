<template>
    <p :class="secondary ? 'text-xs text-gray-300' : 'text-sm font-semibold mb-2'">{{ title }}</p>
</template>

<script lang="ts" setup>
    const props = defineProps<{
        title: string;
        secondary?: boolean;
    }>();
</script>

<style scoped></style>
