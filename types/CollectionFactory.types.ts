import { CollectionName } from '~/types/Collection.types';

import { APIResponse } from '~/api/types';
import { ITokenMetadata } from '~/js/metaplex';

import { CollectionList } from '~/types/Collection.data';

import excomsCollectionImg from 'assets/collections/excoms.png';
import { Excoms, ExcomsListing } from '~/types/collections/Excoms.types';

export class CollectionFactory {
    public static createInstance(cname: CollectionName, t: ITokenMetadata) {
        switch (cname) {
            case CollectionName.EXCOMS:
                return new Excoms(t.onChain, t.offChain);
        }
    }

    public static typeListing(cname: CollectionName, data: any) {
        switch (cname) {
            case CollectionName.EXCOMS:
                return data as ExcomsListing;

            default:
                return null;
        }
    }

    public static createListing(cname: CollectionName, data: any) {
        switch (cname) {
            case CollectionName.EXCOMS:
                return new ExcomsListing(data);
        }
    }

    public static typeListingArray(cname: CollectionName, data: any) {
        switch (cname) {
            case CollectionName.EXCOMS:
                return data as ExcomsListing[];

            default:
                return null;
        }
    }

    public static typeListingResponseArray(cname: CollectionName, data: any) {
        switch (cname) {
            case CollectionName.EXCOMS:
                return data as APIResponse<ExcomsListing[]>;

            default:
                return null;
        }
    }

    public static getCollectionCover = (id: string) => {
        switch (id) {
            case CollectionList.get(CollectionName.EXCOMS).id:
                return excomsCollectionImg;

            default:
                return null;
        }
    };

    public static getUpdateAuthority = (cname: CollectionName) => {
        switch (cname) {
            case CollectionName.EXCOMS:
                return import.meta.env.VITE_EXCOMS_UPDATE_AUTHORITY_EXCOMS.split(',');
        }
    };
}
