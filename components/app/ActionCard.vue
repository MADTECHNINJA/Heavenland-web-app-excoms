<template>
    <div
        :class="!transparent ? '  bg-black border border-cyan-950' : 'rounded-b-lg'"
        class="px-6 py-6  flex justify-center md:justify-start  flex md:space-x-5"
    >
        <AppSpinner color="text-purple-500" class="mr-2 md:mr-0" v-if="type === AlertType.LOADING" :size="6" />
        <FontAwesomeIcon
            v-else-if="icon"
            class="h-8 hidden md:block w-8 mt-3.5"
            :icon="[iconSet, icon]"
            :class="[iconColor]"
        />

        <div class="flex flex-col items-center md:items-start">
            <p class="font-bold lg:text-xl text-lg tracking-tight mt-1">
                <div class="flex md:block items-center">
                <FontAwesomeIcon
                    v-if="icon && type=== AlertType.INFO"
                    class="h-6 md:hidden w-8 mr-2"
                    :icon="[iconSet, icon]"
                    :class="[iconColor]"
                />
                <slot v-if="$slots['title']" name="title" />
                <span v-else-if="type === AlertType.LOADING">Data loading...</span>
                <span v-else>Error!</span>
            </div>
             
            </p>

            <p class="text-sm mt-1" :class="[type === AlertType.ERROR ? 'text-cyan-950' : 'text-cyan-950']">
                <slot name="desc" />
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { AlertType } from '~/types/Alert.utils';
    import { computed } from 'vue';

    const props = withDefaults(
        defineProps<{
            iconSet?: string;
            icon?: string;
            type: AlertType;
            transparent?: boolean;
        }>(),
        {
            iconSet: 'fas',
        }
    );

    const icon = computed(() => {
        switch (props.type) {
            case AlertType.INFO:
                return props.icon;

            default:
                return 'triangle-exclamation';
        }
    });

    const iconColor = computed(() => {
        switch (props.type) {
            case AlertType.ERROR:
                return 'text-purple-500';

            default:
                return 'text-purple-500';
        }
    });
</script>

<style scoped></style>
