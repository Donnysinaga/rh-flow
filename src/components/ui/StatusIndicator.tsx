interface StatusIndicatorProps {
  status: 'LIVE' | 'SYNCING' | 'DEGRADED' | 'OFFLINE';
  label?: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const config = {
    LIVE: { dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-400' },
    SYNCING: { dot: 'bg-yellow-400', text: 'text-yellow-400' },
    DEGRADED: { dot: 'bg-orange-400', text: 'text-orange-400' },
    OFFLINE: { dot: 'bg-red-400', text: 'text-red-400' },
  };

  const { dot, text } = config[status] || config.OFFLINE;

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className={text}>{label || status}</span>
    </div>
  );
}
