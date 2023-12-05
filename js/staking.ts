import { useAnchorWallet, useWallet } from 'solana-wallets-vue';
import {
    createWithdrawNft,
    createStakeNftTx,
    createClaimRewardTx,
    getAllRegisters,
    setClusterConfig,
    setLoggerMode,
} from '~/js/contracts/staking/staking/cli/script';
import { web3 } from '@project-serum/anchor';

export class Staking {
    private static instance?: Staking;

    public static getInstance(): Staking {
        if (!Staking.instance) {
            Staking.instance = new Staking();
        }

        return Staking.instance;
    }

    constructor() {
        setLoggerMode(import.meta.env.VITE_EXCOMS_MODE === 'development');
    }

    isClusterConfigSet: boolean;

    async setClusterConfig() {
        const anchorWallet = useAnchorWallet();

        if (!anchorWallet.value) {
            throw new Error('[TREASURY] not defined: publicKey');
        }

        await setClusterConfig(
            import.meta.env.VITE_EXCOMS_NAME_CLUSTER,
            anchorWallet.value,
            import.meta.env.VITE_EXCOMS_CONNECTION_CLUSTER
        );

        this.isClusterConfigSet = true;
    }

    async stake(nftMint: web3.PublicKey) {
        const { publicKey } = useWallet();

        if (!publicKey.value) {
            throw new Error('[TREASURY] not defined: publicKey');
        } else if (!nftMint) {
            throw new Error('[TREASURY] not defined: nftMint');
        }

        if (!this.isClusterConfigSet) {
            await this.setClusterConfig();
        }

        return await createStakeNftTx(nftMint, publicKey.value);
    }

    async withdraw(nftMint: web3.PublicKey, restake?: boolean) {
        const { publicKey } = useWallet();

        if (!publicKey.value) {
            throw new Error('[TREASURY] not defined: publicKey');
        } else if (!nftMint) {
            throw new Error('[TREASURY] not defined: nftMint');
        }

        if (!this.isClusterConfigSet) {
            await this.setClusterConfig();
        }

        return await createWithdrawNft(nftMint, restake ? 1 : 0, publicKey.value);
    }

    async claim(nftMint: web3.PublicKey) {
        const { publicKey } = useWallet();

        if (!publicKey.value) {
            throw new Error('[TREASURY] not defined: publicKey');
        } else if (!nftMint) {
            throw new Error('[TREASURY] not defined: nftMint');
        }

        if (!this.isClusterConfigSet) {
            await this.setClusterConfig();
        }

        return await createClaimRewardTx(nftMint, publicKey.value);
    }

    async getStakings() {
        const { publicKey } = useWallet();

        if (!publicKey.value) {
            throw new Error('[TREASURY] not defined: publicKey');
        }

        if (!this.isClusterConfigSet) {
            await this.setClusterConfig();
        }

        return await getAllRegisters(publicKey.value.toBase58());
    }
}
