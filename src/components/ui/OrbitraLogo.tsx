import React from 'react';

interface OrbitraLogoProps {
  className?: string;
  size?: number;
}

export function OrbitraLogo({ className = "w-7 h-7", size = 28 }: OrbitraLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Orbitra Logo"
      width={size}
      height={size}
      className={`${className} object-contain rounded-full`}
    />
  );
}
