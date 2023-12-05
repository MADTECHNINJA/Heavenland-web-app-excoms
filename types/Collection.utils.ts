import { CollectionFilters, CollectionName, FilterType } from '~/types/Collection.types';
import { EParcelZone, Parcel } from '~/types/Parcel.types';
import { ITokenMetadata } from '~/js/metaplex';
import { INftBase } from '~/types/Nft.types';
import { APIResponse } from '~/api/types';
import { CollectionSymbol } from '~/types/Collection.data';
import { CollectionFactory } from '~/types/CollectionFactory.types';

export const _hasCollectionSymbol = (cs: { [key: string]: string }, symbol: string) => {
    return Object.values(cs).find((s) => s === symbol);
};

export const filterTokens = (collectionId: CollectionName, tokens: ITokenMetadata[]) => {
    const updateAuthorities = CollectionFactory.getUpdateAuthority(collectionId);

    if (!updateAuthorities) {
        return;
    }

    const collectionSymbols = CollectionSymbol.get(collectionId);

    return tokens
        .filter((t) => {
            return (
                updateAuthorities.includes(t.onChain.updateAuthority) &&
                _hasCollectionSymbol(collectionSymbols, t.onChain.data.symbol)
            );
        })
        .map((t) => {
            return CollectionFactory.createInstance(collectionId, t);
        });
};

export const sortTokens = (collectionId: CollectionName, tokens: INftBase[]): any => {
    if (!tokens.length) {
        return tokens;
    }
};

const _sortTokensByListing = (a: INftBase, b: INftBase, listed: APIResponse<INftBase[]>) => {
    const isListed = {
        a: listed?.items?.some((p) => a.mint === p.mint),
        b: listed?.items?.some((p) => b.mint === p.mint),
    };

    return isListed.a === isListed.b ? 0 : isListed.a ? -1 : 1;
};

const _sortTokensByZone = (a: Parcel, b: Parcel) => {
    const x = [EParcelZone.HIGHRISE, EParcelZone.DOWNTOWN, EParcelZone.BLOCK_CITY, EParcelZone.SUBURBAN];

    return a.zone === b.zone ? 0 : x.indexOf(a.zone) < x.indexOf(b.zone) ? -1 : 1;
};

const _sortTokensByCluster = (a: Parcel, b: Parcel) => {
    const x = {
        a: a.cluster + a.subzone,
        b: b.cluster + b.subzone,
    };

    return x.a === x.b ? 0 : x.a < x.b ? -1 : 1;
};

export const resetAllFilters = (filters: CollectionFilters[]) => {
    for (const filter of filters) {
        switch (filter.uiType.type) {
            case FilterType.OPTIONS:
                for (const option of filter.uiType.values) {
                    option.checked = false;
                }
                break;

            case FilterType.SLIDER:
                filter.uiType.slider.amount = [filter.uiType.slider.min, filter.uiType.slider.max];
                break;

            case FilterType.RADIUS:
                filter.uiType.amount = null;
                break;
        }
    }
};
