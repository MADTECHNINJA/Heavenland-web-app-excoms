import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, Connection, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import {
    STAKING_PROGRAM_ID,
    REWARD_VAULT,
    GLOBAL_AUTHORITY_SEED,
    GlobalPool,
    UserPool,
    NftInfo,
    NFT_INFO_SEED,
    HTO_TOKEN_MINT,
    USER_POOL_SIZE,
    ROLE_INFO_SEED,
    RoleInfo,
} from './types';
import {
    getAssociatedTokenAccount,
    getATokenAccountsNeedCreate,
    getNFTTokenAccount,
    getOwnerOfNFT,
    getMetadata,
} from './utils';
import { logger } from '~/plugins/logger.client';

export const getUserPoolState = async (userAddress: PublicKey, program: anchor.Program): Promise<UserPool | null> => {
    logger.info('[STAKING] getUserPoolState', userAddress?.toBase58());

    if (!userAddress) {
        throw new Error('not defined: userAddress');
    }

    const userPoolKey = await PublicKey.createWithSeed(userAddress, 'user-pool', STAKING_PROGRAM_ID);

    logger.info('[STAKING] getUserPoolState: userPoolKey', userPoolKey?.toBase58());

    try {
        const poolState = await program.account.userPool.fetch(userPoolKey);

        logger.info('[STAKING] getUserPoolState: poolState', poolState);

        return poolState as unknown as UserPool;
    } catch {
        return null;
    }
};

export const getRoleInfoState = async (address: PublicKey, program: anchor.Program): Promise<RoleInfo | null> => {
    logger.info('[STAKING] getRoleInfoState', address?.toBase58());

    if (!address) {
        throw new Error('not defined: address');
    }

    const [roleData, _] = await PublicKey.findProgramAddress(
        [Buffer.from(ROLE_INFO_SEED), address.toBuffer()],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] getRoleInfoState: role data', roleData?.toBase58());

    try {
        const roleState = await program.account.roleInfo.fetch(roleData);
        return roleState as unknown as RoleInfo;
    } catch {
        return null;
    }
};

export const getNFTPoolState = async (mint: PublicKey, program: anchor.Program): Promise<NftInfo | null> => {
    logger.info('[STAKING] getNFTPoolState', mint?.toBase58());

    if (!mint) {
        throw new Error('not defined: mint');
    }

    const [nftData, _] = await PublicKey.findProgramAddress(
        [Buffer.from(NFT_INFO_SEED), mint.toBuffer()],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] getNFTPoolState: nftData PDA', nftData?.toBase58());

    try {
        const poolState = await program.account.nftInfo.fetch(nftData);
        return poolState as unknown as NftInfo;
    } catch {
        return null;
    }
};

export const getGlobalState = async (program: anchor.Program): Promise<GlobalPool | null> => {
    logger.info('[STAKING] getGlobalState');

    const [globalAuthority, _] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] getGlobalState: globalAuthority', globalAuthority?.toBase58);

    try {
        const globalState = await program.account.globalPool.fetch(globalAuthority);
        return globalState as unknown as GlobalPool;
    } catch {
        return null;
    }
};

export const createInitUserPoolTx = async (userAddress: PublicKey, program: anchor.Program, connection: Connection) => {
    logger.info('[STAKING] createInitUserPoolTx', userAddress?.toBase58());

    const userPoolKey = await PublicKey.createWithSeed(userAddress, 'user-pool', STAKING_PROGRAM_ID);

    const tx = new Transaction();
    const ix = SystemProgram.createAccountWithSeed({
        fromPubkey: userAddress,
        basePubkey: userAddress,
        seed: 'user-pool',
        newAccountPubkey: userPoolKey,
        lamports: await connection.getMinimumBalanceForRentExemption(USER_POOL_SIZE),
        space: USER_POOL_SIZE,
        programId: STAKING_PROGRAM_ID,
    });
    tx.add(ix);
    tx.add(
        program.instruction.initializeUserPool({
            accounts: {
                userPool: userPoolKey,
                owner: userAddress,
            },
            instructions: [],
            signers: [],
        })
    );

    return tx;
};

