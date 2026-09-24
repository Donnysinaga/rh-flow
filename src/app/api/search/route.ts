import { NextRequest, NextResponse } from 'next/server';
import { searchBlockscout } from '@/lib/api/blockscout';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ items: [] });
    }

    const data = await searchBlockscout(q);
    const rawItems = data?.items || [];

    let items = rawItems.map((item: any) => ({
      address: item.address_hash || item.address || '',
      name: item.name || 'Unknown',
      symbol: item.symbol || '',
      type: item.type === 'token' ? 'token' : item.is_smart_contract_address ? 'contract' : 'address',
    }));

    const lowerQ = q.toLowerCase();
    if (
      siteConfig.CONTRACT_ADDRESS &&
      (lowerQ === 'orb' ||
        lowerQ === 'orbitra' ||
        lowerQ === siteConfig.CONTRACT_ADDRESS.toLowerCase() ||
        siteConfig.CONTRACT_ADDRESS.toLowerCase().startsWith(lowerQ))
    ) {
      // Ensure Orbitra is first without duplicate
      items = items.filter((it: any) => it.address.toLowerCase() !== siteConfig.CONTRACT_ADDRESS.toLowerCase());
      items.unshift({
        address: siteConfig.CONTRACT_ADDRESS,
        name: 'Orbitra',
        symbol: 'ORB',
        type: 'token',
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in /api/search:', error);
    return NextResponse.json({ items: [] });
  }
}
