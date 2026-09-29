'use client';

import { type ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from '@/components/bottom-nav';
import AppHeader from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBrand?: boolean;
  headerTitle?: string;
  headerRight?: ReactNode;
  showBottomNav?: boolean;
}

const BG_STYLE: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(
      rgba(3, 7, 12, 0.90),
      rgba(3, 7, 12, 0.94)
    ),
    url('/branding/mmb-background.webp')
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#05080C',
};

export default function AppLayout({
  children,
  showHeader = true,
  showBrand = true,
  headerTitle,
  headerRight,
  showBottomNav = true,
}: AppLayoutProps) {
  return (
    <>
      {/* Desktop: sidebar + content */}
      <div className="hidden lg:flex min-h-[100dvh]" style={{ ...BG_STYLE, backgroundAttachment: 'fixed' }}>
        <DesktopSidebar />
        <main className="min-h-[100dvh] flex-1 pl-64">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>

      {/* Mobile: header + content + bottom nav */}
      <div className="lg:hidden min-h-[100dvh]" style={{ ...BG_STYLE, backgroundAttachment: 'scroll' }}>
        {showHeader && (
          <AppHeader
            showBrand={showBrand}
            title={headerTitle}
            right={headerRight}
          />
        )}
        <main className={showBottomNav ? 'pb-24' : 'pb-0'}>
          {children}
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </>
  );
}
