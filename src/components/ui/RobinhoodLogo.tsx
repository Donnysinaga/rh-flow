'use client';

interface RobinhoodLogoProps {
  className?: string;
  size?: number;
}

/**
 * Official Robinhood Brand Feather Logo SVG with signature #00C805 neon green color
 */
export function RobinhoodFeatherLogo({ className = 'w-5 h-5', size = 20 }: RobinhoodLogoProps) {
  return (
    <svg
      className={`inline-block shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 2C13 2 9.5 6 9.5 10.5C9.5 12.8 10.5 14.8 12.1 16.2L8.5 22H11.5L14.6 17C15.5 17.3 16.5 17.5 17.5 17.5C22 17.5 22 13 22 10.5C22 6 18.5 2 17.5 2Z"
        fill="#00C805"
      />
      <path
        d="M6.5 7C5 7 2 9.5 2 13.5C2 17 5 21 8.5 22L12.1 16.2C10.5 14.8 9.5 12.8 9.5 10.5C9.5 8.5 8 7 6.5 7Z"
        fill="#009604"
      />
    </svg>
  );
}

export function RobinhoodWordmark({ className = 'h-5' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-sans font-black ${className}`}>
      <RobinhoodFeatherLogo className="w-5 h-5" size={20} />
      <span className="text-zinc-100 tracking-tight text-base font-bold">
        <span className="text-[#00C805]">RH</span> FLOW
      </span>
    </div>
  );
}
