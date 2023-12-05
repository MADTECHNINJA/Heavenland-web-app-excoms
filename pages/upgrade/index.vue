<template>
    <AppContainer>
        <AppTitle class="text-purple-500 md:text-left">Upgrade</AppTitle>
        <div class="flex flex-col lg:grid grid-cols-12 gap-x-9 gap-y-6">
            <div class="col-span-12">
                <AppAlert
                    v-if="globalData.error()"
                    class="mt-9"
                    :text="ErrorMsg.CONNECTION_ERROR"
                    :type="AlertType.ERROR"
                />

                <AppActionCard class="mt-6" v-if="!hasConnectedWallet" :type="AlertType.ERROR">
                    <template #title>Wallet not connected.</template>
                    <template #desc> Connect your wallet to gain access.</template>
                </AppActionCard>

                <div v-else class="mt-6">
                    <AppActionCard v-if="userData.error() || globalData.error()" :type="AlertType.ERROR">
                        <template #desc> An error occurred when fetching data.</template>
                    </AppActionCard>

                    <AppActionCard v-else-if="!userData.fetched() || !nftInfo.fetched()" :type="AlertType.LOADING">
                        <template #title> Loading ..</template>
                        <template #desc> Be patient please. </template>
                    </AppActionCard>

                    <div v-else-if="userData.fetched() && !stakingItems?.length && !operations?.length">
                        <AppActionCard :type="AlertType.INFO" class="mt-6">
                            <template #title>No items!</template>
                            <template #desc> You don't have any Excom NFT.</template>
                        </AppActionCard>
                    </div>

                    <div v-else>
                        <!--      <ParcelContainerSkeleton v-if="!areAllCollectionsFetched" /> -->

                        <StakingIdleContainer
                            @value-updated="updateOperations"
                            v-if="areAllCollectionsFetched"
                            :items="stakingItems"
                            :operations="operations"
                            :card-redirect="cardRedirectTo"
                            :disabled="!userData.data()"
                            :custom-sort="sortByMaxStakeAmount"
                        >
                        </StakingIdleContainer>
                    </div>
                </div>
            </div>
        </div>
    </AppContainer>
</template>

<script lang="ts" setup>
    import { useAccountStore } from '~/store/account';
    import { useGlobalInfo } from '~/store/staking/global';
    import { useUserInfo } from '@/store/staking/userPool';
    import { mapState } from 'pinia';
    import { IParcelBase, ParcelBase } from '~/types/Parcel.types';
    import { IStakable } from '~/types/Staking.types';
    import { computed, onMounted, watch, ref } from 'vue';
    import { useWallet } from 'solana-wallets-vue';
    import { Upgrader } from '~~/js/upgrader';
    import { AlertType } from '~/types/Alert.utils';
    import { ErrorMsg } from '~/locales/core';
    import { useRoute } from '#app';

    const accountStore = useAccountStore();
    const currentRoute = useRoute();
    const { publicKey } = useWallet();

    const areAllCollectionsFetched = computed(() => {
        return Object.values(accountStore.getStakingTokenCollections).every((sc) => sc.fetched);
    });

    const operations = ref(null);

    const updateOperations = async () => {
        if (currentRoute.path === '/upgrade') {
            operations.value = await Upgrader.getInstance().getOperations();
        }
    };

    onMounted(() => {
        if (publicKey.value) {
            updateOperations();
        }
    });

    watch(publicKey, updateOperations);

    const stakingCollection = ref(Object.values(accountStore.getStakingTokenCollections));

    const stakingItems = computed(() => {
        return stakingCollection.value
            .reduce((acc, item) => {
                return [...acc, ...item.data];
            }, [])
            .sort((a, b) => {
                return a?.attributes.find((atr) => atr.displayName === 'Tier').value >
                    b?.attributes.find((atr) => atr.displayName === 'Tier').value
                    ? 1
                    : -1;
            });
    });

    const globalData = computed(() => {
        return mapState(useGlobalInfo, {
            fetched: (store) => store.global.fetched,
            error: (store) => store.global.error,
            data: (store) => store.global.data,
        });
    });

    const userData = computed(() => {
        return mapState(useUserInfo, {
            fetched: (store) => store.user.fetched,
            error: (store) => store.user.error,
            data: (store) => store.user.data,
            hasInitializedPool: (store) => store.hasInitializedPool,
            activeStakings: (store) => store.activeStakings,
        });
    });

    const nftInfo = computed(() => {
        return mapState(useUserInfo, {
            fetched: (store) => store.nftInfo.fetched,
            error: (store) => store.nftInfo.error,
            data: (store) => store.nftInfo.data,
        });
    });

    const hasConnectedWallet = computed(() => {
        return publicKey.value;
    });

    const cardRedirectTo = (item: ParcelBase) => {
        return {
            name: 'staking-id',
            params: { id: item.mint },
        };
    };

    const globalInfoStore = useGlobalInfo();

    const sortByMaxStakeAmount = (a: IStakable, b: IStakable) => {
        const aMaxStake = getMaxStakeAmount(a) ?? 0;
        const bMaxStake = getMaxStakeAmount(b) ?? 0;

        if (Number.isNaN(aMaxStake)) {
            return 1;
        } else if (Number.isNaN(bMaxStake)) {
            return -1;
        }

        return aMaxStake > bMaxStake ? -1 : 1;
    };

    const getMaxStakeAmount = (item: IStakable | IParcelBase) => {
        return nftInfo.value.data()?.find((n) => n.tokenAddress === item.mint)?.nftConst * globalInfoStore.cHL;
    };
</script>

<style scoped></style>
