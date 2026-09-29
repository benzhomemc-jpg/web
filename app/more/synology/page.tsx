'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, HardDrive, Wifi, WifiOff, FolderTree, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const FOLDER_STRUCTURE = [
  'MMB-WORKSHOP',
  '  └ Jobs',
  '     └ YYYY',
  '        └ MM',
  '           └ JOB-NUMBER',
  '              ├ 01-Receive',
  '              ├ 02-Inspection',
  '              ├ 03-Diagnostic',
  '              ├ 04-Parts',
  '              ├ 05-Repair',
  '              ├ 06-QC',
  '              ├ 07-Delivery',
  '              └ Documents',
];

export default function SynologyPage() {
  const router = useRouter();

  return (
    <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div><h1 className="text-lg font-bold text-white">Synology NAS</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">FILE STORAGE</p></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center"><WifiOff className="w-5 h-5 text-red-400" /></div>
          <div>
            <p className="text-sm font-medium text-white">ยังไม่ได้เชื่อมต่อ</p>
            <p className="text-xs text-zinc-500">Synology NAS Status</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/10 border border-red-500/30 text-red-400">Disconnected</span>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">การตั้งค่า NAS</h3>
          {[
            { label: 'สถานะ', value: 'ยังไม่ได้เชื่อมต่อ' },
            { label: 'Server Name', value: '-' },
            { label: 'Host / IP', value: '-' },
            { label: 'Port', value: '5001' },
            { label: 'Shared Folder', value: 'MMB-WORKSHOP' },
            { label: 'Username', value: '-' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
              <span className="text-xs text-zinc-400">{item.label}</span>
              <span className="text-xs text-zinc-500">{item.value}</span>
            </div>
          ))}
          <p className="text-[10px] text-zinc-600 italic">Password จะไม่เก็บใน localStorage เพื่อความปลอดภัย</p>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">โครงสร้างไฟล์ที่วางแผนไว้</h3>
          </div>
          <div className="bg-zinc-900 rounded-xl p-3">
            {FOLDER_STRUCTURE.map((line, i) => (
              <pre key={i} className="text-[10px] text-cyan-400/70 font-mono leading-relaxed">{line}</pre>
            ))}
          </div>
        </div>

        <button onClick={() => alert('ยังไม่ได้ติดตั้ง NAS Backend Connector')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 active:scale-95 transition-transform">
          <Wifi className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-300 font-medium">ทดสอบการเชื่อมต่อ</span>
        </button>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80">การเชื่อมต่อ NAS จะต้องทำผ่าน Backend Server เพื่อความปลอดภัย จะไม่ทำการเชื่อมต่อโดยตรงจาก Browser</p>
        </div>
      </main>
    </div></AppLayout>
  );
}
