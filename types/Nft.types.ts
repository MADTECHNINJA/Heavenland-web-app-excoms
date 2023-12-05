import { Attributes } from '~/types/Listing.types';
import { CollectionName } from '~/types/Collection.types';

export interface INftBase {
    readonly id: string;
    readonly type: string;
    readonly name: string;
    readonly image?: string;
    readonly royalties: number;
    readonly mint: string;
    readonly attributes?: Array<Attributes>;
    readonly cname: CollectionName;
}
