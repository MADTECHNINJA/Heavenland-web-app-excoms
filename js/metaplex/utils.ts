import * as anchor from '@project-serum/anchor';
import * as web3 from '@solana/web3.js';
import { deserializeUnchecked } from 'borsh';
import { TOKEN_METADATA_PROGRAM_ID } from '~/js/metaplex/types';
import {
    AUCTION_HOUSE,
    AUCTION_HOUSE_PROGRAM_ID,
    METADATA_SCHEMA,
    METADATA_REPLACE,
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    WRAPPED_SOL_MINT,
    Metadata,
} from '~/js/metaplex/types';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection } from '@metaplex/js';

export async function getTokenAmount(
    connection: Connection,
    account: anchor.web3.PublicKey,
    mint: anchor.web3.PublicKey
): Promise<number> {
    let amount = 0;
    if (!mint.equals(WRAPPED_SOL_MINT)) {
        const token = await connection.getTokenAccountBalance(account);
        amount = token.value.uiAmount * Math.pow(10, token.value.decimals);
    } else {
        amount = await connection.getBalance(account);
    }
    return amount;
}

export const getAuctionHouseBuyerEscrow = async (
    auctionHouse: anchor.web3.PublicKey,
    wallet: anchor.web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
        AUCTION_HOUSE_PROGRAM_ID
    );
};

export const decodeMetadata = (buffer: Buffer): Metadata => {
    const metadata = deserializeUnchecked(METADATA_SCHEMA, Metadata, buffer) as Metadata;
    metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
    metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
    metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
    return metadata;
};

export const getMetadata = async (mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
    return (
        await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            TOKEN_METADATA_PROGRAM_ID
        )
    )[0];
};

export const getAtaForMint = async (
    mint: anchor.web3.PublicKey,
    buyer: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
    const [a, _] = await anchor.web3.PublicKey.findProgramAddress(
        [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    return a;
};

export const getAuctionHouseTradeState = async (
    auctionHouse: anchor.web3.PublicKey,
    wallet: anchor.web3.PublicKey,
    tokenAccount: anchor.web3.PublicKey,
    treasuryMint: anchor.web3.PublicKey,
    tokenMint: anchor.web3.PublicKey,
    tokenSize: anchor.BN,
    buyPrice: anchor.BN
): Promise<[web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(AUCTION_HOUSE),
            wallet.toBuffer(),
            auctionHouse.toBuffer(),
            tokenAccount.toBuffer(),
            treasuryMint.toBuffer(),
            tokenMint.toBuffer(),
            buyPrice.toArrayLike(Buffer, 'le', 8),
            tokenSize.toArrayLike(Buffer, 'le', 8),
        ],
        AUCTION_HOUSE_PROGRAM_ID
    );
};

export const getAuctionHouseProgramAsSigner = async (): Promise<[web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(AUCTION_HOUSE), Buffer.from('signer')],
        AUCTION_HOUSE_PROGRAM_ID
    );
};

export const getPriceWithMantissa = async (
    connection: Connection,
    price: number,
    mint: web3.PublicKey,
    walletKeyPair: any
): Promise<number> => {
    const token = new Token(connection, new web3.PublicKey(mint), TOKEN_PROGRAM_ID, walletKeyPair);

    const mintInfo = await token.getMintInfo();

    const mantissa = 10 ** mintInfo.decimals;

    return Math.ceil(price * mantissa);
};
