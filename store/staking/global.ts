import { defineStore } from 'pinia';
import { Staking } from '@/js/staking';
import type { GlobalInfo } from '~~/types/Staking.types';
import { DataWrapper } from '@/types/DataWrapper.types';
import { logger } from '@/plugins/logger.client';
import { REWARD_TOKEN_DECIMAL } from '~~/types/Staking.types';

import { HTO_TOKEN_DECIMAL } from '~/js/staking/types';
import { formatNumberToDecimal } from '~/js/formatting';
import { calculateReward } from '~/js/staking/utils';
import BN from 'bn.js';

export const useGlobalInfo = defineStore({
    id: 'staking-global',

    state: () => ({
        global: new DataWrapper<GlobalInfo>(),
        stakers: new DataWrapper<{
            count: number;
            data: {
                owner: string;
                stakedCount: number;
                staking: {
                    mint: string;
                    tier: number;
                    amount: number;
                    stakedTime: number;
                    claimedTime: number;
                }[];
            }[];
        }>(),
        stakingDetails: new DataWrapper<{
            tokensStaked: number;
            htoAmount: number;
        }>(),
    }),

    getters: {
        cHL: (state) => state.global.data?.factorHl / state.global.data?.decimalHl,
        htoReleaseRate: (state) =>
            state.global.data?.htoReleaseRate.div(new BN(REWARD_TOKEN_DECIMAL)).toNumber() ?? null,

        apr: (state) =>
            state.global.data?.htoReleaseRate
                .muln(2)
                .muln(1000000)
                .div(state.global.data?.totalRewardSum)
                .muln(100)
                .muln(365)
                .muln(24)
                .toNumber() / 1000000 ?? 0,

        avgStakeDuration: (state) => {
            return state.stakingDetails.data?.htoAmount
                ? state.global.data?.totalRewardSum
                      .div(new BN(state.stakingDetails.data?.htoAmount))
                      .muln(10)
                      .subn(1)
                      .divn(2)
                      .addn(1)
                      .muln(30)
                      ?.toNumber()
                : 0;
        },
        totalStakersCount: (state) => state.stakers.data?.count,
        totalStakedHTO: (state) => formatNumberToDecimal(state.stakingDetails.data?.htoAmount / HTO_TOKEN_DECIMAL),
        totalPendingReward: (state) => {
            const now = Date.now() / 1_000;
            const htoReleaseRate = state.global.data?.htoReleaseRate;
            const totalRewardSum = state.global.data?.totalRewardSum;

            if (!htoReleaseRate || !totalRewardSum) {
                return 0;
            }

            const totalPendingReward = state.stakers.data?.data?.reduce((acc, user) => {
                const userPendingReward = user.staking.reduce((acc2, s) => {
                    const reward = calculateReward(
                        s.tier,
                        htoReleaseRate,
                        totalRewardSum,
                        s.stakedTime,
                        s.claimedTime,
                        s.amount,
                        now
                    );

                    return acc2 + reward;
                }, 0);

                return acc + userPendingReward;
            }, 0);

            return formatNumberToDecimal(totalPendingReward ?? 0);
        },
    },

    actions: {
        async fetchGlobal() {
            try {
                const globalData = await Staking.getInstance().getStakings();

                if (globalData) {
                    this.global.setData(globalData);
                } else {
                    this.global.setError();
                }
            } catch (error: any) {
                this.global.setError();

                logger.error(error);
                throw new Error(error);
            }
        },
    },
});
