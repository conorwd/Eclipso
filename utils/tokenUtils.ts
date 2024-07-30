// utils/tokenUtils.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, MintLayout } from '@solana/spl-token';

export interface TokenInfo {
  mint: string;
  symbol: string;
  balance: string;
  uiBalance: number;
  decimals: number;
  programId: string;
}

// Token info cache
const tokenInfoCache: { [mint: string]: TokenInfo } = {};

export async function getTokenInfo(connection: Connection, mint: string, programId: PublicKey): Promise<TokenInfo> {
  if (tokenInfoCache[mint]) {
    return tokenInfoCache[mint];
  }

  try {
    const mintPublicKey = new PublicKey(mint);
    const mintInfo = await connection.getAccountInfo(mintPublicKey);

    if (!mintInfo) {
      throw new Error('Failed to fetch mint info');
    }

    const { decimals } = MintLayout.decode(mintInfo.data);
    const symbol = await getTokenSymbol(connection, mint);

    const tokenInfo: TokenInfo = {
      mint,
      symbol,
      decimals,
      balance: '0',
      uiBalance: 0,
      programId: programId.toString(),
    };

    tokenInfoCache[mint] = tokenInfo;
    return tokenInfo;
  } catch (error) {
    console.error('Error fetching token info:', error);
    return {
      mint,
      symbol: formatMint(mint),
      decimals: 0,
      balance: '0',
      uiBalance: 0,
      programId: programId.toString(),
    };
  }
}

export async function getTokensInWallet(connection: Connection, walletAddress: PublicKey): Promise<TokenInfo[]> {
  const tokenPrograms = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID];
  let allTokens: TokenInfo[] = [];

  for (const programId of tokenPrograms) {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId,
    });

    const tokens = await Promise.all(tokenAccounts.value.map(async (accountInfo) => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      const tokenInfo = await getTokenInfo(connection, parsedInfo.mint, programId);
      return {
        ...tokenInfo,
        balance: parsedInfo.tokenAmount.amount,
        uiBalance: parsedInfo.tokenAmount.uiAmount,
      };
    }));

    allTokens = allTokens.concat(tokens);
  }

  return allTokens.sort((a, b) => Number(b.balance) - Number(a.balance));
}

export async function getTokenSymbol(connection: Connection, mint: string): Promise<string> {
  try {
    const token = new PublicKey(mint);
    const tokenInfo = await connection.getParsedAccountInfo(token);

    if (tokenInfo.value) {
      const parsedData = tokenInfo.value.data as any;
      if (parsedData && parsedData.parsed && parsedData.parsed.info) {
        const symbol = parsedData.parsed.info.symbol;
        return symbol || formatMint(mint);
      }
    }
  } catch (error) {
    console.error('Error fetching token symbol:', error);
  }

  return formatMint(mint);
}

export function formatMint(mint: string): string {
  return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
}

export function formatTokenAmount(amount: string, decimals: number): string {
  const amountBigInt = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;

  let formattedAmount = integerPart.toString();
  if (fractionalPart > 0) {
    const fractionalString = fractionalPart.toString().padStart(decimals, '0');
    formattedAmount += '.' + fractionalString.replace(/0+$/, '');
  }

  return formattedAmount;
}