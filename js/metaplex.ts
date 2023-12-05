import axios from 'axios';

import { Connection, programs } from '@metaplex/js';
import { TokenAddress, TokenName } from '@/js/tokens';
import { logger } from '@/plugins/logger.client';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWallet } from 'solana-wallets-vue';
import * as web3 from '@solana/web3.js';
import { TransactionInstruction } from '@solana/web3.js';
import { MEMO_PROGRAM_ID } from '~/js/metaplex/types';

export type OffChainAttributes = {
    trait_type:
        | 'Zone'
        | 'Subzone'
        | 'Cluster'
        | 'Coordinate X [m]'
        | 'Coordinate Y [m]'
        | 'Max Height [m]'
        | 'Max Depth [m]'
        | 'High Traffic'
        | 'Drill Through'
        | 'Parcel Count'
        | 'Parcel Ids'
        | 'Parcel Mint Addresses'
        | 'Parcel Coordinates'
        | 'Internal ID'
        | 'Tier';
    value: any;
};

export const DisabledOffChainAttributes = [
    'Parcel Ids',
    'Parcel Coordinates',
    'Internal ID',
    'Parcel Mint Addresses',
    'PFP Mint',
];
export const DisabledParcelBucketDetailAttributes = ['Parcel Count', 'Parcel Mint Addresses'];

export type OnChainMetadata = programs.metadata.MetadataData;

export type OffChainMetadata = {
    name: string;
    image: string;
    seller_fee_basis_points: number;
    external_url: string;
    symbol: string;
    attributes: Array<OffChainAttributes>;
};

export interface ITokenMetadata {
    onChain: OnChainMetadata;
    offChain?: OffChainMetadata;
}

export class Metaplex {
    private static instance?: Metaplex;

    public static getInstance(): Metaplex {
        if (!Metaplex.instance) {
            Metaplex.instance = new Metaplex();
        }

        return Metaplex.instance;
    }

    connection?: Connection;

    constructor() {
        if (import.meta.env.VITE_EXCOMS_CONNECTION_CLUSTER !== undefined) {
            this.connection = new Connection(import.meta.env.VITE_EXCOMS_CONNECTION_CLUSTER);
        }
    }

    confirmTransaction = async (signature: string, onConfirmed?: () => void, onError?: () => void) => {
        let failedAttemptsCounts = 0;

        try {
            await this._confirmTransaction(signature);

            if (onConfirmed) {
                onConfirmed();
            }
        } catch (e: any) {
            logger.error(e);

            failedAttemptsCounts++;

            if (failedAttemptsCounts <= 2) {
                await this._confirmTransaction(signature);
            }

            if (onError && failedAttemptsCounts > 2) {
                onError();
            }
        }
    };

    private _confirmTransaction = async (signature: string) => {
        return await this.connection.confirmTransaction(signature, 'finalized');
    };

    retrieveRequestItems = async (items: string[]) => {
        logger.info('[METAPLEX] retrieveRequestItems', items);

        if (!this.connection) {
            throw new Error();
        }

        if (!items.length) {
            return null;
        }

        const onChain: OnChainMetadata[] = [];

        for (const i of items) {
            const metadata = await programs.metadata.Metadata.findByMint(this.connection, new web3.PublicKey(i));
            onChain.push(metadata.data);
        }

        const requests = [];

        for (const metadata of onChain) {
            requests.push(axios.get(metadata.data.uri));
        }

        return await this.fetchOffChainData(onChain);
    };

    getTPS = async () => {
        const samples = await this.connection.getRecentPerformanceSamples(5);

        return samples && samples[0] ? samples[0].numTransactions / samples[0].samplePeriodSecs : null;
    };

    getLatestBlockhash = async () => {
        return (await this.connection.getLatestBlockhash('finalized'))?.blockhash;
    };

    signMultipleTransactions = async (txs: web3.Transaction[]) => {
        try {
            const { signAllTransactions } = useWallet();

            return await signAllTransactions.value(txs);
        } catch (e: any) {
            logger.error(e);
            throw e;
        }
    };

    sendRawTransaction = async (tx: web3.Transaction, onSent?: (txSig) => void) => {
        const txSig = await this.connection.sendRawTransaction(tx.serialize());

        if (onSent) {
            onSent(txSig);
        }

        return txSig;
    };

    sendTransaction = async (tx: web3.Transaction, onSent?: (txSig) => void) => {
        const { sendTransaction } = useWallet();

        const txSig = await sendTransaction(tx, this.connection);

        if (onSent) {
            onSent(txSig);
        }

        return txSig;
    };

    fetchTokens = async (publicKey: web3.PublicKey | null) => {
        if (!publicKey || !this.connection) {
            return null;
        }

        let onChain: OnChainMetadata[] = await programs.metadata.Metadata.findDataByOwner(this.connection, publicKey);

        const updateAuthorities = [...import.meta.env.VITE_EXCOMS_UPDATE_AUTHORITY_EXCOMS.split(',')];

        onChain = onChain.filter((ocm) => updateAuthorities.includes(ocm.updateAuthority));

        return await this.fetchOffChainData(onChain);
    };

    getBalanceSOL = async (wallet: web3.PublicKey | null) => {
        if (!wallet) {
            throw new Error('not defined: wallet');
        } else if (!this.connection) {
            throw new Error('not defined: connection');
        }

        return await this.connection.getBalance(wallet);
    };

    getBalanceUSDC = async (wallet: web3.PublicKey | null) => {
        return this.#getCustomTokenBalance(TokenAddress.get(TokenName.USDC), wallet);
    };

