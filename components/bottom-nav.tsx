'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Wrench, Users, Car, MoreHorizontal } from 'lucide-react';
import { getCurrentUser, getVisibleNavTabs } from '@/lib/auth';

const ALL_NAV_ITEMS = [
  { id: 'home', path: '/', label: 'หน้าหลัก', icon: Home },
  { id: 'jobs', path: '/jobs', label: 'งานซ่อม', icon: Wrench },
  { id: 'customers', path: '/customers', label: 'ลูกค้า', icon: Users },
  { id: 'cars', path: '/vehicles', label: 'รถ', icon: Car },
  { id: 'more', path: '/more', label: 'เพิ่มเติม', icon: MoreHorizontal },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [visibleIds, setVisibleIds] = useState<string[]>(['home', 'jobs', 'customers', 'cars', 'more']);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setVisibleIds(getVisibleNavTabs(user.role));
    }
  }, []);

  const items = ALL_NAV_ITEMS.filter(item => visibleIds.includes(item.id));

  const activeId = (() => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/jobs') || pathname.startsWith('/new-job') || pathname.startsWith('/job/')) return 'jobs';
    if (pathname.startsWith('/customers')) return 'customers';
    if (pathname.startsWith('/vehicles')) return 'cars';
    if (pathname.startsWith('/more')) return 'more';
    return 'home';
  })();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(4, 7, 11, 0.94)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.10)',
      }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]"
            >
              <item.icon
                className="w-6 h-6 transition-colors"
                style={{ color: isActive ? '#0A84FF' : '#9CA7B2' }}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? '#0A84FF' : '#9CA7B2' }}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0 w-8 h-0.5 rounded-full" style={{ background: '#0A84FF' }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
