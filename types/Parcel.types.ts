import type { OffChainMetadata, OnChainMetadata } from '@/js/metaplex';
import { Attributes, IHasAttributes, IListable, Listing } from '~/types/Listing.types';
import { transformParcelZone } from '~/types/Parcel.utils';
import { CollectionMetadata, CollectionName } from '~/types/Collection.types';
import { INftBase } from '~/types/Nft.types';
import { IStakable } from '~/types/Staking.types';

export enum EParcelSymbol {
    PARCEL = 'PARCEL NFT',
    PARCEL_BUCKET = 'BUCKET NFT',
}

export enum EParcelZone {
    HIGHRISE = 'Highrise',
    DOWNTOWN = 'Downtown',
    BLOCK_CITY = 'Block City',
    SUBURBAN = 'Suburban',
}

export interface IParcelBase extends INftBase {
    readonly id: string;
    readonly type: EParcelSymbol;
    readonly name: string;
    readonly image?: string;
    readonly royalties: number;
    readonly coordinates?: string;
    readonly mint: string;
    readonly attributes?: Array<Attributes>;
    readonly zone: EParcelZone;
    readonly cluster: string;
    readonly subzone: number;
    readonly parcels?: Array<string>;
    readonly isParcelBucket: boolean;
    readonly highTrafficAmount: number;
    readonly drillThroughAmount: number;
}

export abstract class ParcelBase implements IParcelBase, IListable, IHasAttributes, IStakable {
    onChain: OnChainMetadata;
    offChain: OffChainMetadata;

    readonly attributes?: Array<Attributes>;
    readonly id: string;
    readonly royalties: number;
    readonly coordinates?: string;
    readonly type: EParcelSymbol;
    readonly cluster: string;
    readonly subzone: number;
    readonly cname: CollectionName;

    protected constructor(onChain: OnChainMetadata, parcelType: EParcelSymbol, offChain?: OffChainMetadata) {
        this.onChain = onChain;
        this.offChain = offChain;
        this.cname = CollectionName.PARCELS;

        this.royalties = onChain.data.sellerFeeBasisPoints;
        this.id = offChain?.external_url.slice(offChain?.external_url.lastIndexOf('/') + 1) ?? onChain.data.name;
        this.attributes = offChain?.attributes
            .map((a: { trait_type: string; value: string | number }) => {
                return {
                    displayName: a.trait_type,
                    value: a.value,
                };
            })
            .sort((a, b) => (a.displayName[0] >= b.displayName[0] ? 1 : -1));
        this.type = parcelType;
        this.coordinates = offChain?.name.slice(offChain?.name.indexOf('['));
        this.cluster = this.attributes?.find((a) => a.displayName === 'Cluster')!.value as string;
        this.subzone = this.attributes?.find((a) => a.displayName === 'SubZone')!.value as number;
    }

    get image() {
        return this.offChain?.image;
    }

    get mint() {
        return this.onChain.mint;
    }

    get zone() {
        const zoneText = this.attributes?.find((a) => a.displayName === 'Zone')!.value;

        return zoneText ? transformParcelZone(zoneText as string) : undefined;
    }

    get name() {
        return this.offChain ? `${this.cluster}${this.subzone} ${this.coordinates}` : this.onChain.data.name;
    }

    get isParcelBucket() {
        return this.type === EParcelSymbol.PARCEL_BUCKET;
    }

    get highTrafficAmount() {
        if (!this.offChain) {
            return null;
        }

        switch (this.type) {
            case EParcelSymbol.PARCEL:
                return this.attributes?.find((a) => a.displayName === 'High Traffic')?.value === 'Yes' ? 1 : 0;

            case EParcelSymbol.PARCEL_BUCKET:
                return this.attributes?.find((a) => a.displayName === 'High Traffic')?.value as number;
        }
    }

    get drillThroughAmount() {
        if (!this.offChain) {
            return null;
        }

        switch (this.type) {
            case EParcelSymbol.PARCEL:
                return this.attributes?.find((a) => a.displayName === 'Drill Through')?.value === 'Yes' ? 1 : 0;

            case EParcelSymbol.PARCEL_BUCKET:
                return this.attributes?.find((a) => a.displayName === 'Drill Through')?.value as number;
        }
    }
}

