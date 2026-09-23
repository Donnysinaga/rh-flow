'use client';

import { useState } from 'react';

interface PonsLogoProps {
  className?: string;
  size?: number;
}

export function PonsLogo({ className = 'w-4 h-4', size = 16 }: PonsLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Official Pons geometric "P" icon fallback
    return (
      <svg
        className={`inline-block ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="11" fill="#0d1117" stroke="#10b981" strokeWidth="1.5" />
        <path
          d="M8 6h5a4 4 0 014 4c0 2.2-1.8 4-4 4H8V6zm3 6h2a2 2 0 100-4h-2v4zM8 14v4"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <img
      src="https://docs.ponsfamily.com/pons.png"
      alt="Pons"
      width={size}
      height={size}
      className={`inline-block object-contain rounded-full ${className}`}
      onError={() => setImageError(true)}
    />
  );
}
