import { NextRequest, NextResponse } from 'next/server';
import { searchBlockscout } from '@/lib/api/blockscout';

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

    const items = rawItems.map((item: any) => ({
      address: item.address_hash || item.address || '',
      name: item.name || 'Unknown',
      symbol: item.symbol || '',
      type: item.type === 'token' ? 'token' : item.is_smart_contract_address ? 'contract' : 'address',
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in /api/search:', error);
    return NextResponse.json({ items: [] });
  }
}
