import { defineStore } from 'pinia';
import { Metaplex } from '@/js/metaplex';
import { WalletBalance } from '@/types/WalletBalance.types';
import { logger } from '@/plugins/logger.client';
import { DataWrapper } from '~/types/DataWrapper.types';
import { CashbackStats } from '~/types/Stats.types';
import { useWallet } from 'solana-wallets-vue';

export const useBalanceStore = defineStore({
    id: 'balances',

    state: () => ({
        escrowHto: new WalletBalance(),
        htoCashback: new DataWrapper<CashbackStats>(),

        balanceGenz: new WalletBalance(),
        balanceSol: new WalletBalance(),
        /*balanceUsdc: new WalletBalance(),*/
    }),

    actions: {
        clearUser() {
            this.escrowHto.clear();

            this.htoCashback.clear();

            this.balanceGenz.clear();
            this.balanceSol.clear();
            /*this.balanceUsdc.clear();*/
        },

        async fetchBalances() {
            const { publicKey } = useWallet();

            if (!publicKey.value) {
                logger.info('not defined: publicKey.value');
                return;
            }

            try {
                const sol = await Metaplex.getInstance().getBalanceSOL(publicKey.value);

                if (sol !== null) {
                    this.balanceSol.setData(sol);
                } else {
                    this.balanceSol.setError();
                }
            } catch (e) {
                logger.error(e);
                this.balanceSol.setError(e);
            }

            try {
                const hto = await Metaplex.getInstance().getBalanceGENZ(publicKey.value);

                if (hto !== null) {
                    this.balanceGenz.setData(hto);
                } else {
                    this.balanceGenz.setError();
                }
            } catch (e) {
                logger.error(e);
                this.balanceGenz.setError(e);
            }

            /*try {
                const usdc = await Metaplex.getInstance().getBalanceUSDC(publicKey);

                if (usdc !== null) {
                    this.balanceUsdc.setData(usdc);
                } else {
                    this.balanceUsdc.setError();
                }
            } catch (e) {
                logger.error(e);
                this.balanceUsdc.setError(e);
            }*/
        },
    },
});
