import { useWallet } from 'solana-wallets-vue';
import { useUserInfo } from '~/store/staking/userPool';
import { useBalanceStore } from '~/store/balances';
import { useGlobalInfo } from '~/store/staking/global';
import { useAccountStore } from '@/store/account';

export const useRefreshStakes = async () => {
    const accountStore = useAccountStore();
    const stakingGlobalStore = useGlobalInfo();
    const stakingUserStore = useUserInfo();
    const balanceStore = useBalanceStore();
    const { publicKey } = useWallet();

    await stakingGlobalStore.fetchGlobal();
    await stakingUserStore.clearUser();
    await stakingUserStore.fetchUser();
    await balanceStore.fetchBalances();
    await accountStore.fetchTokens(publicKey.value);
};
