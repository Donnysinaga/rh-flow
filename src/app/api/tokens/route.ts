import { NextRequest, NextResponse } from 'next/server';
import { fetchTokens } from '@/lib/api/blockscout';
import { getRecentPonsLaunches, getPonsTokenDetails, formatIpfsUrl } from '@/lib/rpc/pons';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || '';
    const q = searchParams.get('q') || '';

    const data = await fetchTokens(type && type !== 'All' && type !== 'pons' ? type : undefined);
    let items = data?.items || [];

    if (q) {
      const lower = q.toLowerCase();
      items = items.filter((t: any) =>
        t.name?.toLowerCase().includes(lower) ||
        t.symbol?.toLowerCase().includes(lower) ||
        t.address_hash?.toLowerCase() === lower
      );
    }

    const formatted = items.map((t: any) => ({
      address: t.address_hash,
      name: t.name,
      symbol: t.symbol,
      icon_url: formatIpfsUrl(t.icon_url) || null,
      price: t.exchange_rate ? parseFloat(t.exchange_rate) : null,
      market_cap: t.circulating_market_cap ? parseFloat(t.circulating_market_cap) : null,
      volume_24h: t.volume_24h ? parseFloat(t.volume_24h) : null,
      holders: t.holders_count ? parseInt(t.holders_count, 10) : null,
      type: t.type,
      decimals: t.decimals ? parseInt(t.decimals, 10) : 18,
      total_supply: t.total_supply,
    }));

    // If type is 'pons', ensure recent Pons v2 launches are highlighted
    if (type === 'pons' && formatted.length === 0) {
      const recentLaunches = await getRecentPonsLaunches(BigInt(20000));
      const ponsTokens = await Promise.all(
        recentLaunches.slice(0, 10).map(async (l) => {
          const details = await getPonsTokenDetails(l.tokenAddress);
          if (!details) return null;
          return {
            address: details.tokenAddress,
            name: details.name,
            symbol: details.symbol,
            icon_url: details.metadata?.tokenLogo || null,
            price: details.curve?.currentPriceEth || null,
            market_cap: null,
            volume_24h: null,
            holders: null,
            type: 'Pons v2',
            decimals: details.decimals,
            total_supply: details.totalSupply,
            progress: details.curve?.progressPercent || 0,
            curveAddress: details.curveAddress,
            phaseLabel: details.phaseLabel,
          };
        })
      );

      const validPons = ponsTokens.filter(Boolean);
      return NextResponse.json({
        items: validPons,
        next_page_params: null,
      });
    }

    return NextResponse.json({
      items: formatted,
      next_page_params: data?.next_page_params || null,
    });
  } catch (error) {
    console.error('Error in /api/tokens:', error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

