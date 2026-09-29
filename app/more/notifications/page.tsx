'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, Bell, BellOff, Info } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import MobileSaveBar from '@/components/layout/MobileSaveBar';
import { type NotificationConfig } from '@/lib/store';
import { DEFAULT_NOTIFICATIONS } from '@/lib/models/constants';
import { fetchSetting, saveSetting, insertActivityLog } from '@/lib/models/queries';

const NOTIFICATION_ITEMS: { key: keyof NotificationConfig; label: string; desc: string }[] = [
  { key: 'newJob', label: 'แจ้งเตือน JOB ใหม่', desc: 'เมื่อมีการเปิด JOB ใหม่' },
  { key: 'customerApproval', label: 'แจ้งเตือนลูกค้าอนุมัติ', desc: 'เมื่อลูกค้าอนุมัติใบเสนอราคา' },
  { key: 'partsArrived', label: 'แจ้งเตือนอะไหล่มาถึง', desc: 'เมื่ออะไหล่มาถึงแล้ว' },
  { key: 'repairComplete', label: 'แจ้งเตือนงานซ่อมเสร็จ', desc: 'เมื่อช่างแจ้งงานซ่อมเสร็จ' },
  { key: 'waitingQc', label: 'แจ้งเตือนรอ QC', desc: 'เมื่องานเข้าสู่ขั้นตอน QC' },
  { key: 'qcPassed', label: 'แจ้งเตือน QC ผ่าน', desc: 'เมื่อ QC ตรวจผ่านแล้ว' },
  { key: 'readyDelivery', label: 'แจ้งเตือนรถพร้อมส่งมอบ', desc: 'เมื่อรถพร้อมส่งมอบให้ลูกค้า' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSetting<NotificationConfig>('notifications', DEFAULT_NOTIFICATIONS).then(setConfig).catch(() => setConfig(DEFAULT_NOTIFICATIONS)); }, []);

  if (!config) return null;

  const toggle = (key: keyof NotificationConfig) => setConfig(c => c ? { ...c, [key]: !c[key] } : c);

  const handleSave = async () => {
    await saveSetting('notifications', config);
    await insertActivityLog({ userId: 'system', userName: 'System', action: 'แก้ไขการแจ้งเตือน', entityType: 'settings', entityId: 'notifications', description: 'Updated' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout showHeader={false} showBottomNav={false}><div className="min-h-screen lg:min-h-0 pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">ตั้งค่าการแจ้งเตือน</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">NOTIFICATIONS</p>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-all ${saved ? 'bg-green-600' : 'bg-blue-600'}`}>
              {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span className="text-xs text-white font-medium">{saved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80">การแจ้งเตือนผ่านมือถือ/LINE จะเชื่อมต่อในขั้นตอนถัดไป ตอนนี้เป็นการตั้งค่าเตรียมไว้ล่วงหน้า</p>
        </div>

        <div className="glass-card metallic-border rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
          {NOTIFICATION_ITEMS.map(item => (
            <button key={item.key} onClick={() => toggle(item.key)} className="w-full flex items-center gap-3 px-4 py-4 active:bg-zinc-800/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config[item.key] ? 'bg-blue-500/15 border border-blue-500/30' : 'bg-zinc-800/60 border border-zinc-700'}`}>
                {config[item.key] ? <Bell className="w-4 h-4 text-blue-400" /> : <BellOff className="w-4 h-4 text-zinc-600" />}
              </div>
              <div className="flex-1 text-left">
                <span className={`text-sm font-medium ${config[item.key] ? 'text-white' : 'text-zinc-500'}`}>{item.label}</span>
                <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center transition-colors ${config[item.key] ? 'bg-blue-600 justify-end' : 'bg-zinc-700 justify-start'}`}>
                <div className="w-5 h-5 rounded-full bg-white mx-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </main>
      <MobileSaveBar onSave={handleSave} saved={saved} />
    </div></AppLayout>
  );
}
