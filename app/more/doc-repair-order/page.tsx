'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Printer, ClipboardList } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { type WorkshopInfo } from '@/lib/store';
import { DEFAULT_WORKSHOP_INFO } from '@/lib/models/constants';
import { fetchSetting } from '@/lib/models/queries';
import { useJobs } from '@/lib/controllers/use-jobs';
import { type Job, JOB_STATUSES, sampleRepairTasks, sampleParts } from '@/lib/jobs';

export default function DocRepairOrderPage() {
  const router = useRouter();
  const { jobs } = useJobs();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Job | null>(null);
  const [workshop, setWorkshop] = useState<WorkshopInfo | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchSetting<WorkshopInfo>('workshopInfo', DEFAULT_WORKSHOP_INFO).then(setWorkshop).catch(() => setWorkshop(DEFAULT_WORKSHOP_INFO)); }, []);

  const q = search.toLowerCase();
  const filtered = jobs.filter(j => !q || j.jobNumber.toLowerCase().includes(q) || j.licensePlate.toLowerCase().includes(q) || j.customer.toLowerCase().includes(q));

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>ใบสั่งซ่อม - ${selected?.jobNumber}</title><style>body{font-family:Sarabun,sans-serif;padding:24px;color:#000;font-size:12px}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ccc;padding:6px;text-align:left}th{background:#f5f5f5;font-size:11px}h1{font-size:16px}h2{font-size:13px}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  if (selected && workshop) {
    return (
      <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
            <div className="flex-1"><h1 className="text-lg font-bold text-white">ใบสั่งซ่อม</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">{selected.jobNumber}</p></div>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 active:scale-95 transition-transform"><Printer className="w-4 h-4 text-white" /><span className="text-xs text-white font-medium">พิมพ์</span></button>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 pt-4">
          <div ref={printRef} className="glass-card metallic-border rounded-2xl p-5 space-y-4">
            <div className="text-center"><h1 className="text-base font-bold text-white">{workshop.name || 'MMB WORKSHOP'}</h1></div>
            <h2 className="text-sm font-bold text-green-400 text-center">ใบสั่งซ่อม / Repair Order</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-zinc-500">JOB:</span> <span className="text-white">{selected.jobNumber}</span></div>
              <div><span className="text-zinc-500">รถ:</span> <span className="text-white">{selected.vehicleModel}</span></div>
              <div><span className="text-zinc-500">ทะเบียน:</span> <span className="text-white">{selected.licensePlate}</span></div>
              <div><span className="text-zinc-500">เลขไมล์:</span> <span className="text-white">{selected.mileage}</span></div>
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <h3 className="text-xs font-semibold text-zinc-400 mb-2">อาการ / ข้อร้องเรียน</h3>
              <p className="text-xs text-white">{selected.complaint || '-'}</p>
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <h3 className="text-xs font-semibold text-zinc-400 mb-2">รายการซ่อม</h3>
              {sampleRepairTasks.map((t, i) => (
                <div key={t.id} className="flex items-start gap-2 py-2 border-b border-zinc-800/50 last:border-0">
                  <span className="text-xs text-zinc-600">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-xs text-white">{t.description}</p>
                    <p className="text-[10px] text-zinc-500">ช่าง: {t.technician}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <h3 className="text-xs font-semibold text-zinc-400 mb-2">อะไหล่ที่ต้องใช้</h3>
              {sampleParts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0 text-xs">
                  <span className="text-white">{p.name}</span>
                  <span className="text-zinc-400">{p.partNumber} x{p.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-zinc-500">SA:</span> <span className="text-white">{selected.serviceAdvisor || '-'}</span></div>
              <div><span className="text-zinc-500">หัวหน้าช่าง:</span> <span className="text-white">{selected.workshopSupervisor || '-'}</span></div>
            </div>
          </div>
        </main>
    </div></AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div><h1 className="text-lg font-bold text-white">ใบสั่งซ่อม</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">REPAIR ORDER</p></div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" /><input placeholder="ค้นหา JOB / ทะเบียน / ลูกค้า" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500" /></div>
        <div className="space-y-2">
          {filtered.map(j => (
            <button key={j.id} onClick={() => setSelected(j)} className="w-full glass-card metallic-border rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0"><ClipboardList className="w-4 h-4 text-green-400" /></div>
              <div className="flex-1 text-left min-w-0"><span className="text-sm font-medium text-white">{j.jobNumber}</span><div className="text-xs text-zinc-500 truncate">{j.licensePlate} - {j.customer}</div></div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border ${JOB_STATUSES[j.status]?.bgColor} ${JOB_STATUSES[j.status]?.color}`}>{JOB_STATUSES[j.status]?.shortLabel}</span>
            </button>
          ))}
        </div>
      </main>
    </div></AppLayout>
  );
}