    getBalanceGENZ = async (wallet: web3.PublicKey | null) => {
        return this.#getCustomTokenBalance(TokenAddress.get(TokenName.HTO), wallet);
    };

    #getCustomTokenBalance = async (tokenAddress: string, wallet: web3.PublicKey | null) => {
        if (!tokenAddress) {
            throw new Error('not defined: tokenMint');
        } else if (!wallet) {
            throw new Error('not defined: wallet');
        } else if (!this.connection) {
            throw new Error('not defined: connection');
        }

        const res = await this.connection.getParsedTokenAccountsByOwner(wallet, {
            mint: new web3.PublicKey(tokenAddress),
        });

        return res?.value[0]?.account?.data?.parsed?.info?.tokenAmount?.amount ?? 0;
    };

    submitVote = (voteId: string, optionId: string) => {
        if (!voteId) {
            throw new Error('not defined: voteId');
        } else if (!optionId) {
            throw new Error('not defined: optionId');
        }

        return this.sendMemo(`HLDAO ${voteId} ${optionId}`);
    };

    private sendMemo = async (data: string) => {
        const { publicKey } = useWallet();

        if (!publicKey.value) {
            throw new Error('not defined: walletPk');
        }

        const tx = new web3.Transaction().add(
            new TransactionInstruction({
                programId: MEMO_PROGRAM_ID,
                keys: [
                    {
                        pubkey: publicKey.value,
                        isSigner: true,
                        isWritable: true,
                    },
                ],
                data: Buffer.from(data),
            })
        );

        return await this.sendTransaction(tx);
    };

    private fetchOffChainData = async (onChain: OnChainMetadata[]) => {
        const tokenMetadata: ITokenMetadata[] = [];
        const requests = [];

        for (const metadata of onChain) {
            requests.push(axios.get(metadata.data.uri));
        }

        try {
            await axios.all(requests).then((responses) => {
                for (const index in responses) {
                    const responseData = responses[index].data;

                    tokenMetadata.push({
                        onChain: onChain[index],
                        offChain: responseData,
                    });
                }
            });

            return tokenMetadata;
        } catch (e) {
            logger.error(e);

            onChain.forEach((ocm) => {
                tokenMetadata.push({
                    onChain: ocm,
                });
            });

            return tokenMetadata;
        }
    };

    async #getATA(mintAddress: string, wallet: web3.PublicKey) {
        if (!this.connection || !wallet) {
            return null;
        }

        const mintAddressPublicKey = new web3.PublicKey(mintAddress);

        let sourceAta;
        const sourceTokenAccounts = await this.connection.getParsedTokenAccountsByOwner(wallet, {
            mint: new web3.PublicKey(mintAddressPublicKey),
        });

        logger.info('[METAPLEX] Source token accounts', sourceTokenAccounts);

        if (sourceTokenAccounts === null || sourceTokenAccounts.value.length <= 0) {
            throw new Error();
        }

        for (const index in sourceTokenAccounts.value) {
            const sourceTokenAccount = sourceTokenAccounts.value[index];

            const pubKey = sourceTokenAccount.pubkey;
            const balance = sourceTokenAccount.account?.data?.parsed?.info?.tokenAmount?.uiAmount;

            logger.info('[MERGE] Source token scanning', sourceTokenAccount, pubKey, balance);

            if (pubKey && balance !== undefined && balance !== null && balance === 1) {
                sourceAta = pubKey;
            }
        }

        if (!sourceAta) {
            throw new Error();
        }

        return sourceAta;
    }

    fetchStakedTokens = async (mints: web3.PublicKey[]) => {
        if (!this.connection) return null;

        const onChain: OnChainMetadata[] = [];
        const response = [];
        mints.map((mint) =>
            response.push(
                programs.metadata.Metadata.findByMint(this.connection, mint).then((res) => {
                    onChain.push(res.data);
                })
            )
        );
        await Promise.all(response);

        return await this.fetchOffChainData(onChain);
    };

    fetchStakingFromAddress = async (treasuryAddress: string, genzAccount: string, rewardVaults: Array<string>) => {
        if (!this.connection) {
            throw new Error('not defined: connection');
        } else if (!treasuryAddress) {
            throw new Error('not defined: treasuryAddress');
        } else if (!genzAccount) {
            throw new Error('not defined: genzAccount');
        }

        const res = await this.connection.getParsedTokenAccountsByOwner(new web3.PublicKey(treasuryAddress), {
            programId: TOKEN_PROGRAM_ID,
        });

        const tokens = res.value.filter(
            (a) =>
                a.pubkey?.toBase58() !== genzAccount &&
                !rewardVaults.includes(a.pubkey?.toBase58()) &&
                a.account?.data?.parsed?.info?.tokenAmount?.uiAmount === 1
        );

        const htoTreasuryAddress = res.value.find((a) => a.pubkey?.toBase58() === genzAccount);

        if (!htoTreasuryAddress) {
            throw new Error('Treasury HTO address not found');
        }

        return {
            tokensStaked: tokens.length,
            genzAccount: htoTreasuryAddress.account?.data?.parsed?.info?.tokenAmount?.amount,
        };
    };

    getTokenOwner = async (mintId: string) => {
        const largestAccounts = await this.connection.getTokenLargestAccounts(new web3.PublicKey(mintId));
        const largestAccountInfo = await this.connection.getParsedAccountInfo(largestAccounts.value[0].address);

        if ('parsed' in largestAccountInfo.value.data) {
            return largestAccountInfo.value.data?.parsed.info.owner;
        } else {
            return null;
        }
    };
}
