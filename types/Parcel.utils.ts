import { EParcelZone } from '~/types/Parcel.types';

export const transformParcelZone = (nftZone: string): EParcelZone => {
    switch (nftZone) {
        case 'Highrise':
            return EParcelZone.HIGHRISE;

        case 'Downtown':
            return EParcelZone.DOWNTOWN;

        case 'Block City':
            return EParcelZone.BLOCK_CITY;

        default:
            return EParcelZone.SUBURBAN;
    }
};
