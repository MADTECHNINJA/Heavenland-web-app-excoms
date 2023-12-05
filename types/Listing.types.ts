import { ActivityAction } from '~/types/Activity.types';

export type Attributes = {
    displayName: string;
    name?: string;
    filterable?: boolean;
    value: string | number;
};

export interface IHasAttributes {
    readonly attributes?: Array<Attributes>;
}

export interface IListable {
    id: string;
    mint: string;
    name: string;
    image: string;
}

type ListingState = 'active' | 'canceled' | 'sold';

export class Listing {
    id: string;
    type: ActivityAction;
    transactionId: string;
    secret: string;
    createdAt: number;
    acknowledgedAt: number;
    wallet: {
        id: string;
    };
    price: number;
    state: ListingState;

    constructor(data: any) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.acknowledgedAt = data.acknowledgedAt;
        this.wallet = data.wallet;
        this.type = data.type;
        this.price = data.price;
        this.secret = data.secret;
        this.transactionId = data.transactionId;
        this.state = data.state;
    }
}
