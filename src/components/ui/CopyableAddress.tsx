'use client';

import { useState } from 'react';
import { formatAddress } from '@/lib/utils/format';

interface CopyableAddressProps {
  address: string;
  full?: boolean;
  className?: string;
}

export function CopyableAddress({ address, full = false, className = '' }: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 750);
    } catch {
      // ignore
    }
  };

  const displayText = full ? address : formatAddress(address);

  return (
    <span
      onClick={handleCopy}
      className={`font-mono cursor-pointer select-all transition-colors duration-150 ${
        copied ? 'text-emerald-400 font-semibold' : 'hover:text-emerald-300'
      } ${className}`}
      title={address}
    >
      {displayText}
    </span>
  );
}
