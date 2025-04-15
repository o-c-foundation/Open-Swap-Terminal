export interface CoinlistItem {
    name: string;
    mint: string,
    logo: string,
    decimals: number
    balance? :number,
    uiAmount: number,
    symbol?: string
}

// We'll use a simplified token list with just a few tokens
export const defaultList: CoinlistItem[] = [
    {
        mint: "So11111111111111111111111111111111111111112",
        symbol: 'SOL',
        name: 'Wrapped SOL',
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        balance: 0,
        uiAmount: 0,
        decimals: 9
    },
    {
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        symbol: 'USDC',
        name: 'USD Coin',
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        balance: 0,
        uiAmount: 0,
        decimals: 6
    },
    {
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        symbol: 'USDT',
        name: 'USDT',
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
        balance: 0,
        uiAmount: 0,
        decimals: 6
    },
    {
        mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        symbol: 'BONK',
        name: 'Bonk',
        logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I?ext=png',
        balance: 0,
        uiAmount: 0,
        decimals: 5
    },
    {
        mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        symbol: 'mSOL',
        name: 'Marinade staked SOL',
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
        balance: 0,
        uiAmount: 0,
        decimals: 9
    },
    {
        mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        symbol: 'JUP',
        name: 'Jupiter',
        logo: 'https://static.jup.ag/jup/icon.png',
        balance: 0,
        uiAmount: 0,
        decimals: 6
    }
];
