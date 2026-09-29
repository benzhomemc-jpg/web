'use client';

import { useState } from 'react';

interface MMBBrandLogoProps {
  className?: string;
  compact?: boolean;
}

export default function MMBBrandLogo({
  className = '',
  compact = false,
}: MMBBrandLogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`font-bold text-white tracking-widest uppercase ${compact ? 'text-sm' : 'text-lg'}`}>
          MMB Workshop
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/mmb-logo.webp"
        alt="MMB Workshop"
        className={
          compact
            ? 'h-10 w-auto max-w-[170px] object-contain object-left'
            : 'h-16 w-auto max-w-[260px] object-contain object-left'
        }
        onError={() => setError(true)}
      />
    </div>
  );
}
