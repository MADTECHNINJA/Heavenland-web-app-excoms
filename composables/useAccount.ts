import { useWallet } from 'solana-wallets-vue';

export const isWalletAddress = (address: string) => {
    const { publicKey } = useWallet();

    return publicKey.value?.toBase58() === address;
};
