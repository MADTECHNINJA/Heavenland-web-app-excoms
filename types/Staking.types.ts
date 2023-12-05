import BN from 'bn.js';
import { CollectionName } from '~/types/Collection.types';

export interface GlobalInfo {
    readonly htoReleaseRate: BN;
    readonly totalRewardSum: BN;
    readonly factorHl: number;
    readonly decimalHl: number;
}

export interface UserInfo {
    readonly owner: string;
    readonly stakedCount: number;
    readonly staking: {
        mint: string;
        tier: number;
        amount: number;
        stakedTime: number;
        claimedTime: number;
    }[];
}

export interface ActiveStaking {
    [mint: string]: {
        stakedAmount: number;
        earned: number;
        creator: string;
        endTime: number;
        stakings: {
            amount: number;
            tier: number;
            stakedTime: number;
            endTime: number;
            claimedTime: number;
            index: number;
            earned: number;
        }[];
    };
}

export const REWARD_TOKEN_DECIMAL = 1_000_000_000;

export type StakingNftInfo = {
    tokenAddress: string;
    nftConst: number;
};

export interface IStakable {
    mint: string;
    name: string;
    image: string;
    type: string;
    cname: CollectionName;
}
