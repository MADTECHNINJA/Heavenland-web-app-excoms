<template>
    <Popper hover :disabled="disabled">
        <slot />

        <template #content>
            <slot v-if="$slots.text" name="text" />
            <span
                :class="[wrap && 'whitespace-nowrap', center && 'w-full flex justify-center text-center']"
                v-else
                v-html="text"
            />
        </template>
    </Popper>
</template>

<script lang="ts" setup>
    import Popper from 'vue3-popper';

    defineProps<{
        text: string;
        center?: boolean;
        wrap?: boolean;
        disabled?: boolean;
    }>();
</script>

<style lang="postcss">
    div.popper {
        @apply text-xs;
    }
</style>

<style>
    :root {
        --popper-theme-background-color: #333333;
        --popper-theme-background-color-hover: #333333;
        --popper-theme-text-color: #ffffff;
        --popper-theme-border-width: 0px;
        --popper-theme-border-style: solid;
        --popper-theme-border-radius: 6px;
        --popper-theme-padding: 8px;
        --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
    }
</style>
