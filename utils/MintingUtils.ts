// utils/MintingUtils.ts
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    ExtensionType,
    createInitializeMetadataPointerInstruction,
    createMintToInstruction,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { createInitializeInstruction } from "@solana/spl-token-metadata";


export interface TokenMetadata {
    name: string;
    symbol: string;
    uri: string;
}

export interface MintParams {
    connection: Connection;
    payer: PublicKey;
    mintKeypair: Keypair;
    decimals: number;
    mintAuthority: PublicKey;
    freezeAuthority: PublicKey | null;
    metadata: TokenMetadata;
}

export async function createToken2022WithMetadata({
    connection,
    payer,
    mintKeypair,
    decimals,
    mintAuthority,
    freezeAuthority,
    metadata,
}: MintParams): Promise<Transaction> {
    const mint = mintKeypair.publicKey;

    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    
    const metadataLen = 1 + 32 + 32 + 32 + 2 + metadata.name.length + 2 + metadata.symbol.length + 2 + metadata.uri.length;
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
            mint,
            mintAuthority,
            mint,
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
            mint,
            decimals,
            mintAuthority,
            freezeAuthority,
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint,
            updateAuthority: mintAuthority,
            mint: mint,
            mintAuthority: mintAuthority,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
        })
    );

    return transaction;
}

export interface MintTokensParams {
    connection: Connection;
    payer: PublicKey;
    mint: PublicKey;
    destination: PublicKey;
    mintAuthority: PublicKey;
    amount: number;
    decimals: number;
}

export async function createMintTokensTransaction({
    connection,
    payer,
    mint,
    destination,
    mintAuthority,
    amount,
    decimals,
}: MintTokensParams): Promise<Transaction> {
    const destinationAta = getAssociatedTokenAddressSync(mint, destination, true, TOKEN_2022_PROGRAM_ID);
    
    const transaction = new Transaction();

    // Check if the token account exists
    const tokenAccount = await connection.getAccountInfo(destinationAta);
    if (!tokenAccount) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                payer,
                destinationAta,
                destination,
                mint,
                TOKEN_2022_PROGRAM_ID
            )
        );
    }

    transaction.add(
        createMintToInstruction(
            mint,
            destinationAta,
            mintAuthority,
            amount * (10 ** decimals),
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    return transaction;
}