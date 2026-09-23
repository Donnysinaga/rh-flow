'use client';

import { RobinhoodFeatherLogo } from './RobinhoodLogo';

interface PonsLogoProps {
  className?: string;
  size?: number;
}

/**
 * Official Robinhood Brand Logo Component
 */
export function PonsLogo({ className = 'w-4 h-4', size = 16 }: PonsLogoProps) {
  return <RobinhoodFeatherLogo className={className} size={size} />;
}

export { PonsLogo as RhFlowLogo };


