<template>
    <AppAlert v-if="balanceStore.balanceSol.error" :text="ErrorMsg.CONNECTION_ERROR" :type="AlertType.ERROR" />

    <Popover v-else class="relative" v-slot="{ open, close }">
        <PopoverButton
            :class="[
                open ? 'text-gray-900' : 'text-gray-500',
                'group w-full  inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none ',
            ]"
        >
            <div class="md:bg-black border border-cyan-950 w-full bg-black flex text-cyan-950">
                <div class="flex w-full">
                    <div
                        class="px-4 w-full flex flex-col md:flex-row md:items-center space-x-0 md:space-x-6 space-y-3 md:space-y-0 py-3 md:py-2"
                    >
                        <AppSpinner v-if="!balanceStore.balanceGenz.fetched" class="px-2 py-0.5" />
                        <div v-else class="flex w-full justify-between md:justify-start items-center">
                            <div class="flex w-full">
                                <img :src="excomCurrency" alt="excom" class="h-5 rounded-full mr-2" />
                                <span class="font-semibold text-sm">
                                    {{ balanceStore.balanceGenz.getFormattedAmount() }}
                                </span>
                            </div>

                            <FontAwesomeIcon icon="chevron-down" class="h-3.5 ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </PopoverButton>

        <transition
            v-if="balanceStore.balanceGenz.fetched"
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
        >
            <PopoverPanel class="absolute z-50 left-1/2 transform -translate-x-1/2 mt-3 px-2 sm:px-0">
                <div class="drop-shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div class="grid">
                        <div
                            @click="close()"
                            class="col-span-1 w-fit relative flex flex-col bg-black border border-cyan-950 rounded-none text-white px-5 py-4"
                        >
                            <HeaderWalletBalance />
                        </div>
                    </div>
                </div>
            </PopoverPanel>
        </transition>
    </Popover>
</template>

<script lang="ts" setup>
    import { onMounted, watch } from 'vue';
    import { useWallet } from 'solana-wallets-vue';
    import { useBalanceStore } from '@/store/balances';
    import excomCurrency from '@/assets/currency/excom.png';
    import { AlertType } from '~/types/Alert.utils';
    import { ErrorMsg } from '@/locales/core';
    import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';

    const { publicKey } = useWallet();
    const balanceStore = useBalanceStore();

    const fetchBalances = () => {
        balanceStore.fetchBalances();
    };

    onMounted(fetchBalances);

    watch(publicKey, fetchBalances);
</script>

<style scoped></style>
