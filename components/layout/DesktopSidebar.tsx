'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Wrench,
  Users,
  Car,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth, getRoleLabel } from '@/lib/controllers/auth-context';
import type { UserSession } from '@/lib/models/types';
import type { PermissionArea } from '@/lib/models/constants';
import MMBBrandLogo from '@/components/branding/MMBBrandLogo';

interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  permission: PermissionArea | null;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'หน้าหลัก', icon: Home, path: '/', permission: 'dashboard' },
  { label: 'งานซ่อม', icon: Wrench, path: '/jobs', permission: 'jobs' },
  { label: 'ลูกค้า', icon: Users, path: '/customers', permission: 'customers' },
  { label: 'รถ', icon: Car, path: '/vehicles', permission: 'vehicles' },
  { label: 'อะไหล่', icon: Package, path: '/parts', permission: 'parts' },
  { label: 'การเงิน', icon: DollarSign, path: '#', permission: null, comingSoon: true },
  { label: 'รายงาน', icon: BarChart3, path: '#', permission: null, comingSoon: true },
  { label: 'ตั้งค่า', icon: Settings, path: '/more', permission: null },
];

function isActivePath(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') return pathname === '/';
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasPermission, logout: authLogout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.permission === null) return true;
    return user ? hasPermission(item.permission) : false;
  });

  const handleNavigate = (item: NavItem) => {
    if (item.comingSoon) return;
    router.push(item.path);
  };

  const handleLogout = () => {
    authLogout();
    router.push('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col"
      style={{
        background: 'rgba(3, 7, 12, 0.91)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.10)',
      }}
    >
      <div className="flex items-center px-5 py-5">
        <MMBBrandLogo compact />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {visibleItems.map((item) => {
          const active = !item.comingSoon && isActivePath(pathname, item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item)}
              disabled={item.comingSoon}
              className={`
                group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  active
                    ? 'border-l-2 border-blue-400 bg-blue-500/10 text-blue-400'
                    : item.comingSoon
                      ? 'cursor-default text-zinc-600'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  active
                    ? 'text-blue-400'
                    : item.comingSoon
                      ? 'text-zinc-600'
                      : 'text-zinc-400 group-hover:text-white'
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="truncate">{item.label}</span>

              {item.comingSoon && (
                <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                  เร็วๆ นี้
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {user && (
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.10)' }} className="px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
              {user.nickname?.charAt(0) || user.name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.nickname || user.name}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {getRoleLabel(user.role)}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}
    </aside>
  );
}