export const createRegisterNftTx = async (
    mint: PublicKey,
    userAddress: PublicKey,
    program: anchor.Program,
    params: {
        nftConst: number | null;
        nftConstDecimal: number | null;
        isDao: boolean | null;
        active: boolean | null;
    }
) => {
    logger.info('[STAKING] createRegisterNftTx', mint?.toBase58(), userAddress?.toBase58());

    const [adminRoleInfo, role_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ROLE_INFO_SEED), userAddress.toBuffer()],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createRegisterNftTx: adminRoleInfo', adminRoleInfo?.toBase58());

    const [nftData, nft_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(NFT_INFO_SEED), mint.toBuffer()],
        STAKING_PROGRAM_ID
    );

    const tx = new Transaction();
    tx.add(
        program.instruction.registerNft(
            nft_bump,
            role_bump,
            params.nftConst == null ? null : new anchor.BN(params.nftConst),
            params.nftConstDecimal == null ? null : new anchor.BN(params.nftConstDecimal),
            params.isDao == null ? null : new anchor.BN(params.isDao ? 1 : 0),
            params.active == null ? null : new anchor.BN(params.active ? 1 : 0),
            {
                accounts: {
                    user: userAddress,
                    roleInfo: adminRoleInfo,
                    nftData,
                    nftMint: mint,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                },
                signers: [],
            }
        )
    );

    return tx;
};

export const createWithdrawNft = async (
    mint: PublicKey,
    userAddress: PublicKey,
    program: anchor.Program,
    connection: Connection,
    params: {
        index: number;
        restaking: number;
    },
    rewardVault?: PublicKey
) => {
    logger.info('[STAKING] createWithdrawNft', mint?.toBase58(), userAddress?.toBase58(), params);

    const ret = await getATokenAccountsNeedCreate(connection, userAddress, userAddress, [mint, HTO_TOKEN_MINT]);
    const userNftTokenAccount = ret.destinationAccounts[0];

    logger.info('[STAKING] createWithdrawNft: userNftTokenAccount', userNftTokenAccount?.toBase58());

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        STAKING_PROGRAM_ID
    );

    const [nftData, nft_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(NFT_INFO_SEED), mint.toBuffer()],
        STAKING_PROGRAM_ID
    );

    const { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
        connection,
        userAddress,
        globalAuthority,
        [mint, HTO_TOKEN_MINT]
    );

    logger.info('[STAKING] createWithdrawNft: destinationAccounts', destinationAccounts?.[0]?.toBase58());

    const userPoolKey = await PublicKey.createWithSeed(userAddress, 'user-pool', STAKING_PROGRAM_ID);

    const tx = new Transaction();

    if (ret.instructions.length > 0) ret.instructions.map((ix) => tx.add(ix));

    logger.info('[STAKING] createWithdrawNft: withdrawing', mint?.toBase58(), params?.index, params?.restaking);

    logger.info('[STAKING] createWithdrawNft: withdrawNft tx', {
        owner: userAddress?.toBase58(),
        userPool: userPoolKey?.toBase58(),
        globalAuthority: globalAuthority?.toBase58(),
        nftData: nftData?.toBase58(),
        userNftTokenAccount: userNftTokenAccount?.toBase58(),
        destNftTokenAccount: destinationAccounts?.[0]?.toBase58(),
        nftMint: mint?.toBase58(),
        userRewardAccount: ret.destinationAccounts?.[1]?.toBase58(),
        destRewardTokenAccount: destinationAccounts?.[1]?.toBase58(),
        rewardVault: rewardVault?.toBase58() ?? REWARD_VAULT?.toBase58(),
        tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
    });
    tx.add(
        program.instruction.withdrawNftFromPool(bump, nft_bump, params.index, params.restaking, {
            accounts: {
                owner: userAddress,
                userPool: userPoolKey,
                globalAuthority,
                nftData,
                userNftTokenAccount,
                destNftTokenAccount: destinationAccounts[0],
                nftMint: mint,
                userRewardAccount: ret.destinationAccounts[1],
                destRewardTokenAccount: destinationAccounts[1],
                rewardVault: rewardVault ?? REWARD_VAULT,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            instructions: [],
            signers: [],
        })
    );

    return tx;
};

