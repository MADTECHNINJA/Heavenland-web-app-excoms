import axios from 'axios';

import { logger } from '@/plugins/logger.client';

import { Root, Path } from '@/api/resources';
import { CollectionDetails, CollectionMetadata } from '~/types/Collection.types';

class CollectionService {
    async getMetadata(collection: CollectionDetails): Promise<CollectionMetadata> {
        const res = await axios.get(
            `${Root.MARKETPLACE}/${Path.COLLECTIONS}/${collection?.id}?withStats=true&withFilters=true`
        );

        return new CollectionMetadata(res.data);
    }
}

export default new CollectionService();
