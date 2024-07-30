// utils/SplTokenMintingUtils.ts

import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createMintToInstruction,
} from "@solana/spl-token";

export interface SplTokenMetadata {
    name: string;
    symbol: string;
}

export interface SplMintParams {
    connection: Connection;
    payer: PublicKey;
    mintKeypair: Keypair;
    decimals: number;
    mintAuthority: PublicKey;
    freezeAuthority: PublicKey | null;
    metadata: SplTokenMetadata;
}

export async function createSplTokenMint({
    connection,
    payer,
    mintKeypair,
    decimals,
    mintAuthority,
    freezeAuthority,
    metadata,
}: SplMintParams): Promise<Transaction> {
    const mint = mintKeypair.publicKey;

    const mintRent = await connection.getMinimumBalanceForRentExemption(82);

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint,
            space: 82,
            lamports: mintRent,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
            mint,
            decimals,
            mintAuthority,
            freezeAuthority,
            TOKEN_PROGRAM_ID
        )
    );

    return transaction;
}

export interface SplMintTokensParams {
    connection: Connection;
    payer: PublicKey;
    mint: PublicKey;
    destination: PublicKey;
    mintAuthority: PublicKey;
    amount: number;
    decimals: number;
}

export async function createSplMintTokensTransaction({
    connection,
    payer,
    mint,
    destination,
    mintAuthority,
    amount,
    decimals,
}: SplMintTokensParams): Promise<Transaction> {
    const associatedTokenAddress = await getAssociatedTokenAddress(mint, destination);
    
    const transaction = new Transaction();

    // Check if the token account exists
    const tokenAccount = await connection.getAccountInfo(associatedTokenAddress);
    if (!tokenAccount) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                payer,
                associatedTokenAddress,
                destination,
                mint
            )
        );
    }

    transaction.add(
        createMintToInstruction(
            mint,
            associatedTokenAddress,
            mintAuthority,
            amount * (10 ** decimals)
        )
    );

    return transaction;
}