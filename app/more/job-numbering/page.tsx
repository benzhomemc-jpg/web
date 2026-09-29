'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import MobileSaveBar from '@/components/layout/MobileSaveBar';
import { type JobNumberConfig } from '@/lib/store';
import { DEFAULT_JOB_NUMBER_CONFIG } from '@/lib/models/constants';
import { fetchSetting, saveSetting, insertActivityLog } from '@/lib/models/queries';

export default function JobNumberingPage() {
  const router = useRouter();
  const [config, setConfig] = useState<JobNumberConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSetting<JobNumberConfig>('jobNumberConfig', DEFAULT_JOB_NUMBER_CONFIG).then(setConfig).catch(() => setConfig(DEFAULT_JOB_NUMBER_CONFIG)); }, []);

  if (!config) return null;

  const handleSave = async () => {
    await saveSetting('jobNumberConfig', config);
    await insertActivityLog({ userId: 'system', userName: 'System', action: 'แก้ไขเลขที่ JOB', entityType: 'settings', entityId: 'job-numbering', description: `Prefix: ${config.prefix}` });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const preview = () => {
    const now = new Date();
    const yy = String(now.getFullYear() + 543 - 2500).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const parts = [config.prefix, '-'];
    if (config.includeYY) parts.push(yy);
    if (config.includeMM) parts.push(mm);
    parts.push(String(1).padStart(config.runningDigits, '0'));
    return parts.join('');
  };

  return (
    <AppLayout showHeader={false} showBottomNav={false}><div className="min-h-screen lg:min-h-0 pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">ตั้งค่าเลขที่ JOB</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">JOB NUMBERING</p>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-all ${saved ? 'bg-green-600' : 'bg-blue-600'}`}>
              {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span className="text-xs text-white font-medium">{saved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-5 text-center">
          <p className="text-xs text-zinc-500 mb-2">ตัวอย่างเลข JOB</p>
          <p className="text-2xl font-bold text-blue-400 font-mono tracking-wider">{preview()}</p>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-4">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">รูปแบบ</h3>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Prefix</label>
            <input className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono" value={config.prefix} onChange={e => setConfig(c => c ? { ...c, prefix: e.target.value.toUpperCase() } : c)} />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 block">ส่วนประกอบ</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.includeYY} onChange={e => setConfig(c => c ? { ...c, includeYY: e.target.checked } : c)} className="rounded border-zinc-600 bg-zinc-800 text-blue-500" />
                <span className="text-sm text-zinc-300">YY (ปี)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.includeMM} onChange={e => setConfig(c => c ? { ...c, includeMM: e.target.checked } : c)} className="rounded border-zinc-600 bg-zinc-800 text-blue-500" />
                <span className="text-sm text-zinc-300">MM (เดือน)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">จำนวนหลัก Running Number</label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setConfig(c => c ? { ...c, runningDigits: n } : c)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${config.runningDigits === n ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                  {n} หลัก
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Reset Running Number</label>
            <div className="space-y-2">
              {([['none', 'ไม่ Reset'], ['monthly', 'ทุกเดือน'], ['yearly', 'ทุกปี']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setConfig(c => c ? { ...c, resetRule: val } : c)} className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-colors ${config.resetRule === val ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4">
          <p className="text-xs text-zinc-500">JOB ที่เปิดแล้วจะไม่ถูกเปลี่ยนเลข การตั้งค่านี้มีผลกับ JOB ใหม่เท่านั้น</p>
        </div>
      </main>
      <MobileSaveBar onSave={handleSave} saved={saved} />
    </div></AppLayout>
  );
}
