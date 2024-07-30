// utils/metadataUtils.ts

import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string; // URL to the token's logo
}

export async function uploadMetadata(metadata: TokenMetadata): Promise<string> {
  // In a real implementation, this function would upload the metadata to Arweave or IPFS
  // and return the URL of the uploaded metadata.
  // For this example, we'll just return a mock URL.
  console.log('Uploading metadata:', metadata);
  return `https://arweave.net/${Math.random().toString(36).substring(2, 15)}`;
}

export function createMetadataInstruction(
  mint: PublicKey,
  metadataUrl: string,
  updateAuthority: PublicKey
): TransactionInstruction {
  // This function would create the instruction to create metadata for the token
  // using the Token Metadata program.
  // For simplicity, we're not implementing this fully, but in a real scenario,
  // you would use the Metaplex SDK to create this instruction.
  console.log('Creating metadata instruction for mint:', mint.toBase58());
  console.log('Metadata URL:', metadataUrl);
  console.log('Update authority:', updateAuthority.toBase58());
  
  // Return a mock instruction
  return {
    programId: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
    keys: [],
    data: Buffer.alloc(0)
  };
}