<template>
    <AppTooltip>
        <div class="rounded-full items-center pr-2 py-0.5 flex space-x-1 bg-gray-800 mt-0.5">
            <FontAwesomeIcon :icon="['fad', 'info-circle']" class="h-4 w-4 text-white" />
            <span class="text-xs text-gray-200 tracking-tight"> {{ title }} </span>
        </div>

        <template #text>
            <slot />
        </template>
    </AppTooltip>
</template>

<script lang="ts" setup>
    defineProps<{
        title: string;
    }>();
</script>

<style scoped></style>
