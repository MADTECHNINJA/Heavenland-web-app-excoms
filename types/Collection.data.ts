import { CollectionDetails, CollectionName } from '~/types/Collection.types';

import { EExcomsSymbol } from '~/types/collections/Excoms.types';

export const CollectionSymbol = new Map<CollectionName, { [key: string]: string }>([
    [CollectionName.EXCOMS, EExcomsSymbol],
]);

export const CollectionList = new Map<CollectionName, CollectionDetails>([
    [
        CollectionName.EXCOMS,
        {
            id: 'excoms',
            name: 'Excom Society',
            creator: 'Excom',
            isHeavenland: false,
            isComingSoon: false,
            featureFlags: {
                allowListing: true,
                allowStamping: true,
                allowStaking: true,
            },
            unit: 'Excom',
            description: 'From the dust of a burning world, a society that should have never existed has been born.',
        },
    ],
]);
