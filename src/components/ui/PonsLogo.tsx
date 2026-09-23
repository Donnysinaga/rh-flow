'use client';

interface PonsLogoProps {
  className?: string;
  size?: number;
}

/**
 * RH FLOW brand logo icon - replaces legacy third-party icon with native RH FLOW vector identity
 */
export function PonsLogo({ className = 'w-4 h-4', size = 16 }: PonsLogoProps) {
  return (
    <svg
      className={`inline-block shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rhFlowGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a3e635" />
          <stop offset="0.5" stopColor="#10b981" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="#131417" stroke="#27272a" strokeWidth="1" />
      {/* Dynamic flowing curves representing RH FLOW */}
      <path
        d="M6 8.5C8.5 8.5 9.5 15.5 12 15.5C14.5 15.5 15.5 8.5 18 8.5"
        stroke="url(#rhFlowGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="8.5" r="1.5" fill="#a3e635" />
      <circle cx="18" cy="8.5" r="1.5" fill="#06b6d4" />
    </svg>
  );
}

// Alias export for clarity
export { PonsLogo as RhFlowLogo };

