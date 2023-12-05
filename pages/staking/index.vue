<template>
    <AppContainer>
        <AppTitle class="text-purple-500 md:text-left">Staking</AppTitle>
        <AppAlert v-if="globalData.error()" class="mt-9" :text="ErrorMsg.CONNECTION_ERROR" :type="AlertType.ERROR" />

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

            <div v-else-if="userData.fetched() && (!userData.data() || userData.data()?.count === 0)">
                <AppSectionTitle v-if="!activeStakings?.length && hasAnyTokensToStake" class="mb-6"
                    >Staked excoms</AppSectionTitle
                >
                <AppActionCard v-if="!userData.data() || userData.data().count === 0" :type="AlertType.INFO">
                    <template #title>No items!</template>
                    <template v-if="!hasAnyTokensToStake" #desc>You don't have any Excom NFT.</template>
                    <template v-else #desc> You haven't staked anything yet.</template>
                </AppActionCard>
            </div>

            <div v-else>
                <AppSectionTitle class="mb-6">Staked excoms</AppSectionTitle>
                <!--   <div
                    v-if="stakedTokens.data()?.length"
                    class="mb-6 flex relative flex-col w-auto justify-between bg-black max-w-4xl"
                >
                    <div class="md:flex md:flex-row">
                        <div class="flex flex-col mb-4 lg:items-start text-gray-300 text-sm text-center md:text-start">
                            <p class="mb-1 text-cyan-950">
                                Claim rewards from <b>all</b> your unfinished stakes or specify the number of stakes
                                sorted by <b>estimated reward in descending order</b>.
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="hasOngoingStakesClaim < 1"
                        class="flex mb-2 md:mb-0 items-center justify-center md:justify-start text-gray-300 text-sm"
                    >
                        <div class="text-purple-500 flex font-semibold text-sm">
                            You don't have any unfinished stakes.
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row justify-start items-center">
                        <p
                            v-if="hasOngoingStakesClaim === 1"
                            class="flex mb-2 md:mb-0 font-semibold font-bold text-gray-300 items-center text-sm"
                        >
                            You have {{ hasOngoingStakesClaim }} unfinished stake.
                        </p>
                        <div
                            :class="
                                hasOngoingStakesClaim > 1 && 'flex-col md:flex-row justify-center flex items-center'
                            "
                        >
                            <div v-if="hasOngoingStakesClaim > 1" class="w-[200px] z-[2] mb-4 md:mb-0 md:mr-4">
                                <AppSlider
                                    range
                                    v-model="claimAmount"
                                    class="w-full md:mt-1"
                                    :min="1"
                                    :max="hasOngoingStakesClaim"
                                />
                            </div>
                            <div class="z-[2] md:pr-4">
                                <AppButton
                                    v-if="hasOngoingStakesClaim > 0"
                                    :disabled="
                                        !hasOngoingStakesClaim ||
                                        !claimAmount ||
                                        hasOngoingStakesClaim < claimAmount ||
                                        claimAllStakesButtonLoading
                                    "
                                    :loading="claimButtonLoading"
                                    @click="claimStakes(claimAmount)"
                                    :class="hasOngoingStakesClaim > 1 && 'mb-8'"
                                    class="relative md:mb-0 md:ml-4"
                                >
                                    Claim
                                </AppButton>
                            </div>
                            <div v-if="hasOngoingStakesClaim > 1" class="flex z-[2]">
                                <div>
                                    <AppButton
                                        :disabled="!hasOngoingStakesClaim || claimButtonLoading"
                                        :loading="claimAllStakesButtonLoading"
                                        @click="claimStakes(null)"
                                        class="relative"
                                    >
                                        Claim all
                                    </AppButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->

                <!--   <AppCollectionFilter
                    v-if="stakedTokens.data()?.length"
                    class="mb-6"
                    :collections="Object.keys(accountStore.getStakingTokenCollections)"
                    @change="changeStakingCollectionFilter"
                /> -->

                <AppActionCard v-if="stakedTokens.error()" :type="AlertType.ERROR">
                    <template #desc> {{ ErrorMsg.FETCHING_ERROR_PARCELS }} </template>
                </AppActionCard>

                <StakingContainer :card-redirect="cardRedirectTo" :staked-tokens="activeStakings">
                    <!-- <template #cardDetail="{ item }">
                        <ExtensionActiveStakingOverview
                            :current-stake="getCurrentStakeAmount(item)"
                            :max-stake="getMaxStakeAmount(item)"
                            :reward="getStakingReward(item)"
                            :fetched="nftInfo.fetched()"
                            :error="nftInfo.error()"
                            :stakings="getStakings(item)"
                        />
                    </template> -->
                </StakingContainer>
            </div>

            <div v-if="userData.fetched() && hasAnyTokensToStake">
                <AppSectionTitle class="mt-6">Your excoms</AppSectionTitle>

                <StakingIdleContainer
                    v-if="areAllCollectionsFetched"
                    idle
                    :items="stakingItems"
                    :card-redirect="cardRedirectTo"
                    :disabled="!userData.data()"
                    :custom-sort="sortByMaxStakeAmount"
                >
                </StakingIdleContainer>
            </div>
        </div>
    </AppContainer>
</template>

<script lang="ts" setup>
    import { useAccountStore } from '~/store/account';
    import { useGlobalInfo } from '~/store/staking/global';
    import { useUserInfo } from '@/store/staking/userPool';
    import { mapState } from 'pinia';
    import { AlertType } from '~/types/Alert.utils';
    import { ErrorMsg } from '~/locales/core';
    import { IParcelBase, ParcelBase } from '~/types/Parcel.types';
    import { IStakable } from '~/types/Staking.types';
    import { computed, ref } from 'vue';
    import { useWallet } from 'solana-wallets-vue';

    const accountStore = useAccountStore();

    const areAllCollectionsFetched = computed(() => {
        return Object.values(accountStore.getStakingTokenCollections).every((sc) => sc.fetched);
    });

    const hasAnyTokensToStake = computed(() => {
        for (const tokens of Object.values(accountStore.getStakingTokenCollections)) {
            if (tokens.data?.length) {
                return true;
            }
        }

        return false;
    });

    const stakingCollection = ref(Object.values(accountStore.getStakingTokenCollections));

    const stakingItems = computed(() => {
        const items = [...stakingCollection.value];
        if (items) items[0]?.data.sort((a, b) => a.name - b.name);

        return items.reduce((acc, item) => {
            return [...acc, ...item.data];
        }, []);
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
            activeStakings: (store) => store?.activeStakings,
        });
    });

    const stakedTokens = computed(() => {
        return mapState(useUserInfo, {
            fetched: (store) => store.stakedTokens.fetched,
            error: (store) => store.stakedTokens.error,
            data: (store) => store.stakedTokens.data,
        });
    });

    const nftInfo = computed(() => {
        return mapState(useUserInfo, {
            fetched: (store) => store.nftInfo.fetched,
            error: (store) => store.nftInfo.error,
            data: (store) => store.nftInfo.data,
        });
    });

    const activeStakings = computed(() => {
        if (stakedTokens.value.data()) {
            const items = [...stakedTokens.value.data()];

            if (items) {
                return items.sort((a, b) => {
                    return a?.name - b?.name;
                });
            } else {
                return null;
            }
        }
        return stakedTokens.value.data();
    });

    const { publicKey } = useWallet();

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
