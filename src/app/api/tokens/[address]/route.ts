import { NextRequest, NextResponse } from 'next/server';
import { ROBINHOOD_CHAIN } from '@/config/network';
import { isValidAddress } from '@/lib/utils/format';
import { fetchToken } from '@/lib/api/blockscout';
import { getPonsTokenDetails } from '@/lib/rpc/pons';

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

    const [tokenData, ponsDetailsResult, rpcResponse] = await Promise.allSettled([
      fetchToken(address),
      getPonsTokenDetails(address),
      // Query Uniswap v2 factory for DEX pair
      fetch(ROBINHOOD_CHAIN.rpcUrls.fallback, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: ROBINHOOD_CHAIN.contracts.factory,
              data: `0xe6a43905${address.replace('0x', '').padStart(64, '0')}${ROBINHOOD_CHAIN.contracts.weth.replace('0x', '').padStart(64, '0')}`,
            },
            'latest',
          ],
          id: 1,
        }),
        cache: 'no-store',
      }),
    ]);

    let token: any = null;
    if (tokenData.status === 'fulfilled' && tokenData.value) {
      token = tokenData.value;
    }

    const pons = ponsDetailsResult.status === 'fulfilled' ? ponsDetailsResult.value : null;

    let pairAddress: string | null = null;
    if (rpcResponse.status === 'fulfilled' && rpcResponse.value.ok) {
      try {
        const json = await rpcResponse.value.json();
        if (json.result && json.result !== '0x' && json.result.length === 66) {
          const extracted = '0x' + json.result.slice(26);
          if (extracted !== '0x0000000000000000000000000000000000000000') {
            pairAddress = extracted;
          }
        }
      } catch {
        // Ignore
      }
    }

    // If blockscout didn't find the token but Pons v2 on-chain contract has it:
    if (!token && !pons) {
      return NextResponse.json({ error: 'Token not found on Robinhood Chain' }, { status: 404 });
    }

    const name = pons?.name || token?.name || 'Unknown';
    const symbol = pons?.symbol || token?.symbol || 'UNKNOWN';
    const decimals = pons?.decimals || (token?.decimals ? parseInt(token.decimals, 10) : 18);
    const totalSupply = pons?.totalSupply || token?.total_supply || null;
    const iconUrl = pons?.metadata?.tokenLogo || token?.icon_url || null;
    const description = pons?.metadata?.tokenDescription || null;
    const socials = pons?.metadata?.tokenSocials || null;

    // Calculate real price from curve or blockscout
    const price = pons?.curve?.currentPriceEth
      ? pons.curve.currentPriceEth
      : (token?.exchange_rate ? parseFloat(token.exchange_rate) : null);

    return NextResponse.json({
      address: address,
      name,
      symbol,
      decimals,
      totalSupply,
      price,
      marketCap: token?.circulating_market_cap ? parseFloat(token.circulating_market_cap) : null,
      volume24h: token?.volume_24h ? parseFloat(token.volume_24h) : null,
      holderCount: token?.holders_count ? parseInt(token.holders_count, 10) : null,
      iconUrl,
      description,
      socials,
      type: token?.type || 'ERC-20',
      pairAddress,
      // Official Pons v2 Protocol Fields (https://docs.ponsfamily.com/v2)
      isPonsV2: !!pons,
      pons: pons ? {
        curveAddress: pons.curveAddress,
        deployer: pons.deployer,
        creatorFeeRecipient: pons.creatorFeeRecipient,
        pairToken: pons.pairToken,
        graduationThreshold: pons.graduationThreshold,
        poolFee: pons.poolFee,
        tickSpacing: pons.tickSpacing,
        creatorTaxBps: pons.creatorTaxBps,
        buybackEnabled: pons.buybackEnabled,
        phase: pons.phase,
        phaseLabel: pons.phaseLabel,
        sweptQuote: pons.sweptQuote,
        sweptTokens: pons.sweptTokens,
        curve: pons.curve,
      } : null,
      explorerUrl: `${ROBINHOOD_CHAIN.blockExplorers.robinscan}/token/${address}`,
      blockscoutUrl: `${ROBINHOOD_CHAIN.blockExplorers.blockscout}/token/${address}`,
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    return NextResponse.json({ error: 'Failed to retrieve token details' }, { status: 500 });
  }
}

