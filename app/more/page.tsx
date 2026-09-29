'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCog,
  ClipboardCheck,
  Wrench as WrenchIcon,
  Building2,
  Hash,
  ListChecks,
  Tags,
  Bell,
  FileText,
  Receipt,
  ClipboardList,
  ShieldCheck,
  Truck,
  Database,
  HardDrive,
  ArchiveRestore,
  Activity,
  Download,
  Info,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard, { useCurrentUser } from '@/components/auth-guard';
import { getVisibleMoreSlugs, getRoleLabel, logout } from '@/lib/auth';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  slug: string;
  iconColor: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    title: 'บุคลากร',
    items: [
      { icon: Users, label: 'ผู้ใช้งาน / Staff', slug: 'staff', iconColor: 'text-blue-400' },
      { icon: UserCog, label: 'Service Advisor', slug: 'service-advisor', iconColor: 'text-cyan-400' },
      { icon: ClipboardCheck, label: 'หัวหน้าช่าง', slug: 'foreman', iconColor: 'text-green-400' },
      { icon: WrenchIcon, label: 'ช่างเทคนิค', slug: 'technicians', iconColor: 'text-amber-400' },
    ],
  },
  {
    title: 'ตั้งค่าระบบ',
    items: [
      { icon: Building2, label: 'ข้อมูลอู่', slug: 'workshop-info', iconColor: 'text-blue-400' },
      { icon: Hash, label: 'เลขที่ JOB', slug: 'job-numbering', iconColor: 'text-cyan-400' },
      { icon: ListChecks, label: 'สถานะงาน', slug: 'job-statuses', iconColor: 'text-green-400' },
      { icon: Tags, label: 'หมวดหมู่งานซ่อม', slug: 'repair-categories', iconColor: 'text-amber-400' },
      { icon: Bell, label: 'ตั้งค่าการแจ้งเตือน', slug: 'notifications', iconColor: 'text-red-400' },
    ],
  },
  {
    title: 'เอกสาร',
    items: [
      { icon: FileText, label: 'ใบรับรถ', slug: 'doc-intake', iconColor: 'text-blue-400' },
      { icon: Receipt, label: 'ใบเสนอราคา', slug: 'doc-quotation', iconColor: 'text-cyan-400' },
      { icon: ClipboardList, label: 'ใบสั่งซ่อม', slug: 'doc-repair-order', iconColor: 'text-green-400' },
      { icon: ShieldCheck, label: 'ใบตรวจ QC', slug: 'doc-qc', iconColor: 'text-amber-400' },
      { icon: Truck, label: 'ใบส่งมอบรถ', slug: 'doc-delivery', iconColor: 'text-emerald-400' },
    ],
  },
  {
    title: 'ระบบจัดเก็บข้อมูล',
    items: [
      { icon: Database, label: 'Database', slug: 'database', iconColor: 'text-blue-400' },
      { icon: HardDrive, label: 'Synology NAS', slug: 'synology', iconColor: 'text-cyan-400' },
      { icon: ArchiveRestore, label: 'Backup', slug: 'backup', iconColor: 'text-green-400' },
    ],
  },
  {
    title: 'ระบบ',
    items: [
      { icon: Activity, label: 'Activity Log', slug: 'activity-log', iconColor: 'text-blue-400' },
      { icon: Download, label: 'Export Data', slug: 'export-data', iconColor: 'text-cyan-400' },
      { icon: Info, label: 'About MMB Workshop', slug: 'about', iconColor: 'text-zinc-400' },
    ],
  },
];

export default function MorePage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const visibleSlugs = useMemo(() => {
    if (!user) return new Set<string>();
    return getVisibleMoreSlugs(user.role);
  }, [user]);

  const filteredGroups = useMemo(() => {
    return MENU_GROUPS
      .map(g => ({
        ...g,
        items: g.items.filter(item => visibleSlugs.has(item.slug)),
      }))
      .filter(g => g.items.length > 0);
  }, [visibleSlugs]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <AuthGuard>
    <AppLayout showHeader={false}>
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <h1 className="text-lg font-bold text-white leading-tight">เพิ่มเติม</h1>
          <p className="text-[10px] text-blue-400 font-medium tracking-widest">MORE</p>
        </div>
      </header>

      <main className="max-w-2xl lg:max-w-4xl mx-auto px-4 pt-4 space-y-6 pb-24 lg:pb-0">
        {user && (
          <div className="glass-card metallic-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-blue-400">{getRoleLabel(user.role)}</p>
            </div>
          </div>
        )}

        {filteredGroups.map((group) => (
          <section key={group.title}>
            <h2 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2 px-1">
              {group.title}
            </h2>
            <div className="glass-card metallic-border rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
              {group.items.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => router.push(`/more/${item.slug}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700 shrink-0">
                    <item.icon className={`w-4.5 h-4.5 ${item.iconColor}`} />
                  </div>
                  <span className="text-sm text-white font-medium flex-1 text-left">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <section>
          <div className="glass-card metallic-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 shrink-0">
                <LogOut className="w-4.5 h-4.5 text-red-400" />
              </div>
              <span className="text-sm text-red-400 font-medium flex-1 text-left">ออกจากระบบ</span>
            </button>
          </div>
        </section>
      </main>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 bg-black/60">
          <div className="glass-card metallic-border rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-white font-semibold text-center">ออกจากระบบ</h3>
            <p className="text-sm text-zinc-400 text-center">ต้องการออกจากระบบหรือไม่?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 active:scale-95 transition-transform">ยกเลิก</button>
              <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-red-600 text-sm text-white font-medium active:scale-95 transition-transform">ออกจากระบบ</button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
    </AuthGuard>
  );
}
