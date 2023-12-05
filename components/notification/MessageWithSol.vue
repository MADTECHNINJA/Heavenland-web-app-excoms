<template>
    <div class="flex items-center">
        <span class="mr-1.5">{{ data.amountPrefix }}</span>

        <span class="font-semibold text-gray-100">{{ data.amount }}</span>
        <img :src="solCurrency" alt="SOL" class="h-3 ml-1 rounded-full inline-block" />
    </div>
</template>

<script lang="ts" setup>
    import solCurrency from '@/assets/currency/solana.png';

    defineProps<{
        data: {
            amountPrefix: string;
            amount: number;
        };
    }>();
</script>

<style scoped></style>
