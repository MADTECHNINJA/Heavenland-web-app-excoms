import { defineStore } from 'pinia';
import { Metaplex } from '@/js/metaplex';
import type { PublicKey } from '@solana/web3.js';

import { DataWrapper } from '@/types/DataWrapper.types';
import { logger } from '@/plugins/logger.client';

import { CollectionList } from '~/types/Collection.data';

import { ActivityResponse, PurchaseState } from '~/types/Activity.types';

import { APIResponse } from '~/api/types';

import { CollectionName } from '~/types/Collection.types';

import { filterTokens } from '~/types/Collection.utils';
import { IExcomsBase } from '~/types/collections/Excoms.types';

export const useAccountStore = defineStore({
    id: 'account',

    state: () => ({
        tokens: {
            excoms: new DataWrapper<IExcomsBase[]>(),
        },
        walletActivity: new DataWrapper<APIResponse<ActivityResponse[]>>(),
    }),

    getters: {
        getListingTokenCollections: (state) => {
            const listingCollections = {};

            for (const [cname, tokens] of Object.entries(state.tokens)) {
                if (CollectionList.get(cname as CollectionName).featureFlags?.allowListing) {
                    listingCollections[cname] = tokens;
                }
            }

            return listingCollections;
        },

        getStampingPfpTokenCollections: (state) => {
            const listingCollections = {};

            for (const [cname, tokens] of Object.entries(state.tokens)) {
                if (CollectionList.get(cname as CollectionName).featureFlags?.allowStamping) {
                    listingCollections[cname] = tokens;
                }
            }

            return listingCollections;
        },

        getStakingTokenCollections: (state): { [key: string]: DataWrapper<any> } => {
            const stakingCollections = {};

            for (const [cname, tokens] of Object.entries(state.tokens)) {
                if (CollectionList.get(cname as CollectionName).featureFlags?.allowStaking) {
                    stakingCollections[cname] = tokens;
                }
            }

            return stakingCollections;
        },

        escrowProcessingAmount: (state) =>
            state.walletActivity.data?.items?.reduce((acc, a) => {
                const isBuyNowProcessing = a.buyNow && a.purchaseState === PurchaseState.PROCESSING;
                return acc + (isBuyNowProcessing ? a.offeredPrice : 0);
            }, 0) ?? 0,
    },

    actions: {
        clearUser() {
            for (const tokenType in this.tokens) {
                this.tokens[tokenType].clear();
            }

            for (const tokenType in this.listedTokens) {
                this.listedTokens[tokenType].clear();
            }

            this.walletActivity.clear();
        },

        async refetchTokens(collection: CollectionName, publicKey: PublicKey | null) {
            this.tokens[collection].clear();

            await this.fetchTokens(publicKey);
        },

        async fetchTokens(publicKey: PublicKey | null) {
            const allTokens = await Metaplex.getInstance().fetchTokens(publicKey);

            for (const [collectionId, collectionData] of CollectionList.entries()) {
                if (collectionData.isComingSoon) {
                    continue;
                }

                const tokens = filterTokens(collectionId, allTokens);

                try {
                    if (tokens) {
                        this.tokens[collectionId].setData(tokens);
                    } else {
                        this.tokens[collectionId].setError();
                    }
                } catch (error: any) {
                    this.tokens[collectionId].setError();

                    logger.error(error);
                    throw new Error(error);
                }

                if (!collectionData.featureFlags?.allowListing) {
                    continue;
                }
            }
        },
    },
});
