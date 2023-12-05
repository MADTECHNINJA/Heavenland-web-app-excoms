import { defineStore } from 'pinia';
import { Staking } from '@/js/staking';
import { ActiveStaking, IStakable, REWARD_TOKEN_DECIMAL, StakingNftInfo, UserInfo } from '@/types/Staking.types';
import { BASE_STAKING_PERIOD } from '@/js/staking/types';
import { DataWrapper } from '@/types/DataWrapper.types';
import { logger } from '@/plugins/logger.client';
import { ITokenMetadata, Metaplex } from '@/js/metaplex';
import { EParcelSymbol, IParcelBase, Parcel, ParcelBucket } from '@/types/Parcel.types';
import * as web3 from '@solana/web3.js';
import { API } from '~/api';
import { useAccountStore } from '~/store/account';
import { ISolamidsBase, Solamids } from '~/types/Solamids.types';
import { calculateReward } from '~/js/staking/utils';
import { useGlobalInfo } from '~/store/staking/global';
import { formatNumberToDecimal } from '~/js/formatting';
import BN from 'bn.js';

export const useUserInfo = defineStore({
    id: 'staking-user',

    state: () => ({
        user: new DataWrapper<UserInfo>(),
        stakedTokens: new DataWrapper<(IParcelBase | ISolamidsBase)[]>(),
        activeStakings: new DataWrapper<ActiveStaking>(),
        nftInfo: new DataWrapper<StakingNftInfo[]>(),
    }),

    getters: {
        hasInitializedPool: (state) => state.user.data?.owner,

        avgStakeDuration: (state) => {
            const totalStakingDuration = state.user.data.staking.reduce((acc, s) => acc + s.tier * 30, 0);

            return formatNumberToDecimal(totalStakingDuration / state.user.data.stakedCount);
        },

        finishedStakings: (state) => {
            const now = Date.now() / 1_000;

            let finishedStakesCount = 0;

            for (const mint in state.activeStakings.data) {
                const nft = state.activeStakings.data[mint];

                finishedStakesCount += nft.stakings.filter((s) => s.endTime <= now)?.length ?? 0;
            }

            return finishedStakesCount;
        },

        totalHtoStaked: (state) => {
            const userHtoStaked = state.user.data.staking.reduce((acc, s) => {
                return acc + s.amount;
            }, 0);

            return formatNumberToDecimal(userHtoStaked / REWARD_TOKEN_DECIMAL ?? 0);
        },

        totalPendingReward: (state) => {
            const globalStore = useGlobalInfo();

            const now = Date.now() / 1_000;
            const htoReleaseRate = globalStore.global.data?.htoReleaseRate;
            const totalRewardSum = globalStore.global.data?.totalRewardSum;

            if (!htoReleaseRate || !totalRewardSum) {
                return 0;
            }

            const userPendingReward = state.user.data.staking.reduce((acc, s) => {
                const reward = calculateReward(
                    s.tier,
                    htoReleaseRate,
                    totalRewardSum,
                    s.stakedTime,
                    s.claimedTime,
                    s.amount,
                    now
                );

                return acc + reward;
            }, 0);

            return formatNumberToDecimal(userPendingReward ?? 0);
        },
    },

    actions: {
        async fetchUser() {
            try {
                const userData: any | null = await Staking.getInstance().getStakings();

                this.user.setData(userData);

                const stakedMints: string[] = [];
                if (userData) {
                    const activeStaking: ActiveStaking = {};

                    userData?.data.map((data, index) => {
                        const endTime = Number(data.stakedTime) + Number(BASE_STAKING_PERIOD);
                        const now = Date.now();
                        const lastClaim = Number(data.lastClaimTime.toString() + '000');
                        const endTimeSufix = Number(endTime.toString() + '000');

                        let rewardMultiplier;
                        if (now < endTimeSufix) {
                            rewardMultiplier = now - lastClaim; // ms
                        } else {
                            rewardMultiplier = endTimeSufix - lastClaim; // ms
                        }

                        const reward = (data.stakeReward / 30) * (rewardMultiplier / (24 * 60 * 60 * 1000));

                        const stakingData = {
                            amount: data.amount,
                            tier: data.tier,
                            stakedTime: data.stakedTime,
                            endTime,
                            claimedTime: data.lastClaimTime,
                            index,
                            earned: reward,
                            creator: data.stakerAddress,
                        };

                        if (!stakedMints.find((m) => m === data.mint)) {
                            stakedMints.push(data.mint);
                            activeStaking[data.mint] = {
                                stakedAmount: data.amount,
                                stakings: [stakingData],
                                earned: stakingData.earned,
                                endTime,
                            };
                        } else {
                            activeStaking[data.mint].stakings.push(stakingData);
                            activeStaking[data.mint].stakedAmount += data.amount;
                            activeStaking[data.mint].earned += stakingData.earned;
                        }
                    });

                    let stakedTokenData;

                    stakedTokenData = await Metaplex.getInstance().fetchStakedTokens(
                        stakedMints.map((mint) => new web3.PublicKey(mint))
                    );

                    stakedTokenData = stakedTokenData.map((tm: ITokenMetadata) => {
                        switch (tm.onChain.data.symbol) {
                            case EParcelSymbol.PARCEL_BUCKET:
                                return new ParcelBucket(tm.onChain, tm.offChain);

                            case EParcelSymbol.PARCEL:
                                return new Parcel(tm.onChain, tm.offChain);

                            default:
                                return new Solamids(tm.onChain, tm.offChain);
                        }
                    });

                    stakedTokenData.sort((a, b) =>
                        activeStaking[a.onChain.mint].earned > activeStaking[b.onChain.mint].earned ? -1 : 1
                    );

                    if (stakedTokenData) {
                        this.stakedTokens.setData(stakedTokenData);
                        this.activeStakings.setData(activeStaking);
                    } else {
                        this.stakedTokens.setError();
                        this.activeStakings.setError();
                    }

                    for (const stake in this.activeStakings.data) {
                        this.activeStakings.data[stake].stakings.sort((a, b) => (a.reward > b.reward ? -1 : 1));
                    }
                }

                const accountStore = useAccountStore();

                const stakingCollectionsMints = [];

                for (const collection of Object.values(accountStore.getStakingTokenCollections)) {
                    stakingCollectionsMints.push(...(collection as DataWrapper<IStakable[]>).data.map((oc) => oc.mint));
                }

                const allTokens = [...stakedMints, ...stakingCollectionsMints];

                if (allTokens.length) {
                    try {
                        //  const nd = await API.StakingService.findNftConstants(allTokens);

                        if (nd) {
                            this.nftInfo.setData(nd);
                        } else {
                            this.nftInfo.setError();
                        }
                    } catch (e) {
                        this.nftInfo.setError(e);
                    }
                } else {
                    this.nftInfo.setData([]);
                }
            } catch (e: any) {
                this.user.setError();
                this.activeStakings.setError();
                this.stakedTokens.setError();

                logger.error(e);
                throw new Error(e);
            }
        },

        async clearUser() {
            this.user.clear();
            this.stakedTokens.clear();
            this.activeStakings.clear();
        },
    },
});
