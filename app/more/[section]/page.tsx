'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Settings } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth-guard';

const SECTION_TITLES: Record<string, string> = {
  'staff': 'ผู้ใช้งาน / Staff',
  'service-advisor': 'Service Advisor',
  'foreman': 'หัวหน้าช่าง',
  'technicians': 'ช่างเทคนิค',
  'workshop-info': 'ข้อมูลอู่',
  'job-numbering': 'เลขที่ JOB',
  'job-statuses': 'สถานะงาน',
  'repair-categories': 'หมวดหมู่งานซ่อม',
  'notifications': 'ตั้งค่าการแจ้งเตือน',
  'doc-intake': 'ใบรับรถ',
  'doc-quotation': 'ใบเสนอราคา',
  'doc-repair-order': 'ใบสั่งซ่อม',
  'doc-qc': 'ใบตรวจ QC',
  'doc-delivery': 'ใบส่งมอบรถ',
  'database': 'Database',
  'synology': 'Synology NAS',
  'backup': 'Backup',
  'activity-log': 'Activity Log',
  'export-data': 'Export Data',
  'about': 'About MMB Workshop',
};

export default function MoreSectionPage() {
  const router = useRouter();
  const params = useParams();
  const section = params.section as string;
  const title = SECTION_TITLES[section] || section;

  return (
    <AuthGuard slug={section}>
    <AppLayout showHeader={false}>
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/more')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">SETTINGS</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        <div className="glass-card metallic-border rounded-2xl p-8 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mx-auto">
            <Settings className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            ฟังก์ชันนี้จะเปิดใช้งานในขั้นตอนถัดไป
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs text-amber-400 font-medium">Coming Soon</span>
          </div>
        </div>
      </main>

    </div>
    </AppLayout>
    </AuthGuard>
  );
}
