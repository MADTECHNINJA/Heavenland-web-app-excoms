import type { OffChainMetadata, OnChainMetadata } from '@/js/metaplex';
import { CollectionMetadata, CollectionName } from '~/types/Collection.types';
import { Attributes, IHasAttributes, IListable, Listing } from '~/types/Listing.types';
import { INftBase } from '~/types/Nft.types';

export enum EExcomsSymbol {
    EXCOM = 'EXCOM',
}

export interface IExcomsBase extends INftBase {
    readonly id: string;
    readonly type: string;
    readonly name: string;
    readonly image?: string;
    readonly royalties: number;
    readonly mint: string;
    readonly attributes?: Array<Attributes>;
}

export class Excoms implements IListable, IHasAttributes, IExcomsBase, IStampable {
    onChain: OnChainMetadata;
    offChain: OffChainMetadata;

    readonly id: string;
    readonly name: string;
    readonly royalties: number;
    readonly type: string;
    readonly cname: CollectionName;
    readonly attributes?: Array<Attributes>;

    constructor(onChain: OnChainMetadata, offChain: OffChainMetadata) {
        this.onChain = onChain;
        this.offChain = offChain;

        this.cname = CollectionName.EXCOMS;
        this.type = onChain.data.symbol;
        this.royalties = onChain.data.sellerFeeBasisPoints;
        this.id = offChain?.external_url.slice(offChain?.external_url.lastIndexOf('/') + 1) ?? onChain.data.name;
        this.name = onChain.data.name;
        this.attributes = offChain?.attributes
            .map((a: { trait_type: string; value: string | number }) => {
                return {
                    displayName: a.trait_type,
                    value: a.value,
                };
            })
            .sort((a, b) => (a.displayName[0] >= b.displayName[0] ? 1 : -1));
    }

    get image() {
        return this.offChain?.image;
    }

    get mint() {
        return this.onChain.mint;
    }

    cropParameters(size: number) {
        const x = size / 2;
        const y = size / 2;

        return {
            x,
            y,
            r: Math.min(x, y) - size / 10,
        };
    }
}

export class ExcomsListingNFT implements IExcomsBase, IListable {
    id: string;
    mint: string;
    name: string;
    attributes: Array<Attributes>;
    royalties: number;
    type: string;
    image: string;
    collection: Pick<CollectionMetadata, 'id' | 'name' | 'traits'>;
    cname: CollectionName;

    constructor(data: any) {
        this.id = data.id;
        this.mint = data.mint;
        this.name = data.name;
        this.attributes = data.attributes.sort((a, b) => (a.displayName[0] >= b.displayName[0] ? 1 : -1));
        this.royalties = data.royalties;
        this.type = data.symbol;
        this.image = data.image;
        this.collection = data.collection;
        this.cname = CollectionName.EXCOMS;
    }
}

export class ExcomsListing extends Listing {
    readonly nft: ExcomsListingNFT;

    constructor(data: any) {
        super(data);

        data.nft.mint = data.nft.address;

        this.nft = new ExcomsListingNFT(data.nft);
    }
}
