import 'solana-wallets-vue/styles.css';

import { defineNuxtPlugin } from '#app';

import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SolletWalletAdapter,
    MathWalletAdapter,
    SlopeWalletAdapter,
    CloverWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import SolanaWallets from 'solana-wallets-vue';

export const walletOptions = {
    wallets: [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new SolletWalletAdapter(),
        new MathWalletAdapter(),
        new SlopeWalletAdapter(),
        new CloverWalletAdapter(),
    ],
    autoConnect: true,
};

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(SolanaWallets, walletOptions);
});
