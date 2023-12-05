import { defineStore } from 'pinia';
import { DataWrapper } from '@/types/DataWrapper.types';
import { logger } from '@/plugins/logger.client';
import { API } from '~/api';
import { CollectionMetadata, CollectionName } from '~/types/Collection.types';
import { CollectionList } from '~/types/Collection.data';

export const useCollectionStore = defineStore({
    id: 'collection',

    state: () => ({
        metadata: {
            excoms: new DataWrapper<CollectionMetadata>(),
        },
    }),

    actions: {
        async fetchCollectionInfo(identifier: CollectionName) {
            try {
                const cm = await API.CollectionService.getMetadata(CollectionList.get(identifier));

                this.metadata[identifier].setData(cm);
            } catch (e: any) {
                this.metadata[identifier].setError(e);

                await logger.error(e);
                throw e;
            }
        },
    },
});