export const createStakeNft = async (
    mint: PublicKey,
    userAddress: PublicKey,
    program: anchor.Program,
    connection: Connection,
    params: {
        tier: number;
        amount: number;
        withNft: number;
    }
) => {
    logger.info('[STAKING] createWithdrawNft: createStakeNft', mint?.toBase58(), userAddress?.toBase58(), params);

    if (params.tier < 1 || params.tier > 6) {
        throw new Error('invalid: tier');
    }

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        STAKING_PROGRAM_ID
    );

    let userNftTokenAccount = await getAssociatedTokenAccount(userAddress, mint);
    const accountOfNFT = await getNFTTokenAccount(mint, connection);
    if (userNftTokenAccount.toBase58() != accountOfNFT.toBase58()) {
        const nftOwner = await getOwnerOfNFT(mint, connection);
        if (nftOwner.toBase58() == userAddress.toBase58()) userNftTokenAccount = accountOfNFT;
        else if (nftOwner.toBase58() !== globalAuthority.toBase58()) {
            throw new Error('invalid: Nft is not owned by user');
        }
    }

    logger.info('[STAKING] createWithdrawNft: NFT', mint?.toBase58(), userNftTokenAccount?.toBase58());

    const [nftData, nft_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(NFT_INFO_SEED), mint.toBuffer()],
        STAKING_PROGRAM_ID
    );

    const userPoolKey = await PublicKey.createWithSeed(userAddress, 'user-pool', STAKING_PROGRAM_ID);

    const { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
        connection,
        userAddress,
        globalAuthority,
        [mint, HTO_TOKEN_MINT]
    );

    logger.info('[STAKING] createWithdrawNft: destinationAccounts', destinationAccounts?.[0]?.toBase58());

    const ret = await getATokenAccountsNeedCreate(connection, userAddress, userAddress, [HTO_TOKEN_MINT]);

    logger.info('[STAKING] createWithdrawNft: user reward account', ret.destinationAccounts?.[0]?.toBase58());

    const metadata = await getMetadata(mint);

    logger.info('[STAKING] createWithdrawNft: Metadata', metadata?.toBase58());

    const tx = new Transaction();

    if (instructions.length > 0) instructions.map((ix) => tx.add(ix));
    if (ret.instructions.length > 0) ret.instructions.map((ix) => tx.add(ix));

    logger.info(
        '[STAKING] createWithdrawNft: staking',
        mint?.toBase58(),
        params?.amount,
        params?.tier,
        params?.withNft
    );

    tx.add(
        program.instruction.stakeNftToPool(
            bump,
            nft_bump,
            new anchor.BN(params.amount),
            new anchor.BN(params.tier),
            new anchor.BN(params.withNft),
            {
                accounts: {
                    owner: userAddress,
                    userPool: userPoolKey,
                    globalAuthority,
                    nftData,
                    userNftTokenAccount,
                    destNftTokenAccount: destinationAccounts[0],
                    nftMint: mint,
                    userRewardAccount: ret.destinationAccounts[0],
                    destRewardTokenAccount: destinationAccounts[1],
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                instructions: [],
                signers: [],
            }
        )
    );

    return tx;
};

