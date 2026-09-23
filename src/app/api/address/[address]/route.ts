import { NextRequest, NextResponse } from 'next/server';
import { ROBINHOOD_CHAIN } from '@/config/network';
import { isValidAddress } from '@/lib/utils/format';
import { fetchAddress, fetchAddressTokenBalances } from '@/lib/api/blockscout';
import { publicClient } from '@/lib/web3/client';
import { formatUnits } from 'viem';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> | { address: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const address = params.address;

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
    }

    const [addressData, tokenBalances, ethBalanceBigInt] = await Promise.allSettled([
      fetchAddress(address),
      fetchAddressTokenBalances(address),
      publicClient.getBalance({ address: address as `0x${string}` }),
    ]);

    const addrInfo = addressData.status === 'fulfilled' ? addressData.value : null;
    const rawTokens = tokenBalances.status === 'fulfilled' && tokenBalances.value ? (Array.isArray(tokenBalances.value) ? tokenBalances.value : (tokenBalances.value as any).items || []) : [];

    let ethBalance = '0';
    if (ethBalanceBigInt.status === 'fulfilled') {
      ethBalance = formatUnits(ethBalanceBigInt.value, 18);
    } else if (addrInfo?.coin_balance) {
      try {
        ethBalance = formatUnits(BigInt(addrInfo.coin_balance), 18);
      } catch {
        // Ignore
      }
    }

    const tokens = rawTokens.map((t: any) => {
      const decimals = t.token?.decimals ? parseInt(t.token.decimals, 10) : 18;
      let formattedBalance = '0';
      try {
        if (t.value) {
          formattedBalance = formatUnits(BigInt(t.value), decimals);
        }
      } catch {
        formattedBalance = t.value || '0';
      }

      return {
        address: t.token?.address || t.token?.address_hash || '',
        name: t.token?.name || 'Unknown',
        symbol: t.token?.symbol || '???',
        balance: formattedBalance,
        rawBalance: t.value,
        type: t.token?.type || 'ERC-20',
      };
    });

    return NextResponse.json({
      address,
      ethBalance: parseFloat(ethBalance).toFixed(4),
      rawEthBalance: ethBalance,
      isContract: addrInfo?.is_contract || false,
      isVerified: addrInfo?.is_verified || false,
      contractName: addrInfo?.name || null,
      tokens,
      tokenCount: tokens.length,
      txCount: null,
    });
  } catch (error) {
    console.error('Error fetching address info:', error);
    return NextResponse.json({ error: 'Failed to retrieve address intelligence' }, { status: 500 });
  }
}
