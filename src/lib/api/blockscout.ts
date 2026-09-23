export interface Token {
  address_hash: string;
  circulating_market_cap: string;
  decimals: string;
  exchange_rate: string;
  holders_count: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: string;
  volume_24h: string;
}

export interface TokenHolder {
  address: {
    hash: string;
    is_contract: boolean;
    name: string | null;
  };
  value: string;
}

export interface AddressInfo {
  hash: string;
  coin_balance: string;
  is_contract: boolean;
  is_verified: boolean;
  name: string | null;
  exchange_rate: string | null;
  has_token_transfers: boolean;
  creation_transaction_hash: string | null;
}

export interface Transaction {
  hash: string;
  from: { hash: string };
  to: { hash: string };
  value: string;
  timestamp: string;
  block_number: number;
  method: string | null;
  status: string;
  gas_used: string;
  gas_price: string;
  fee: string;
  transaction_types: string[];
  exchange_rate: string | null;
}

export interface SearchItem {
  address_hash: string;
  name: string | null;
  symbol: string | null;
  type: 'token' | 'contract' | 'address';
}

export interface TokenTransfer {
  from: { hash: string };
  to: { hash: string };
  token: { name: string; symbol: string };
  total: { value: string; decimals: string };
  timestamp: string;
  transaction_hash: string;
}

export interface TokenBalance {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    type: string;
  };
  value: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  next_page_params: any | null;
}

const BASE_URL = 'https://robinhoodchain.blockscout.com/api/v2';
const TIMEOUT_MS = 10000;

export const BLOCKSCOUT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://robinhoodchain.blockscout.com/',
};

export async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...BLOCKSCOUT_HEADERS,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchTokens(type?: string): Promise<PaginatedResponse<Token> | null> {
  const url = type ? `${BASE_URL}/tokens?type=${encodeURIComponent(type)}` : `${BASE_URL}/tokens`;
  return fetchWithTimeout(url);
}

export async function fetchToken(address: string): Promise<Token | null> {
  return fetchWithTimeout(`${BASE_URL}/tokens/${address}`);
}

export async function fetchTokenHolders(address: string): Promise<PaginatedResponse<TokenHolder> | null> {
  return fetchWithTimeout(`${BASE_URL}/tokens/${address}/holders`);
}

export async function fetchTokenTransfers(address: string): Promise<PaginatedResponse<TokenTransfer> | null> {
  return fetchWithTimeout(`${BASE_URL}/tokens/${address}/transfers`);
}

export async function fetchAddress(address: string): Promise<AddressInfo | null> {
  return fetchWithTimeout(`${BASE_URL}/addresses/${address}`);
}

export async function fetchAddressTransactions(address: string): Promise<PaginatedResponse<Transaction> | null> {
  return fetchWithTimeout(`${BASE_URL}/addresses/${address}/transactions`);
}

export async function fetchAddressTokenBalances(address: string): Promise<TokenBalance[] | null> {
  return fetchWithTimeout(`${BASE_URL}/addresses/${address}/token-balances`);
}

export async function fetchRecentTransactions(): Promise<any[] | null> {
  return fetchWithTimeout(`${BASE_URL}/main-page/transactions`);
}

export async function searchBlockscout(query: string): Promise<PaginatedResponse<SearchItem> | null> {
  if (!query) return null;
  return fetchWithTimeout(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
}
