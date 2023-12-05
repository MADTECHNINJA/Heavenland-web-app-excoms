<template>
    <div class="flex flex-col gap-y-4 pt-1">
        <div v-for="(stakes, _, index) in data.stakes" :key="index" class="text-xs flex flex-col">
            <div class="inline-block mr-1">
                <p class="text-gray-300">
                    <span class="w-8" :class="[data.stakes?.length > 10 ? 'w-8' : 'w-6']">
                        {{ index + 1 }}/{{ Object.keys(data.stakes).length }}
                    </span>
                    <span class="font-semibold text-gray-100 ml-1.5">
                        {{ stakes.name }}
                    </span>
                    <span class="mx-1">for</span>
                    <span v-if="stakes.totalClaimFormatted" class="font-semibold text-gray-100"
                        >{{ stakes.totalClaimFormatted }}
                    </span>
                    <img :src="excomCurrency" alt="excom" class="h-3.5 ml-1 mb-1 rounded-full inline-block" />
                </p>
            </div>
            <div v-for="stake in stakes.stakes" :key="stake.claim" class="ml-3 mt-1 text-xs flex items-center">
                <div class="flex items-center">
                    <AppSpinner
                        v-if="stake.state === ParallelDataState.PROCESSING || getIcon(stake.stake) === 'spinner'"
                        class="h-4 w-3 mr-1.5"
                    />
                    <FontAwesomeIcon
                        v-else
                        :icon="['far', getIcon(stake.state)]"
                        class="h-3.5 w-3.5 mr-2"
                        :class="[getIconColor(stake.state)]"
                    />

                    <p class="text-gray-300">
                        Claiming <span class="font-semibold">{{ stake.claim }}</span>
                    </p>
                    <img :src="excomCurrency" alt="excom" class="h-3.5 ml-1 rounded-full inline-block" />

                    <NuxtLink v-if="stake.link" :to="stake.link.href" target="_blank" class="ml-3">
                        <span class="mt-1 hyperlink text-sm text-white" />
                        <img :src="solscanLogo" alt="Solscan" class="mb-0.5 h-2.5 w-2.5 inline-block mr-1" />
                        <span class="hyperlink"> {{ stake.link.name }}</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import solscanLogo from '@/assets/logo/solscan.png';
    import { NotificationStakesClaimData } from '~/types/Notification.types';
    import { ParallelDataState } from '~/types/Notification.types';
    import excomCurrency from '@/assets/currency/excom.png';

    defineProps<{
        data: NotificationStakesClaimData;
    }>();

    const getIcon = (state: ParallelDataState) => {
        switch (state) {
            case ParallelDataState.FINISHED:
                return 'check';

            case ParallelDataState.ERROR:
                return 'times';

            default:
                return 'spinner';
        }
    };

    const getIconColor = (state: ParallelDataState) => {
        switch (state) {
            case ParallelDataState.FINISHED:
                return 'text-purple-500';

            case ParallelDataState.ERROR:
                return 'text-red-500';

            default:
                return 'text-gray-500';
        }
    };
</script>

<style scoped></style>
