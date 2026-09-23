import { NextResponse } from 'next/server';
import { runOnce } from '@/lib/indexer/runner';
import { loadState } from '@/lib/indexer/state';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Run an index cycle to update state against live RPC
    const state = await runOnce();

    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error in /api/indexer/status:', error);
    const fallbackState = loadState();
    return NextResponse.json(fallbackState, { status: 200 });
  }
}
