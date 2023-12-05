export const getTxSolscanUrl = (txSig: string) => {
    const isDevnet = import.meta.env.VITE_EXCOMS_MODE === 'development';

    return `https://solscan.io/tx/${txSig}?${isDevnet ? 'cluster=devnet' : ''}`;
};

export const getTokenSolscanUrl = (token: string) => {
    const isDevnet = import.meta.env.VITE_EXCOMS_MODE === 'development';

    return `https://solscan.io/token/${token}?${isDevnet ? 'cluster=devnet' : ''}`;
};
