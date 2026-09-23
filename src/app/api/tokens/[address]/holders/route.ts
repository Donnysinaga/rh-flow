import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@/lib/utils/format';
import { fetchTokenHolders } from '@/lib/api/blockscout';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> | { address: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const address = params.address;

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address format', items: [] }, { status: 400 });
    }

    const data = await fetchTokenHolders(address);
    const rawItems = data?.items || [];

    const items = rawItems.map((h: any) => ({
      address: h.address?.hash || h.address_hash?.hash || h.address_hash || '',
      balance: h.value || '0',
      isContract: h.address?.is_contract || false,
      name: h.address?.name || null,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in /api/tokens/[address]/holders:', error);
    return NextResponse.json({ items: [] });
  }
}
