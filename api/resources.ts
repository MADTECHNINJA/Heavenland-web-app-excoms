export const ITEMS_PER_PAGE = 24;

export const enum Root {
    MARKETPLACE = 'marketplace',
    STAKING = 'staking',
}

export const enum Path {
    LISTINGS = 'listings',
    ACTIVITIES = 'activities',
    COLLECTIONS = 'collections',
    DAO = 'dao',
    STATS = 'stats',
    INFO = 'info',
}

export const SubPath = {
    ACTIVITIES: {
        ACK: 'ack',
    },
    STATS: {
        SALE: 'sale-stats',
    },
    INFO: {
        FIND_NFT_CONSTANTS: 'find-nft-constants',
    },
    DAO: {
        WALLETS: 'wallets',
        VOTES: 'votes',
        ACCOUNT: 'accounts',
    },
};
