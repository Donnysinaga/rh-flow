'use client';

import { OrbitraLogo } from './OrbitraLogo';

interface PonsLogoProps {
  className?: string;
  size?: number;
}

/**
 * Official Orbitra Brand Logo Component ($ORB)
 */
export function PonsLogo({ className = 'w-4 h-4', size = 16 }: PonsLogoProps) {
  return <OrbitraLogo className={className} size={size} />;
}

export { OrbitraLogo as RhFlowLogo, OrbitraLogo };