export const createClaimRewardTx = async (
    mint: PublicKey | undefined,
    userAddress: PublicKey,
    program: anchor.Program,
    connection: Connection,
    rewardVault?: PublicKey
) => {
    logger.info('[STAKING] createClaimRewardTx', mint?.toBase58(), userAddress?.toBase58());

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createClaimRewardTx: globalAuthority', globalAuthority?.toBase58());

    const userPoolKey = await PublicKey.createWithSeed(userAddress, 'user-pool', STAKING_PROGRAM_ID);
    const { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
        connection,
        userAddress,
        userAddress,
        [HTO_TOKEN_MINT]
    );

    logger.info('[STAKING] createClaimRewardTx: Dest NFT Account', destinationAccounts?.[0]?.toBase58());

    const tx = new Transaction();
    if (instructions.length > 0) instructions.map((ix) => tx.add(ix));

    logger.info('[STAKING] createClaimRewardTx: claiming', userAddress?.toBase58());

    tx.add(
        program.instruction.claimReward(bump, mint ? mint : null, {
            accounts: {
                owner: userAddress,
                userPool: userPoolKey,
                globalAuthority,
                rewardVault: rewardVault ?? REWARD_VAULT,
                userRewardAccount: destinationAccounts[0],
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            instructions: [],
            signers: [],
        })
    );
    return tx;
};

export const createInitTx = async (
    payer: PublicKey,
    rewardVault: PublicKey,
    program: anchor.Program,
    params: {
        factor: number;
        decimal: number;
        htoRelease: number;
    }
) => {
    logger.info('[STAKING] createInitTx', payer?.toBase58(), rewardVault?.toBase58(), params);

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createInitTx: globalAuthority', globalAuthority?.toBase58());

    const [adminRoleInfo, role_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ROLE_INFO_SEED), payer.toBuffer()],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createInitTx: adminRoleInfo', adminRoleInfo?.toBase58());

    const tx = new Transaction();
    tx.add(
        program.instruction.initialize(
            bump,
            role_bump,
            new anchor.BN(params.factor),
            new anchor.BN(params.decimal),
            new anchor.BN(params.htoRelease),
            {
                accounts: {
                    admin: payer,
                    globalAuthority,
                    adminRoleInfo,
                    rewardVault: rewardVault,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                },
                signers: [],
            }
        )
    );

    return tx;
};

export const createChangeRoleTx = async (
    payer: PublicKey,
    address: PublicKey,
    program: anchor.Program,
    params: {
        admin: boolean;
        updater: boolean;
    }
) => {
    logger.info('[STAKING] createChangeRoleTx', payer?.toBase58(), address?.toBase58(), params);

    const [adminRoleInfo, role_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ROLE_INFO_SEED), payer.toBuffer()],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createChangeRoleTx: adminRoleInfo', adminRoleInfo.toBase58());

    const [userRoleInfo, user_role_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ROLE_INFO_SEED), address.toBuffer()],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createChangeRoleTx: userRoleInfo', userRoleInfo?.toBase58());

    const tx = new Transaction();
    tx.add(
        program.instruction.changeRole(
            role_bump,
            user_role_bump,
            address,
            new anchor.BN(params.admin ? 1 : 0),
            new anchor.BN(params.updater ? 1 : 0),
            {
                accounts: {
                    admin: payer,
                    adminRoleInfo,
                    userRoleInfo,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                },
                signers: [],
            }
        )
    );

    return tx;
};

export const createRefundFromVaultTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
    connection: Connection,
    rewardVault?: PublicKey
) => {
    logger.info('[STAKING] createRefundFromVaultTx', userAddress?.toBase58(), rewardVault?.toBase58());

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createRefundFromVaultTx: globalAuthority', globalAuthority?.toBase58());

    const [adminRoleInfo, role_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ROLE_INFO_SEED), userAddress.toBuffer()],
        STAKING_PROGRAM_ID
    );

    logger.info('[STAKING] createRefundFromVaultTx: adminRoleInfo', adminRoleInfo?.toBase58());

    const { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
        connection,
        userAddress,
        userAddress,
        [HTO_TOKEN_MINT]
    );

    logger.info('[STAKING] createRefundFromVaultTx: Dest NFT Account', destinationAccounts?.[0]?.toBase58());

    const tx = new Transaction();
    if (instructions.length > 0) instructions.map((ix) => tx.add(ix));

    logger.info(
        '[STAKING] createRefundFromVaultTx: refunding',
        userAddress?.toBase58(),
        (rewardVault ?? REWARD_VAULT)?.toBase58()
    );

    tx.add(
        program.instruction.refundFromVault(bump, role_bump, {
            accounts: {
                admin: userAddress,
                adminRoleInfo,
                globalAuthority,
                rewardVault: rewardVault ?? REWARD_VAULT,
                userRewardAccount: destinationAccounts[0],
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            instructions: [],
            signers: [],
        })
    );
    return tx;
};
