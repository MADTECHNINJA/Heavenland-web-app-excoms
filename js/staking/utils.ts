import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TIER_REWARD_FACTOR } from './types';
import { logger } from '~/plugins/logger.client';
import BN from 'bn.js';
import { REWARD_TOKEN_DECIMAL } from '~/types/Staking.types';

export const METAPLEX = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export const getOwnerOfNFT = async (nftMintPk: PublicKey, connection: Connection): Promise<PublicKey> => {
    logger.info('[STAKING] getOwnerOfNFT', nftMintPk?.toBase58());

    const tokenAccountPK = await getNFTTokenAccount(nftMintPk, connection);
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccountPK);

    logger.info('[STAKING] nftMintPk', nftMintPk?.toBase58());
    logger.info('[STAKING] tokenAccountInfo', tokenAccountInfo);

    if (tokenAccountInfo && tokenAccountInfo.data) {
        const ownerPubkey = new PublicKey(tokenAccountInfo.data.slice(32, 64));
        logger.info('[STAKING] ownerPubkey', ownerPubkey?.toBase58());
        return ownerPubkey;
    }
    return new PublicKey('');
};

export const getNFTTokenAccount = async (nftMintPk: PublicKey, connection: Connection): Promise<PublicKey> => {
    logger.info('[STAKING] getNFTTokenAccount', nftMintPk?.toBase58());

    const tokenAccount = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
        filters: [
            {
                dataSize: 165,
            },
            {
                memcmp: {
                    offset: 64,
                    bytes: '2',
                },
            },
            {
                memcmp: {
                    offset: 0,
                    bytes: nftMintPk.toBase58(),
                },
            },
        ],
    });
    return tokenAccount[0].pubkey;
};

export const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    logger.info('[STAKING] getAssociatedTokenAccount', ownerPubkey?.toBase58(), mintPk?.toBase58());

    return (
        await PublicKey.findProgramAddress(
            [
                ownerPubkey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mintPk.toBuffer(), // mint address
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    )[0];
};

export const getATokenAccountsNeedCreate = async (
    connection: Connection,
    walletAddress: PublicKey,
    owner: PublicKey,
    nfts: PublicKey[]
) => {
    logger.info('[STAKING] getATokenAccountsNeedCreate', walletAddress?.toBase58(), owner?.toBase58(), nfts);

    const instructions = [],
        destinationAccounts = [];
    for (const mint of nfts) {
        const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
        const response = await connection.getAccountInfo(destinationPubkey);
        if (!response) {
            const createATAIx = createAssociatedTokenAccountInstruction(destinationPubkey, walletAddress, owner, mint);
            instructions.push(createATAIx);
        }
        destinationAccounts.push(destinationPubkey);
    }
    return {
        instructions,
        destinationAccounts,
    };
};

export const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey
) => {
    logger.info(
        '[STAKING] createAssociatedTokenAccountInstruction',
        associatedTokenAddress?.toBase58(),
        payer?.toBase58(),
        walletAddress?.toBase58(),
        splTokenMintAddress?.toBase58()
    );

    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
};

export const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
    logger.info('[STAKING] getMetadata', mint?.toBase58());

    return (
        await PublicKey.findProgramAddress([Buffer.from('metadata'), METAPLEX.toBuffer(), mint.toBuffer()], METAPLEX)
    )[0];
};

export const calculateReward = (
    tier: number,
    htoReleaseRate: BN,
    totalRewardSum: BN,
    stakedTime: number,
    claimedTime: number,
    amount: number,
    now?: number
) => {
    logger.info(
        '[STAKING] calculateReward',
        tier,
        htoReleaseRate,
        totalRewardSum,
        stakedTime,
        claimedTime,
        amount,
        now
    );

    const baseStakingPeriod = import.meta.env.VITE_EXCOMS_STAKING_BASE_PERIOD;
    let period = new BN(stakedTime).add(new BN(baseStakingPeriod).mul(new BN(tier)));
    if (period.gt(new BN(now))) period = new BN(now);
    if (period.lte(new BN(claimedTime))) return 0;
    period = period.sub(new BN(claimedTime));

    const reward =
        new BN(period)
            .muln(10000000)
            .mul(new BN(htoReleaseRate))
            .div(new BN(totalRewardSum))
            .divn(3600)
            .mul(new BN(amount))
            .mul(new BN(TIER_REWARD_FACTOR).mul(new BN(tier).subn(1)).addn(100))
            .divn(100)
            .divn(10000000)
            .toNumber() / REWARD_TOKEN_DECIMAL;

    logger.info('[STAKING] calculateReward: reward', reward, period, tier, amount);

    return reward;
};
