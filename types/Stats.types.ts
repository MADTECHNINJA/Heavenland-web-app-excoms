import { formatNumberToDecimal } from '~/js/formatting';

export type SaleStats = {
    salesPerWallet: WalletSale[];
};

export type WalletSale = {
    wallet: string;
    numberOfPurchases: number;
    volume: number;
};

export class CashbackStats {
    wallet: string;
    private readonly _cashbackAmount: number;
    private readonly _cashbackAmountMarketplace: number;
    private readonly _cashbackAmountMerging: number;
    private readonly _cashbackAmountClaimed: number;
    private readonly _cashbackAmountToBeClaimed: number;

    constructor(data: any) {
        this.wallet = data.wallet;
        this._cashbackAmount = data.cashbackAmount;
        this._cashbackAmountMarketplace = data.cashbackAmountMarketplace;
        this._cashbackAmountMerging = data.cashbackAmountMerging;
        this._cashbackAmountClaimed = data.cashbackAmountClaimed;
        this._cashbackAmountToBeClaimed = data.cashbackAmountToBeClaimed;
    }

    get cashbackAmount() {
        return this._cashbackAmount !== null ? formatNumberToDecimal(this._cashbackAmount) : '--' ?? '--';
    }

    get cashbackAmountToBeClaimed() {
        return this._cashbackAmountToBeClaimed !== null
            ? formatNumberToDecimal(this._cashbackAmountToBeClaimed)
            : '--' ?? '--';
    }

    get cashbackAmountClaimed() {
        return this._cashbackAmountClaimed !== null ? formatNumberToDecimal(this._cashbackAmountClaimed) : '--' ?? '--';
    }

    get cashbackAmountMarketplace() {
        return this._cashbackAmountMarketplace !== null
            ? formatNumberToDecimal(this._cashbackAmountMarketplace)
            : '--' ?? '--';
    }

    get cashbackAmountMerging() {
        return this._cashbackAmountMerging !== null ? formatNumberToDecimal(this._cashbackAmountMerging) : '--' ?? '--';
    }
}

export class MarketplaceStats {
    collection: string | null;
    private readonly _volumeTotal: number | null;
    private readonly _volume24h: number | null;
    private readonly _floorPrice: number | null;
    private readonly _totalListed: number | null;
    private readonly _averageSalePrice: number | null;

    constructor(data: any) {
        this.collection = data.collection ?? null;
        this._volumeTotal = data.volumeTotal;
        this._volume24h = data.volume24h;
        this._floorPrice = data.floorPrice;
        this._totalListed = data.totalListed;
        this._averageSalePrice = data.averageSalePrice;
    }

    get floorPrice() {
        return this._floorPrice?.toFixed(2) ?? '--';
    }

    get totalListed() {
        return this._totalListed ?? '--';
    }

    get averageSalePrice() {
        return this._averageSalePrice?.toFixed(2) ?? '--';
    }

    get volume24h() {
        return this._volume24h !== null ? formatNumberToDecimal(this._volume24h) : '--' ?? '--';
    }

    get volumeTotal() {
        return this._volumeTotal !== null ? formatNumberToDecimal(this._volumeTotal) : '--' ?? '--';
    }
}
