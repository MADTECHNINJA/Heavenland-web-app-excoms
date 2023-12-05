<template>
    <div class="flex items-center">
        <span class="font-semibold text-gray-100">{{ data.itemName }}</span>
    </div>
</template>

<script lang="ts" setup>
    defineProps<{
        data: {
            itemName: string;
        };
    }>();
</script>

<style scoped></style>
