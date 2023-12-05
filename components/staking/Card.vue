<template>
    <div
        class="relative bg-black border flex flex-col border-cyan-950 w-full shadow not:disabled:cursor-pointer transition-all"
        :class="[
            { 'rounded-b-lg': !hasExtension },
            { 'opacity-75 cursor-auto': disabled },
            tier >= 3 && currentRoute.path === '/upgrade' && 'brightness-75',
        ]"
    >
        <div class="px-3 py-5 bg-black border-t-transparent flex flex-col items-center">
            <div class="flex items-center h-12">
                <h2 class="text-sm leading-6 font-semibold text-gray-100">
                    {{ item.name }}
                </h2>
            </div>
            <div v-if="currentRoute.path === '/staking' && !idle" class="flex flex-col md:flex-row md:items-center">
                <span class="text-sm text-cyan-950 font-semibold md:mr-2">Reward</span>

                <div class="flex items-center w-full flex-nowrap">
                    <div class="font-bold text-sm mr-1.5">~ {{ formattedEarnedAmount }}</div>
                    <img alt="Excom" :src="excomCurrency" class="h-5 mb-0.5" />
                </div>
            </div>
        </div>
        <div class="relative">
            <div
                class="aspect-square bg-black border border-cyan-950 overflow-hidden"
                :class="{ 'animate-pulse': item.image && !loaded }"
            >
                <img
                    v-if="item.image"
                    v-lazy="{ src: lazyOptions.src, lifecycle: lazyOptions.lifecycle }"
                    :class="{ 'opacity-0': !loaded }"
                    :alt="item.name"
                />

                <div v-else>
                    <FontAwesomeIcon
                        icon="image-slash"
                        class="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
                    />
                </div>
            </div>

            <img
                v-if="!item.image || loaded"
                :src="item.image"
                alt="Frozen NFT"
                class="absolute border-b border-cyan-950 top-0 left-0 rounded-t-lg"
                :class="[!item.image ? 'opacity-25' : 'opacity-50']"
            />
        </div>
        <div :class="tier >= 3 ? 'flex justify-center items-center' : 'mb-2'" v-if="currentRoute.path === '/upgrade'">
            <div class="px-6 flex justify-center items-center py-2">
                <p v-if="tier < 3" class="mt-2 text-xs flex items-center text-left font-semibold text-gray-300">
                    Upgrade price: <span class="text-purple-500 ml-1.5">{{ upgradePrice }}</span>
                    <img :src="excomCurrency" alt="excom" class="h-4 ml-1 rounded-full" />
                </p>

                <p v-else class="my-2 text-xs text-purple-500 text-center flex items-center text-left font-semibold">
                    You have reached the maximum tier.
                </p>
            </div>
            <div v-if="tier < 3" class="w-full flex justify-center">
                <AppButton
                    :disabled="isLoading || upgradePrice > balanceStore.balanceGenz.getUnformattedAmount()"
                    :loading="isLoading"
                    class="w-full mt-2 mx-2"
                    @click="upgradeNft"
                >
                    <span class="text-red-500" v-if="upgradePrice > balanceStore.balanceGenz.getUnformattedAmount()"
                        >Not enough GENZ.</span
                    >
                    <span v-else> Upgrade </span>
                </AppButton>
            </div>
            <div v-else class="h-[92px]" />
        </div>
        <div v-else>
            <div class="px-6 py-2">
                <p class="mt-2 text-xs text-left font-semibold text-gray-300">
                    Staking period: <span class="text-purple-500 ml-1">30 days</span>
                </p>

                <p v-if="!idle && timeNow < endOfStake" class="mt-2 text-xs text-left flex font-semibold text-gray-300">
                    <AppCountdown @timer="refreshTime" :futureDate="endOfStake" />
                </p>
                <p v-else-if="!idle" class="mt-2 text-xs text-left flex font-semibold text-cyan-950">FINISHED</p>
            </div>

            <div v-if="!idle && timeNow < endOfStake" class="w-full mb-2 px-2 flex flex-col items-center">
                <AppButton
                    :disabled="isLoading || isLoadingRestake || isLoadingWithdraw"
                    :loading="isLoading"
                    class="w-full mt-2"
                    @click="claim(false, true)"
                >
                    Claim
                </AppButton>
            </div>

            <div v-if="idle" class="w-full mb-2 px-2 flex flex-col items-center">
                <AppButton
                    :disabled="isLoading || isLoadingRestake || isLoadingWithdraw"
                    :loading="isLoading"
                    class="w-full mt-2"
                    @click="stake"
                >
                    Stake
                </AppButton>
            </div>
            <div v-if="!idle && timeNow > endOfStake" class="w-full flex-col mb-2 mt-2 flex justify-center">
                <AppButton
                    :disabled="isLoading || isLoadingRestake || isLoadingWithdraw"
                    class="mx-2"
                    @click="claim(true)"
                    :loading="isLoadingRestake"
                >
                    Restake
                </AppButton>

                <AppSecondaryButton
                    :disabled="isLoading || isLoadingRestake || isLoadingWithdraw"
                    class="mx-2 mt-2"
                    @click="claim(false)"
                    :loading="isLoadingWithdraw"
                >
                    Withdraw
                </AppSecondaryButton>
            </div>
        </div>

        <slot />
    </div>
