<template>
    <div
        class="bg-black border border-b-transparent border-cyan-950 flex-col text-white text-xs justify-center flex items-center px-3 py-3"
    >
        <AppAlert v-if="error" :text="ErrorMsg.FETCHING_ERROR" />

        <AppSpinner v-else-if="!fetched" />

        <div class="flex flex-col items-center" v-else>
            <!--  <AppTooltip :disabled="!isFinished"> -->
            <!--   <template #text>
                    <div class="flex items-center space-x-2">
                        <FontAwesomeIcon icon="circle-check" class="text-green-500" />
                        <p>NFT staking finished</p>
                    </div>
                </template> -->

            <div class="w-[125px] flex items-center w-full justify-center">
                <!--   <FontAwesomeIcon v-if="!isFinished" :icon="['fad', 'coin-vertical']" />
                <FontAwesomeIcon v-else icon="circle-check" class="text-green-500" /> -->
                <div class="w-full bg-purple-500 h-1.5 mx-2 overflow-clip">
                    <div
                        class="bg-gradient-to-r from-cyan-600 to-cyan-950 h-1.5"
                        :class="[isFinished ? 'from-green-600 to-green-700' : 'from-cyan-600 to-cyan-950']"
                        :style="{ width: stakingPercentage + '%' }"
                    ></div>
                </div>
                <span class="font-semibold text-xs">{{ stakingPercentage.toFixed(2) }}%</span>
            </div>
            <!--   </AppTooltip> -->
            <div class="flex justify-center mt-3">
                <span class="text-gray-300">Staked</span>
                <span class="font-bold ml-2 mr-1"
                    >{{ formatNumberToDecimal(currentStake) }} / {{ formatNumberToDecimal(maxStake) }}</span
                >
                <img alt="Solana" :src="excomCurrency" class="h-4 rounded-full" />
            </div>
        </div>
    </div>
    <div
        class="flex-col bg-cyan-950 border border-t-transparent border-cyan-950 text-black text-xs justify-center flex items-center px-3 mb-1 py-2"
    >
        <div class="flex justify-start">
            <span class="text-black font-semibold">Estimated reward</span>
            <span class="font-bold ml-2 mr-1">{{ formatNumberToDecimal(reward) }}</span>
            <img alt="Solana" :src="excomCurrency" class="h-4 rounded-full" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import excomCurrency from 'assets/currency/excom.png';
    import { formatNumberToDecimal } from '~/js/formatting';
    import { ErrorMsg } from '~/locales/core';
    import { computed } from 'vue';

    const props = defineProps<{
        error: boolean;
        fetched: boolean;
        reward: number;
        currentStake: number;
        maxStake: number;
        stakings: {
            amount: number;
            tier: number;
            stakedTime: number;
            endTime: number;
            claimedTime: number;
            index: number;
            earned: number;
        }[];
    }>();

    const stakingPercentage = computed(() => {
        return (props.currentStake / props.maxStake) * 100;
    });

    const allStakesCount = computed(() => {
        return props.stakings.length;
    });

    const now = Math.floor(Date.now() / 1000);

    const finishedStakesCount = computed(() => {
        return props.stakings.filter((s) => s.endTime <= now).length;
    });

    const isFinished = computed(() => {
        return finishedStakesCount.value >= allStakesCount.value;
    });
</script>

<style scoped></style>
