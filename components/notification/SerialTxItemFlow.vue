<template>
    <div class="flex flex-col gap-y-1">
        <div v-for="(step, index) in data.steps" :key="index" class="text-sm flex items-center">
            <AppSpinner v-if="step.processing && !step.finished" class="mr-2" :size="3.5" />
            <FontAwesomeIcon
                v-else
                :icon="['far', getIcon(step.finished)]"
                class="h-3.5 w-3.5 mr-2"
                :class="[getIconColor(step.finished)]"
            />
            <div class="inline-block w-6 mr-1 text-[0.825rem] text-gray-300">
                {{ index + 1 }}/{{ data.steps.length }}
            </div>
            <span class="font-semibold text-[0.825rem]">{{ step.name }}</span>

            <div v-if="step.link" class="ml-3 text-xs">
                <NuxtLink :to="step.link.href" target="_blank">
                    <span class="mt-1 hyperlink text-sm text-white" />
                    <img :src="solscanLogo" alt="Solscan" class="mb-0.5 h-3 w-3 inline-block mr-1" />
                    <span class="hyperlink"> {{ step.link.name }}</span>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { NotificationStepsData } from '~/types/Notification.types';
    import solscanLogo from '@/assets/logo/solscan.png';

    defineProps<{
        data: NotificationStepsData;
    }>();

    const getIcon = (finished: boolean) => {
        if (finished) {
            return 'circle-check';
        }

        return 'circle-dashed';
    };

    const getIconColor = (finished: boolean) => {
        if (finished) {
            return 'text-purple-500';
        }

        return 'text-gray-300';
    };
</script>

<style scoped></style>
