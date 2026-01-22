import axios from 'axios';

const SIDESHIFT_API_URL = 'https://sideshift.ai/api/v2';
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET;
const SIDESHIFT_AFFILIATE_ID = process.env.SIDESHIFT_AFFILIATE_ID;

const sideshiftApi = axios.create({
  baseURL: SIDESHIFT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-sideshift-secret': SIDESHIFT_SECRET || '',
  },
});

export interface QuoteRequest {
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAmount?: string;
  settleAmount?: string;
}

export interface QuoteResponse {
  id: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  expiresAt: string;
}

export interface ShiftRequest {
  quoteId?: string;
  settleAddress: string;
  affiliateId: string;
  depositCoin?: string;
  depositNetwork?: string;
  settleCoin?: string;
  settleNetwork?: string;
  refundAddress?: string;
}

export interface ShiftResponse {
  id: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAddress: string;
  depositAmount: string;
  settleAmount: string;
  status: string;
  expiresAt: string;
}

export async function getQuote(request: QuoteRequest, userIp?: string): Promise<QuoteResponse> {
  const headers: Record<string, string> = {};
  if (userIp) {
    headers['x-user-ip'] = userIp;
  }

  const payload = {
    depositCoin: request.depositCoin.toLowerCase(),
    depositNetwork: request.depositNetwork.toLowerCase(),
    settleCoin: request.settleCoin.toLowerCase(),
    settleNetwork: request.settleNetwork.toLowerCase(),
    depositAmount: request.depositAmount || null,
    settleAmount: request.settleAmount || null,
    affiliateId: SIDESHIFT_AFFILIATE_ID,
  };

  console.log('SideShift Quote Request:', JSON.stringify(payload, null, 2));

  const response = await sideshiftApi.post('/quotes', payload, { headers });

  console.log('SideShift Quote Response:', response.data);

  return response.data;
}

export async function createFixedShift(request: ShiftRequest, userIp?: string): Promise<ShiftResponse> {
  const headers: Record<string, string> = {};
  if (userIp) {
    headers['x-user-ip'] = userIp;
  }

  const response = await sideshiftApi.post('/shifts/fixed', {
    ...request,
    affiliateId: SIDESHIFT_AFFILIATE_ID || request.affiliateId,
  }, { headers });

  return response.data;
}

export async function createVariableShift(request: Omit<ShiftRequest, 'quoteId'>, userIp?: string): Promise<ShiftResponse> {
  const headers: Record<string, string> = {};
  if (userIp) {
    headers['x-user-ip'] = userIp;
  }

  const response = await sideshiftApi.post('/shifts/variable', {
    ...request,
    affiliateId: SIDESHIFT_AFFILIATE_ID || request.affiliateId,
  }, { headers });

  return response.data;
}

export async function getShiftStatus(shiftId: string): Promise<ShiftResponse> {
  const response = await sideshiftApi.get(`/shifts/${shiftId}`);
  return response.data;
}

export async function getSupportedCoins(): Promise<Array<{ coin: string; networks: string[] }>> {
  const response = await sideshiftApi.get('/coins');
  return response.data;
}

export async function checkPermissions(userIp: string): Promise<{ allowed: boolean }> {
  const response = await sideshiftApi.get('/permissions', {
    headers: { 'x-user-ip': userIp },
  });
  return response.data;
}

export const SUPPORTED_DEPOSIT_COINS = [
  { coin: 'BTC', network: 'bitcoin', name: 'Bitcoin', icon: '₿' },
  { coin: 'ETH', network: 'ethereum', name: 'Ethereum', icon: 'Ξ' },
  { coin: 'SOL', network: 'solana', name: 'Solana', icon: '◎' },
  { coin: 'USDT', network: 'ethereum', name: 'Tether (ETH)', icon: '₮' },
  { coin: 'USDC', network: 'ethereum', name: 'USD Coin (ETH)', icon: '$' },
  { coin: 'MATIC', network: 'polygon', name: 'Polygon', icon: '⬡' },
  { coin: 'BNB', network: 'bsc', name: 'BNB Chain', icon: '◈' },
  { coin: 'AVAX', network: 'avalanche', name: 'Avalanche', icon: '▲' },
  { coin: 'LTC', network: 'litecoin', name: 'Litecoin', icon: 'Ł' },
  { coin: 'DOGE', network: 'dogecoin', name: 'Dogecoin', icon: 'Ð' },
  { coin: 'XRP', network: 'ripple', name: 'Ripple', icon: '✕' },
  { coin: 'ADA', network: 'cardano', name: 'Cardano', icon: '₳' },
  { coin: 'DOT', network: 'polkadot', name: 'Polkadot', icon: '●' },
  { coin: 'TRX', network: 'tron', name: 'Tron', icon: '⧫' },
  { coin: 'LINK', network: 'ethereum', name: 'Chainlink (ETH)', icon: '⬡' },
  { coin: 'UNI', network: 'ethereum', name: 'Uniswap (ETH)', icon: '🦄' },
];