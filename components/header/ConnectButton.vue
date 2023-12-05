<template>
    <WalletMultiButton />
</template>

<script lang="ts" setup>
    import { WalletMultiButton } from 'solana-wallets-vue';
</script>

<style>
    @media (max-width: 767px) {
        .swv-dropdown,
        .swv-button-trigger {
            width: 100%;
            @apply bg-black;
        }
        .swv-button-trigger {
            @apply p-4 text-sm;
        }

        .swv-button-icon,
        .swv-button-icon img {
            @apply h-4 w-4;
        }
    }
</style>