</template>

<script lang="ts" setup>
    import { RouteLocationRaw } from 'vue-router';
    import { computed, onMounted, reactive, ref } from 'vue';
    import { IStakable } from '~/types/Staking.types';
    import { logger } from '~/plugins/logger.client';
    import { formatNumberToDecimal } from '~/js/formatting';
    import { NotificationManager } from '~/types/NotificationManager.types';
    import { NotificationTitles } from '~/types/Notification.data';
    import { Variant } from '~/types/Notification.types';
    import { getTxSolscanUrl } from '~/js/url';
    import { Metaplex } from '~/js/metaplex';
    import { NotificationMessageWithGenz, NotificationMessageWithItem } from '#components';
    import { useRefreshStakes } from '~/composables/useStake';
    import { Upgrader } from '~/js/upgrader';
    import { Staking } from '~/js/staking';
    import excomCurrency from '@/assets/currency/excom.png';
    import { useUserInfo } from '~/store/staking/userPool';
    import { useRoute } from '#app';
    import { useBalanceStore } from '~/store/balances';
    import * as web3 from '@solana/web3.js';
    const userInfoStore = useUserInfo();

    const currentRoute = useRoute();
    const balanceStore = useBalanceStore();

    onMounted(async () => {
        if (currentRoute.path === '/upgrade') {
            emit('value-updated', true);
        }
    });

    const timeNow = ref(new Date().getTime() / 1000);

    const props = defineProps<{
        idle?: boolean;
        item: IStakable;
        selectable?: boolean;
        bottomRounded?: boolean;
        disabled?: boolean;
        hasExtension: boolean;
        cardRedirect?: (item: IStakable) => RouteLocationRaw;
    }>();

    const emit = defineEmits<{
        (event: 'value-updated', boolean): void;
    }>();

    const isLoading = ref(false);
    const isLoadingWithdraw = ref(false);
    const isLoadingRestake = ref(false);

    const formattedEarnedAmount = computed(() => {
        return formatNumberToDecimal(
            userInfoStore.activeStakings.data?.[props.item.mint]?.earned / 1_000_000_000,
            true
        );
    });

    const endOfStake = computed(() => {
        return userInfoStore.activeStakings.data?.[props.item.mint]?.endTime;
    });

    const refreshTime = () => {
        setTimeout(() => (timeNow.value = new Date().getTime() / 1000), 1000);
    };

    const tier = computed(() => {
        return props.item?.attributes.find((item) => item.displayName === 'Tier').value;
    });

    const upgradePrice = computed(() => {
        switch (Number(props.item?.attributes.find((item) => item.displayName === 'Tier').value)) {
            case 0:
                return 2000;
            case 1:
                return 4000;
            case 2:
                return 10000;
            default:
                return 0;
        }
    });

    const upgradeNft = async () => {
        isLoading.value = true;

        const notification = NotificationManager.getInstance().create({
            title: NotificationTitles.UPGRADE_CREATE,
            message: {
                component: NotificationMessageWithGenz,
                data: {
                    amountPrefix: 'Upgrading for',
                    amount: formatNumberToDecimal(upgradePrice.value),
                },
            },
            variant: Variant.LOADING,
        });

        try {
            const tx = await Upgrader.getInstance().initUpgrade({
                excomMint: new web3.PublicKey(props.item.mint),
                depositAmount: upgradePrice.value,
            });
            const txSig = await Metaplex.getInstance().sendTransaction(tx);

            /*    notification.link = {
                name: 'View',
                href: getTxSolscanUrl(txSig),
            }; */

            notification.additionalInfo = 'Confirming transaction';
            await Metaplex.getInstance().confirmTransaction(txSig);

            notification.setSuccess('Transaction was successful');

            emit('value-updated', true);

            await useRefreshStakes();

            isLoading.value = false;
        } catch (e) {
            logger.error(e);
            notification.setError(e.code === 4001 ? 'Transanction cancelled' : 'Transaction failed');
        } finally {
            isLoading.value = false;
        }
    };

    const stake = async () => {
        isLoading.value = true;

        const notification = NotificationManager.getInstance().create({
            title: NotificationTitles.STAKE_CREATE,
            message: {
                component: NotificationMessageWithItem,
                data: {
                    itemName: 'Staking NFT',
                },
            },
            variant: Variant.LOADING,
        });

        try {
            const tx = await Staking.getInstance().stake(new web3.PublicKey(props.item.mint));

            const txSig = await Metaplex.getInstance().sendTransaction(tx);

            /*   notification.link = {
                name: 'View',
                href: getTxSolscanUrl(txSig),
            }; */

            notification.additionalInfo = 'Confirming transaction';
            await Metaplex.getInstance().confirmTransaction(txSig);

            notification.setSuccess('Transaction was successful');
            isLoading.value = false;

            await useRefreshStakes();
        } catch (e) {
            logger.error(e);

            notification.setError(e.code === 4001 ? 'Transanction cancelled' : 'Transaction failed');

            isLoading.value = false;
        }
    };

    const claim = async (restake: boolean, claimOperation = false) => {
        if (restake) {
            isLoadingRestake.value = true;
        } else {
            isLoadingWithdraw.value = true;
        }

        const notification = NotificationManager.getInstance().create({
            title: restake ? NotificationTitles.STAKE_RESTAKE : NotificationTitles.STAKE_CLAIM,
            variant: Variant.LOADING,
            message: {
                component: NotificationMessageWithGenz,
                data: {
                    amountPrefix: 'Reward ',
                    amount: restake ? 0 : formattedEarnedAmount.value,
                },
            },
        });

        try {
            let tx = null;
            if (claimOperation) {
                tx = await Staking.getInstance().claim(new web3.PublicKey(props.item.mint));
            } else {
                tx = await Staking.getInstance().withdraw(new web3.PublicKey(props.item.mint), restake);
            }
            const txSig = await Metaplex.getInstance().sendTransaction(tx);

            /*     notification.link = {
                name: 'View',
                href: getTxSolscanUrl(txSig),
            }; */
            notification.additionalInfo = 'Confirming transaction';
            await Metaplex.getInstance().confirmTransaction(txSig);

            notification.setSuccess('Transaction was successful');

            if (restake) {
                isLoadingRestake.value = false;
            } else {
                isLoadingWithdraw.value = false;
            }

            await useRefreshStakes();
            emit('value-updated', true);
        } catch (e) {
            logger.error(e);

            notification.setError(e.code === 4001 ? 'Transanction cancelled' : 'Transaction failed');

            if (restake) {
                isLoadingRestake.value = false;
            } else {
                isLoadingWithdraw.value = false;
            }
        }
    };

    const loaded = ref(false);

    const lazyOptions = reactive({
        src: props.item.image,
        lifecycle: {
            loading: () => {
                loaded.value = false;
            },
            loaded: () => {
                loaded.value = true;
            },
        },
    });
</script>

<style scoped></style>
