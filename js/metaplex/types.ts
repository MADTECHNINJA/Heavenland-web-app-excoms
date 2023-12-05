import * as anchor from '@project-serum/anchor';
import * as web3 from '@solana/web3.js';

export const MEMO_PROGRAM_ID = new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
export const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const AUCTION_HOUSE = 'auction_house';
export const AUCTION_HOUSE_PROGRAM_ID = new anchor.web3.PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk');
export const WRAPPED_SOL_MINT = new anchor.web3.PublicKey('So11111111111111111111111111111111111111112');
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

// eslint-disable-next-line no-control-regex
export const METADATA_REPLACE = new RegExp('\u0000', 'g');

export enum MetadataKey {
    Uninitialized = 0,
    MetadataV1 = 4,
    EditionV1 = 1,
    MasterEditionV1 = 2,
    MasterEditionV2 = 6,
    EditionMarker = 7,
}

type StringPublicKey = string;

export class Creator {
    address: StringPublicKey;
    verified: number;
    share: number;

    constructor(args: { address: StringPublicKey; verified: number; share: number }) {
        this.address = args.address;
        this.verified = args.verified;
        this.share = args.share;
    }
}

export class Data {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
    constructor(args: {
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
        creators: Creator[] | null;
    }) {
        this.name = args.name;
        this.symbol = args.symbol;
        this.uri = args.uri;
        this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
        this.creators = args.creators;
    }
}

export class Metadata {
    key: MetadataKey;
    updateAuthority: StringPublicKey;
    mint: StringPublicKey;
    data: Data;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number | null;

    // set lazy
    masterEdition?: StringPublicKey;
    edition?: StringPublicKey;

    constructor(args: {
        updateAuthority: StringPublicKey;
        mint: StringPublicKey;
        data: Data;
        primarySaleHappened: boolean;
        isMutable: boolean;
        editionNonce: number | null;
    }) {
        this.key = MetadataKey.MetadataV1;
        this.updateAuthority = args.updateAuthority;
        this.mint = args.mint;
        this.data = args.data;
        this.primarySaleHappened = args.primarySaleHappened;
        this.isMutable = args.isMutable;
        this.editionNonce = args.editionNonce ?? null;
    }
}

export class CreateMetadataArgs {
    instruction = 0;
    data: Data;
    isMutable: boolean;

    constructor(args: { data: Data; isMutable: boolean }) {
        this.data = args.data;
        this.isMutable = args.isMutable;
    }
}

export class UpdateMetadataArgs {
    instruction = 1;
    data: Data | null;
    // Not used by this app, just required for instruction
    updateAuthority: StringPublicKey | null;
    primarySaleHappened: boolean | null;
    constructor(args: { data?: Data; updateAuthority?: string; primarySaleHappened: boolean | null }) {
        this.data = args.data ? args.data : null;
        this.updateAuthority = args.updateAuthority ? args.updateAuthority : null;
        this.primarySaleHappened = args.primarySaleHappened;
    }
}

export class CreateMasterEditionArgs {
    instruction = 10;
    maxSupply: anchor.BN | null;
    constructor(args: { maxSupply: anchor.BN | null }) {
        this.maxSupply = args.maxSupply;
    }
}

export const METADATA_SCHEMA = new Map<any, any>([
    [
        CreateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', Data],
                ['isMutable', 'u8'], // bool
            ],
        },
    ],
    [
        CreateMasterEditionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['maxSupply', { kind: 'option', type: 'u64' }],
            ],
        },
    ],
    [
        UpdateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', { kind: 'option', type: Data }],
                ['updateAuthority', { kind: 'option', type: 'pubkeyAsString' }],
                ['primarySaleHappened', { kind: 'option', type: 'u8' }],
            ],
        },
    ],
    [
        Data,
        {
            kind: 'struct',
            fields: [
                ['name', 'string'],
                ['symbol', 'string'],
                ['uri', 'string'],
                ['sellerFeeBasisPoints', 'u16'],
                ['creators', { kind: 'option', type: [Creator] }],
            ],
        },
    ],
    [
        Creator,
        {
            kind: 'struct',
            fields: [
                ['address', 'pubkeyAsString'],
                ['verified', 'u8'],
                ['share', 'u8'],
            ],
        },
    ],
    [
        Metadata,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['updateAuthority', 'pubkeyAsString'],
                ['mint', 'pubkeyAsString'],
                ['data', Data],
                ['primarySaleHappened', 'u8'], // bool
                ['isMutable', 'u8'], // bool
                ['editionNonce', { kind: 'option', type: 'u8' }],
            ],
        },
    ],
]);
