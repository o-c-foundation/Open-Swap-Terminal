import { PublicKey } from "@solana/web3.js";
import { CoinlistItem } from "@/types/CoinList";

// Solflare Token List API endpoint
const SOLFLARE_API_URL = "https://token-list-api.solana.cloud";

// Interface for Solflare token response
interface SolflareToken {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  verified: boolean;
  decimals: number;
  holders: number;
  logoURI: string;
  tags: string[];
}

interface SolflareResponse {
  content: SolflareToken[];
}

/**
 * Converts a Solflare token to our CoinlistItem format
 */
function convertToTokenListItem(token: SolflareToken): CoinlistItem {
  return {
    mint: new PublicKey(token.address),
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    logo: token.logoURI,
    balance: 0,
    uiAmount: 0
  };
}

/**
 * Fetches tokens using Solflare Token List API
 */
export async function getSolflareTokens(limit = 100): Promise<CoinlistItem[]> {
  console.log(`getSolflareTokens: Fetching tokens from Solflare API (limit: ${limit})...`);
  
  try {
    // Add timeout to the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${SOLFLARE_API_URL}/v1/list?chainId=101`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.error(`getSolflareTokens: API error ${response.status}: ${response.statusText}`);
      throw new Error(`Solflare API returned ${response.status}: ${response.statusText}`);
    }

    const data: SolflareResponse = await response.json();
    console.log(`getSolflareTokens: Received ${data.content.length} tokens from API`);
    
    // Filter to the top tokens based on holder count
    const sortedTokens = data.content
      .sort((a, b) => b.holders - a.holders)
      .slice(0, limit);
    
    // Create the token list
    const tokenList: CoinlistItem[] = sortedTokens.map(convertToTokenListItem);

    console.log(`getSolflareTokens: Successfully created ${tokenList.length} CoinlistItems`);
    return tokenList;
  } catch (error) {
    console.error("Error fetching Solflare tokens:", error);
    // Return a minimal token list with just SOL as a fallback
    console.log("getSolflareTokens: Returning fallback token list with SOL only");
    return [{
      mint: new PublicKey("So11111111111111111111111111111111111111112"),
      name: "Solana",
      symbol: "SOL",
      decimals: 9,
      logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      balance: 0,
      uiAmount: 0
    }];
  }
}

/**
 * Searches tokens using Solflare Token List API
 */
export async function searchSolflareTokens(query: string, limit = 20): Promise<CoinlistItem[]> {
  console.log(`searchSolflareTokens: Searching tokens with query "${query}" (limit: ${limit})...`);
  
  try {
    if (!query || query.trim().length < 2) {
      console.log("searchSolflareTokens: Query too short, fetching popular tokens instead");
      return getSolflareTokens(limit);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${SOLFLARE_API_URL}/v1/search?query=${encodeURIComponent(query)}&start=0&limit=${limit}&chainId=101`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.error(`searchSolflareTokens: API error ${response.status}: ${response.statusText}`);
      throw new Error(`Solflare API returned ${response.status}: ${response.statusText}`);
    }

    const data: SolflareResponse = await response.json();
    console.log(`searchSolflareTokens: Found ${data.content.length} tokens matching "${query}"`);
    
    // Create the token list
    const tokenList: CoinlistItem[] = data.content.map(convertToTokenListItem);

    return tokenList;
  } catch (error) {
    console.error(`Error searching Solflare tokens with query "${query}":`, error);
    return [];
  }
}

/**
 * Fetches tokens by mint addresses using Solflare Token List API
 */
export async function getSolflareTokensByMints(mintAddresses: string[]): Promise<CoinlistItem[]> {
  console.log(`getSolflareTokensByMints: Fetching ${mintAddresses.length} tokens by mint addresses...`);
  
  try {
    if (!mintAddresses.length) {
      return [];
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${SOLFLARE_API_URL}/v1/mints?chainId=101`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses: mintAddresses }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.error(`getSolflareTokensByMints: API error ${response.status}: ${response.statusText}`);
      throw new Error(`Solflare API returned ${response.status}: ${response.statusText}`);
    }

    const data: SolflareResponse = await response.json();
    console.log(`getSolflareTokensByMints: Found ${data.content.length} tokens from ${mintAddresses.length} mint addresses`);
    
    // Create the token list
    const tokenList: CoinlistItem[] = data.content.map(convertToTokenListItem);

    return tokenList;
  } catch (error) {
    console.error("Error fetching Solflare tokens by mint addresses:", error);
    return [];
  }
}

/**
 * Fetches the user's token balances and enriches with Solflare token metadata
 */
export async function getUserTokenBalances(
  walletAddress: string,
  connection: any
): Promise<CoinlistItem[]> {
  console.log(`getUserTokenBalances: Fetching tokens for wallet ${walletAddress}...`);
  
  try {
    // Get token account info from the chain
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    );
    
    if (!tokenAccounts || !tokenAccounts.value || !tokenAccounts.value.length) {
      console.log("getUserTokenBalances: No token accounts found");
      return [];
    }
    
    console.log(`getUserTokenBalances: Found ${tokenAccounts.value.length} token accounts`);
    
    // Extract mint addresses and balances
    const tokensWithBalances: { [mintAddress: string]: { balance: number, decimals: number }} = {};
    
    tokenAccounts.value.forEach(account => {
      const parsedInfo = account.account.data.parsed.info;
      const mintAddress = parsedInfo.mint;
      const decimals = parsedInfo.tokenAmount.decimals;
      const balance = Number(parsedInfo.tokenAmount.amount);
      
      if (balance > 0) {
        tokensWithBalances[mintAddress] = {
          balance,
          decimals
        };
      }
    });
    
    const mintAddresses = Object.keys(tokensWithBalances);
    console.log(`getUserTokenBalances: Fetching metadata for ${mintAddresses.length} tokens with non-zero balance`);
    
    if (mintAddresses.length === 0) {
      return [];
    }
    
    // Get token metadata from Solflare API
    const solflareTokens = await getSolflareTokensByMints(mintAddresses);
    
    // Combine token metadata with balances
    const tokenList: CoinlistItem[] = solflareTokens.map(token => {
      const mintAddress = token.mint.toBase58();
      const tokenWithBalance = tokensWithBalances[mintAddress];
      
      return {
        ...token,
        balance: tokenWithBalance.balance,
        uiAmount: tokenWithBalance.balance / Math.pow(10, tokenWithBalance.decimals)
      };
    });
    
    console.log(`getUserTokenBalances: Successfully created ${tokenList.length} CoinlistItems with balances`);
    return tokenList;
  } catch (error) {
    console.error("Error fetching user token balances:", error);
    return [];
  }
} 