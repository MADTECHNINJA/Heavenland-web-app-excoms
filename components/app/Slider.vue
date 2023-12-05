<template>
    <div>
        <div v-if="max !== min" class="flex w-full items-center justify-between">
            <span class="text-purple-500 text-opacity-80 text-xs mt-0.5">{{ min }}</span>
            <span class="text-cyan-950 text-sm border-opacity font-medium px-6 py-1">
                {{ value }}
            </span>
            <span class="text-opacity-80 text-xs text-purple-500 mt-0">{{ max }}</span>
        </div>
        <div class="flex justify-center w-full" v-else>
            <span
                class="text-purple-500 border-opacity-10 border font-medium border-white px-6 py-1 text-opacity-80 text-xs mt-0.5"
                >{{ min }}</span
            >
        </div>
        <o-slider
            v-if="max !== min"
            class="mx-1"
            :step="step"
            :min="min"
            :max="max"
            v-model="slider"
            :value="modelValue"
            @change="$emit('update:modelValue', $event)"
        >
        </o-slider>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed, watch } from 'vue';

    const props = withDefaults(
        defineProps<{
            min?: number;
            max?: number;
            step?: number;
            range?: boolean;
            modelValue?: Array<number> | number;
        }>(),
        { range: false, step: 1, min: 0, max: 100 }
    );
    const slider = ref();

    const value = computed(() => {
        return slider.value && slider.value.length ? `${slider.value[0]}-${slider.value[1]}` : slider.value;
    });

    onMounted(() => {
        slider.value = props.modelValue;
    });
    watch(
        () => props.modelValue,
        () => {
            slider.value = props.modelValue;
        }
    );
</script>
