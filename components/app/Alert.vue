<template>
    <div v-if="text" class="px-4 py-2" :class="[color.bg]">
        <div class="flex">
            <div class="flex-shrink-0 flex">
                <FontAwesomeIcon :icon="icon" class="h-5 w-5" :class="[color.color]" aria-hidden="true" />
            </div>
            <div class="ml-2 flex-1 md:flex md:flex-wrap md:justify-between tracking-tight">
                <p class="text-sm font-semibold" :class="[color.color]">{{ text }}</p>
                <p class="mt-3 text-sm md:mt-0 md:ml-6" v-if="button">
                    <a href="#" class="whitespace-nowrap font-medium" :class="[color.color, color.hover]">
                        {{ buttonText }}
                    </a>
                </p>
                <div v-if="desc" class="mt-2 text-sm basis-full" :class="[color.color]">
                    <p>
                        {{ desc }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import type { ComputedRef } from 'vue';
    import { AlertType } from '~/types/Alert.utils';

    const props = withDefaults(
        defineProps<{
            text?: string;
            button?: boolean;
            buttonText?: string;
            type?: AlertType;
            desc?: string;
        }>(),
        {
            button: false,
            buttonText: '',
            type: AlertType.INFO,
        }
    );

    const icon = computed(() => {
        switch (props.type) {
            case AlertType.INFO:
                return 'circle-info';
            case AlertType.ERROR:
                return 'triangle-exclamation';
            case AlertType.WARNING:
                return 'circle-exclamation';

            default:
                return 'circle-info';
        }
    });

    type ColorSet = { color: string; bg: string; hover: string };

    const color: ComputedRef<ColorSet> = computed(() => {
        switch (props.type) {
            case AlertType.INFO:
                return { color: 'text-indigo-700', bg: 'bg-black', hover: 'hover:text-indigo-600' };
            case AlertType.ERROR:
                return { color: 'text-red-600', bg: 'bg-black', hover: 'hover:text-red-500' };
            case AlertType.WARNING:
                return { color: 'text-yellow-700', bg: 'bg-black', hover: 'hover:text-yellow-600' };

            default:
                return { color: 'text-indigo-700', bg: 'bg-indigo-50', hover: 'hover:text-indigo-600' };
        }
    });
</script>

<style scoped></style>
