import { CollectionDetails } from '~/types/Collection.types';

export type ActivityRequestSale = {
    type: ActivityAction;
    offerId: number;
};

export type ActivityRequestList = {
    type: ActivityAction;
    tokenAddress: string;
    ownerAddress: string;
    price: number;
};

export type ActivityRequestOffer = {
    listingId: number;
    type: ActivityAction;
    buyerAddress: string;
    offeredPrice: number;
};

export type ActivityRequestCancelListing = {
    listingId: number;
    type: ActivityAction;
};

export enum ActivityAction {
    OFFER = 'offer',
    SALE = 'sale',
    LISTING = 'listing',
    LISTING_CANCELLATION = 'listing_cancellation',
}

export enum PurchaseState {
    WAITING_FOR_OFFER_ACK = 'waiting_for_offer_ack',
    PROCESSING = 'processing',
    UNFEASIBLE = 'unfeasible',
    DONE = 'done',
}

export enum ActivityActionTitle {
    sale = 'Sale',
    offer = 'Offer',
    listing = '' + 'Listing',
    listing_cancellation = 'Cancel listing',
}

type timestamp = number;

export type ActivityResponse = {
    id: number;
    type: ActivityAction;
    secret: string;
    createdAt: timestamp;
    tokenAddress?: string;
    price: number;
    acknowledgedAt: timestamp | null;
    transactionId: string;
    buyNow?: boolean;
    offeredPrice?: number;
    purchaseState?: PurchaseState;
    wallet: {
        id: string;
    };
    nft: {
        address: string;
        name: string | null;
        symbol: string | null;
        description: string | null;
        image: string | null;
        externalUrl: string | null;
        royalties: string | null;
        collection: CollectionDetails;
    };
    buyerWallet?: {
        id: string;
    };
};

export type AcknowledgeRequest = {
    type: ActivityAction;
    secret: string;
    blockchainTransactionResult: {
        status: 'success' | 'failure' | 'cancellation';
        transactionId?: string;
        message?: string;
    };
};
