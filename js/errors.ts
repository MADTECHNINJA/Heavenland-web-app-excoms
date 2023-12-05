export const isUserRejectedTx = (e: any) => {
    return JSON.parse(JSON.stringify(e))?.['error']?.['code'] === 4001;
};
