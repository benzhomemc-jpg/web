'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Filter } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useActivityLogs } from '@/lib/controllers/use-activity-logs';

const TIME_FILTERS = [
  { key: 'today', label: 'วันนี้' },
  { key: '7d', label: '7 วัน' },
  { key: '30d', label: '30 วัน' },
  { key: 'all', label: 'ทั้งหมด' },
];

const TYPE_FILTERS = [
  { key: '', label: 'ทั้งหมด' },
  { key: 'job', label: 'JOB' },
  { key: 'customer', label: 'ลูกค้า' },
  { key: 'vehicle', label: 'รถ' },
  { key: 'staff', label: 'พนักงาน' },
  { key: 'settings', label: 'ตั้งค่า' },
];

export default function ActivityLogPage() {
  const router = useRouter();
  const { logs, loading, error } = useActivityLogs(500);
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');


  const filtered = logs.filter(log => {
    if (typeFilter && log.entityType !== typeFilter) return false;
    if (timeFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
      if (timeFilter === 'today' && diffDays > 1) return false;
      if (timeFilter === '7d' && diffDays > 7) return false;
      if (timeFilter === '30d' && diffDays > 30) return false;
    }
    return true;
  });

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return ts; }
  };

  return (
    <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div><h1 className="text-lg font-bold text-white">Activity Log</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">ACTIVITY LOG</p></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {loading && <p className="text-xs text-zinc-500">กำลังโหลด Activity Log...</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TIME_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTimeFilter(f.key)} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${timeFilter === f.key ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>{f.label}</button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${typeFilter === f.key ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card metallic-border rounded-2xl p-8 text-center">
            <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">ยังไม่มีบันทึกกิจกรรม</p>
            <p className="text-zinc-600 text-xs mt-1">กิจกรรมจะถูกบันทึกเมื่อมีการเปลี่ยนแปลงข้อมูล</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(log => (
              <div key={log.id} className="glass-card metallic-border rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{log.action}</span>
                      <span className="text-[10px] text-zinc-600">{log.entityType}</span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{log.description}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{formatTime(log.timestamp)} - {log.userName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-zinc-600 text-center">{filtered.length} รายการ</p>
      </main>
    </div></AppLayout>
  );
}
