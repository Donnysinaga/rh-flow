import { formatUnits } from 'viem';

export const formatAddress = (address: string): string => {
  if (!address || !isValidAddress(address)) return address || '—';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  if (num === 0) return '$0.00';
  if (num < 0.01) return `<$0.01`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatTokenAmount = (value: string | bigint, decimals: number): string => {
  if (!value) return '0';
  try {
    const formatted = formatUnits(BigInt(value), decimals);
    const num = parseFloat(formatted);
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 4,
    }).format(num);
  } catch {
    return '0';
  }
};

export const formatTimeAgo = (timestamp: string | number | Date): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch {
    return '—';
  }
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const formatMarketCap = (value: number | string): string => {
  return formatCurrency(value);
};

export const formatEthValue = (wei: string | bigint): string => {
  try {
    const formatted = formatUnits(BigInt(wei), 18);
    const num = parseFloat(formatted);
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 4,
    }).format(num) + ' ETH';
  } catch {
    return '0 ETH';
  }
};
