import { TokenDetailView } from '@/components/tokens/TokenDetailView';
import { isValidAddress } from '@/lib/utils/format';

interface PageProps {
  params: Promise<{ address: string }> | { address: string };
}

export default async function TokenPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const address = resolved.address;

  if (!isValidAddress(address)) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400 font-mono text-sm space-y-2">
        <div>Invalid Robinhood Chain token address.</div>
        <div className="text-xs text-zinc-600 font-mono">{address}</div>
      </div>
    );
  }

  return <TokenDetailView address={address} />;
}
