import { createPublicClient, http, fallback } from 'viem';
import { robinhoodChain } from './chains';
import { ROBINHOOD_CHAIN } from '../../config/network';

export const publicClient = createPublicClient({
  chain: robinhoodChain,
  transport: fallback([
    http(ROBINHOOD_CHAIN.rpcUrls.primary, {
      batch: true,
      timeout: 15000,
      retryCount: 3,
    }),
    http(ROBINHOOD_CHAIN.rpcUrls.fallback, {
      batch: true,
      timeout: 15000,
      retryCount: 3,
    }),
  ]),
});

export function getPublicClient() {
  return publicClient;
}
