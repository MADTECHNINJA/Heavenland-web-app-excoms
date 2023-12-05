import numeral from 'numeral';
import moment from 'moment';

export const formatAddress = (address: string | null | undefined) => {
    if (address === null || address === undefined) {
        return null;
    }

    const address1 = address.slice(0, 5);
    const address2 = address.slice(-5);

    return address1 + '....' + address2;
};

export const roundNumberToDecimals = (number: number) => {
    return Math.floor(number * 100) / 100;
};

export const formatNumberToDecimal = (number: number | undefined | null | string, expanded = false) => {
    if (number === null || number === undefined) {
        return null;
    }

    if (typeof number === 'string') {
        number = parseFloat(number);
    }
    if (expanded) {
        return number.toFixed(2);
    }
    return numeral(roundNumberToDecimals(number)).format('0,0.[00]');
};

export const formatNumber = (number: number | undefined | null | string) => {
    if (number === null || number === undefined) {
        return null;
    }

    if (typeof number === 'string') {
        number = parseFloat(number);
    }

    return numeral(number).format('0,0');
};

export const formatDateWithTime = (timestamp: number | string, correction = false) => {
    const timestampWithMilliseconds = typeof timestamp === 'number' ? timestamp.toString() : timestamp;
    return moment(parseInt(timestampWithMilliseconds + (correction ? '000' : ''))).format('DD. MM. YYYY HH:mm');
};

export const newDate = (timestamp, correction = false) => {
    return correction ? moment(parseInt(timestamp.toString() + '000')) : moment(timestamp);
};