export class Parcel extends ParcelBase implements IParcelBase {
    constructor(onChain: OnChainMetadata, offChain: OffChainMetadata) {
        super(onChain, EParcelSymbol.PARCEL, offChain);
    }
}

export class ParcelBucket extends ParcelBase implements IParcelBase {
    readonly parcels: Array<string>;

    constructor(onChain: OnChainMetadata, offChain: OffChainMetadata) {
        super(onChain, EParcelSymbol.PARCEL_BUCKET, offChain);

        let parcels = this.attributes?.find((a) => a.displayName === 'Parcel Mint Addresses')?.value as any;

        parcels = parcels?.slice(1).slice(0, -1);
        this.parcels = parcels?.split(',') ?? [];
        this.parcels = this.parcels?.map((i) => i.slice(1, -1));
    }
}

export class ParcelListingNFT implements IListable, IParcelBase, IHasAttributes {
    id: string;
    coordinates: string;
    mint: string;
    collection: Pick<CollectionMetadata, 'id' | 'name' | 'traits'>;
    attributes: Array<Attributes>;
    royalties: number;
    externalUrl: string;
    symbol: string;
    description: string;
    image: string;
    readonly cname: CollectionName;
    readonly parcels?: Array<string>;
    readonly type: EParcelSymbol;
    readonly cluster: string;
    readonly subzone: number;

    constructor(data: any) {
        this.mint = data.mint;
        this.collection = data.collection;
        this.attributes = data.attributes.sort((a, b) => (a.displayName[0] >= b.displayName[0] ? 1 : -1));
        this.royalties = data.royalties;
        this.externalUrl = data.externalUrl;
        this.description = data.description;
        this.image = data.image;

        this.cname = CollectionName.PARCELS;
        this.type = data.symbol;
        this.symbol = data.symbol;

        this.id =
            this.externalUrl.indexOf('parcel/') !== -1
                ? this.externalUrl.slice(this.externalUrl.indexOf('parcel/') + 7)
                : this.externalUrl.slice(this.externalUrl.indexOf('parcel-bucket/') + 14);

        this.coordinates = data.name.slice(data.name.indexOf('['));
        this.cluster = this.attributes!.find((a) => a.displayName === 'Cluster')!.value as string;
        this.subzone = this.attributes!.find((a) => a.displayName === 'SubZone')!.value as number;

        let parcels = this.attributes.find((a) => a.displayName === 'Parcel Mint Addresses')?.value as any;

        parcels = parcels?.slice(1).slice(0, -1);
        this.parcels = parcels?.split(',') ?? [];
        this.parcels = this.parcels?.map((i) => i.slice(1, -1));
    }

    get zone() {
        const zoneText = this.attributes!.find((a) => a.displayName === 'Zone')!.value;

        return transformParcelZone(zoneText as string);
    }

    get name() {
        return `${this.cluster}${this.subzone} ${this.coordinates}`;
    }

    get isParcelBucket() {
        return this.type === EParcelSymbol.PARCEL_BUCKET;
    }

    get highTrafficAmount(): number {
        switch (this.type) {
            case EParcelSymbol.PARCEL:
                return this.attributes.find((a) => a.displayName === 'High Traffic')?.value === 'Yes' ? 1 : 0;

            case EParcelSymbol.PARCEL_BUCKET:
                return this.attributes.find((a) => a.displayName === 'High Traffic')?.value as number;
        }
    }

    get drillThroughAmount() {
        switch (this.type) {
            case EParcelSymbol.PARCEL:
                return this.attributes.find((a) => a.displayName === 'Drill Through')?.value === 'Yes' ? 1 : 0;

            case EParcelSymbol.PARCEL_BUCKET:
                return this.attributes.find((a) => a.displayName === 'Drill Through')?.value as number;
        }
    }
}

export class ParcelListing extends Listing {
    readonly nft: ParcelListingNFT;

    constructor(data: any) {
        super(data);

        data.nft.mint = data.nft.address;

        this.nft = new ParcelListingNFT(data.nft);
    }

    get mint() {
        return this.nft.mint;
    }
}
