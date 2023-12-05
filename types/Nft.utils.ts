import { INftBase } from '~/types/Nft.types';

export const getNftAttribute = (item: INftBase, attribute: string): string | number => {
    return item?.attributes?.find((item) => item.displayName === attribute)?.value;
};
