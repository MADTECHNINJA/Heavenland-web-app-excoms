<template>
    <div class="bg-black py-2 px-4 flex items-center space-x-2.5">
        <FontAwesomeIcon :icon="[iconSet, icon]" class="h-3.5 w-3.5 text-white" />
        <p class="ml-4 text-sm font-semibold tracking-tight text-gray-200">{{ title }}</p>
    </div>
</template>

<script lang="ts" setup>
    withDefaults(
        defineProps<{
            title: string;
            icon: string;
            iconSet: string;
        }>(),
        {
            iconSet: 'fad',
        }
    );
</script>

<style scoped></style>
