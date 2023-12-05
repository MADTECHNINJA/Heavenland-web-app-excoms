import { DataWrapper } from '@/types/DataWrapper.types';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { formatNumberToDecimal } from '~/js/formatting';

export class WalletBalance extends DataWrapper<number> {
    getUnformattedAmount() {
        return (this.data ?? 0) / LAMPORTS_PER_SOL;
    }

    getFormattedAmount() {
        return formatNumberToDecimal(this.getUnformattedAmount());
    }
}
