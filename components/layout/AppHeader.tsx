'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCurrentUser } from '@/components/auth-guard';
import { getRoleLabel } from '@/lib/auth';
import MMBBrandLogo from '@/components/branding/MMBBrandLogo';

interface AppHeaderProps {
  showBrand?: boolean;
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
}

export default function AppHeader({
  showBrand = true,
  title,
  right,
  onBack,
}: AppHeaderProps) {
  const user = useCurrentUser();

  const initials = user?.nickname?.charAt(0)?.toUpperCase() || 'U';

  const rightArea = right ?? (
    <div className="flex items-center gap-2 max-w-[45%] justify-end">
      <div className="text-right min-w-0">
        {user && (
          <>
            <p className="text-[11px] text-blue-400 font-medium leading-tight truncate">{user.nickname}</p>
            <p className="text-[10px] text-zinc-500 leading-tight truncate">{getRoleLabel(user.role)}</p>
          </>
        )}
      </div>
      <div
        className="flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold select-none shrink-0"
        style={{ background: '#0A84FF' }}
      >
        {initials}
      </div>
    </div>
  );

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(4, 8, 13, 0.72)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
      }}
    >
      <div className="max-w-2xl mx-auto lg:max-w-none" style={{ padding: '14px 18px' }}>
        {onBack ? (
          <div className="flex items-center gap-3 min-h-[40px]">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-xl active:scale-95 transition-transform"
              style={{
                background: 'rgba(9, 14, 20, 0.88)',
                border: '1px solid rgba(255, 255, 255, 0.11)',
              }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-lg font-bold text-white leading-tight truncate">
                  {title}
                </h1>
              )}
            </div>
            {rightArea}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 min-h-[40px]">
            <div className="max-w-[55%]">
              {showBrand && <MMBBrandLogo compact />}
              {!showBrand && title && (
                <h1 className="text-lg font-bold text-white leading-tight truncate">
                  {title}
                </h1>
              )}
            </div>
            {rightArea}
          </div>
        )}
      </div>
    </header>
  );
}
