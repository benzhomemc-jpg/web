'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Wrench, Database, HardDrive, Monitor, Package } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const MODULES = [
  'Customer Management',
  'Vehicle Management',
  'Job Management',
  'Inspection',
  'Quotation',
  'Repair',
  'Parts',
  'QC',
  'Delivery',
  'Media Management',
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <AppLayout showHeader={false}>
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div><h1 className="text-lg font-bold text-white">About</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">ABOUT</p></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white">MMB WORKSHOP</h1>
          <p className="text-sm text-zinc-400">SERVICE MANAGEMENT</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
            <span className="text-xs text-zinc-400">Version:</span>
            <span className="text-xs text-blue-400 font-medium">Prototype 1.0</span>
          </div>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">ระบบ</h3>
          <p className="text-xs text-zinc-400">Workshop Service Management System</p>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Modules</h3>
          <div className="grid grid-cols-2 gap-2">
            {MODULES.map(m => (
              <div key={m} className="flex items-center gap-2 py-1.5">
                <Package className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="text-xs text-zinc-300">{m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-2">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">สถานะระบบ</h3>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
            <div className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400">Storage Mode</span></div>
            <span className="text-xs text-amber-400">Local Prototype</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
            <div className="flex items-center gap-2"><HardDrive className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400">NAS</span></div>
            <span className="text-xs text-red-400">Not Connected</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400">Database</span></div>
            <span className="text-xs text-zinc-400">LocalStorage</span>
          </div>
        </div>
      </main>
    </div>
    </AppLayout>
  );
}
