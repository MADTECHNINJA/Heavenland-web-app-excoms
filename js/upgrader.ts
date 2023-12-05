import { useAnchorWallet, useWallet } from 'solana-wallets-vue';
import {
    getTimestamp,
    createUpgradeInitTx,
    getAllOperation,
    setClusterConfig,
    setLoggerMode,
} from '~/js/contracts/upgrader/upgrader/cli/script';
import { UpgradeInitParams } from '~/js/contracts/upgrader/upgrader/cli/types';

export class Upgrader {
    private static instance?: Upgrader;

    public static getInstance(): Upgrader {
        if (!Upgrader.instance) {
            Upgrader.instance = new Upgrader();
        }

        return Upgrader.instance;
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

    async initUpgrade(params: Pick<UpgradeInitParams, 'excomMint' | 'depositAmount'>) {
        const { publicKey } = useWallet();

        if (!publicKey.value) {
            throw new Error('[TREASURY] not defined: publicKey');
        }

        if (!this.isClusterConfigSet) {
            await this.setClusterConfig();
        }

        const now = await getTimestamp();
        const str = 'upgrade' + now.toString();

        return await createUpgradeInitTx({
            userAddress: publicKey.value,
            excomMint: params.excomMint,
            depositAmount: params.depositAmount,
            str,
        });
    }

    async getOperations() {
        const { publicKey } = useWallet();

        if (!publicKey.value) {
            throw new Error('[TREASURY] not defined: publicKey');
        }

        if (!this.isClusterConfigSet) {
            await this.setClusterConfig();
        }

        const { upgrades } = await getAllOperation(publicKey.value.toBase58());

        return upgrades;
    }
}
