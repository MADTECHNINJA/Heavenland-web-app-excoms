import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export const STAKING_PROGRAM_ID = new PublicKey(import.meta.env.VITE_EXCOMS_STAKING_PROGRAM_ADDRESS);
export const REWARD_VAULT = new PublicKey(import.meta.env.VITE_EXCOMS_STAKING_REWARD_VAULT);
export const GLOBAL_AUTHORITY_SEED = 'global-pool';
export const NFT_INFO_SEED = 'nft-info';
export const ROLE_INFO_SEED = 'role-info';

export const BASE_STAKING_PERIOD = import.meta.env.VITE_EXCOMS_STAKING_BASE_PERIOD;
export const TIER_REWARD_FACTOR = 20; // 20 %

export const HTO_TOKEN_MINT = new PublicKey('htoHLBJV1err8xP5oxyQdV2PLQhtVjxLXpKB7FsgJQD');
// export const HTO_TOKEN_MINT = new PublicKey("8EoML7gaBJsgJtepm25wq3GuUCqLYHBoqd3HP1JxtyBx");
export const MIN_REWARD_DEPOSIT_AMOUNT = 100_000; // 100
export const HTO_TOKEN_DECIMAL = 1_000_000_000; // HTO Token Decimal

export const USER_POOL_SIZE = 6448; // 8 + 6440
export const NFT_PDA_SIZE = 128; // 8 + 120
export const ROLE_PDA_SIZE = 48; // 8 + 40

export interface GlobalPool {
    htoReleaseRate: anchor.BN; // 8
    factorHl: anchor.BN; // 8
    decimalHl: anchor.BN; // 8
    totalRewardSum: anchor.BN; // 8
}

export interface RoleInfo {
    address: PublicKey; // 32
    role: anchor.BN; // 8
}

export interface NftInfo {
    mint: PublicKey; // 32
    isDao: anchor.BN; // 8
    nftConst: anchor.BN; // 8
    nftConstDecimal: anchor.BN; // 8
    active: anchor.BN; // 8
    isLocked: anchor.BN; // 8
    stakerAddress: PublicKey; // 32
    curLockedAmount: anchor.BN; // 8
    lockedUntil: anchor.BN; // 8
}

export interface StakedData {
    mint: PublicKey; // 32
    stakedTime: anchor.BN; // 8
    tier: anchor.BN; // 8
    amount: anchor.BN; // 8
    claimedTime: anchor.BN; // 8
}

export interface UserPool {
    // 8 + 6440
    owner: PublicKey; // 32
    stakedCount: anchor.BN; // 8
    staking: StakedData[]; // 64 * 100
}
