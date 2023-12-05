<template>
    <div
        class="bg-cyan-950 border border-cyan-950 text-black text-xs justify-center flex items-center px-3 mb-1 py-2.5"
        :class="{ 'opacity-50': disabled }"
    >
        <AppAlert v-if="error" :text="ErrorMsg.FETCHING_ERROR" />

        <AppSpinner v-else-if="!fetched" />

        <div v-else class="flex justify-center font-bold">
            Max stake <span class="font-bold ml-1 mr-1">{{ formatNumberToDecimal(maxStake) }}</span>
            <img alt="Solana" :src="excomCurrency" class="h-4 rounded-full" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import excomCurrency from 'assets/currency/excom.png';
    import { ErrorMsg } from '~/locales/core';
    import { formatNumberToDecimal } from '~/js/formatting';

    defineProps<{
        maxStake: number;
        disabled?: boolean;
        error: boolean;
        fetched: boolean;
    }>();
</script>

<style scoped></style>
