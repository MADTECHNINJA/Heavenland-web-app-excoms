<template>
    <o-switch :value="modelValue" @change="$emit('update:modelValue', isSwitched)" v-model="isSwitched">
        <slot v-if="$slots['title']" name="title"></slot>
        <span v-else>{{ title }}</span></o-switch
    >
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    const props = defineProps<{
        title?: string;
        modelValue: boolean;
    }>();

    const isSwitched = ref(false);
</script>

<style></style>
