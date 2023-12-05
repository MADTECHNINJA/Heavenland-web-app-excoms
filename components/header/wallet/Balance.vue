<template>
    <p class="text-xs font-semibold tracking-normal">Wallet balance</p>

    <div class="flex flex-col bg-indigo-940 bg-opacity-30 py-2 px-0 pr-8 space-y-2 mt-2.5">
        <div class="flex items-center">
            <img :src="excomCurrency" alt="excom" class="h-5 rounded-full" />
            <span class="ml-1.5 font-semibold text-sm">
                {{ balanceStore.balanceGenz.getFormattedAmount() }}
            </span>
        </div>

        <div class="flex items-center">
            <img :src="solanaCurrency" alt="SOL" class="h-5 rounded-full" />
            <span class="ml-1.5 font-semibold text-sm">
                {{ balanceStore.balanceSol.getFormattedAmount() }}
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useBalanceStore } from '@/store/balances';
    import excomCurrency from '@/assets/currency/excom.png';
    import solanaCurrency from '@/assets/currency/solana.png';

    const balanceStore = useBalanceStore();
</script>

<style scoped></style>
