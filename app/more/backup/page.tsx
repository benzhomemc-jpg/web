'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Upload, ArchiveRestore, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { fetchDatabaseBackup, restoreDatabaseBackup, type DatabaseBackupPayload } from '@/lib/models/queries';
import { useCustomers } from '@/lib/controllers/use-customers';
import { useVehicles } from '@/lib/controllers/use-vehicles';
import { useJobs } from '@/lib/controllers/use-jobs';
import { useStaff } from '@/lib/controllers/use-staff';

export default function BackupPage() {
  const router = useRouter();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { jobs } = useJobs();
  const { staff } = useStaff();
  const counts = { customers: customers.length, vehicles: vehicles.length, jobs: jobs.length, staff: staff.length };
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<DatabaseBackupPayload | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lb = localStorage.getItem('mmb_last_backup');
    if (lb) setLastBackup(lb);
  }, []);

  const handleBackup = async () => {
    try {
      const data = await fetchDatabaseBackup();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mmb-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toLocaleString('th-TH');
    localStorage.setItem('mmb_last_backup', now);
    setLastBackup(now);
      setMessage({ type: 'success', text: 'สำรองข้อมูลสำเร็จ' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'สำรองข้อมูลไม่สำเร็จ' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data || typeof data !== 'object' || data.appName !== 'MMB Workshop' || !Array.isArray(data.customers) || !Array.isArray(data.jobs)) {
          setMessage({ type: 'error', text: 'ไฟล์ Backup ไม่ถูกต้อง ไม่ใช่ไฟล์ของ MMB Workshop' });
          return;
        }
        setConfirmRestore(data as DatabaseBackupPayload);
      } catch {
        setMessage({ type: 'error', text: 'ไฟล์ JSON ไม่ถูกต้อง' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const doRestore = async () => {
    if (!confirmRestore) return;
    try {
      await restoreDatabaseBackup(confirmRestore);
      setConfirmRestore(null);
      setMessage({ type: 'success', text: 'กู้คืนข้อมูลสำเร็จ กำลังโหลดข้อมูลใหม่' });
      setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'กู้คืนข้อมูลไม่สำเร็จ' });
    }
  };

  return (
    <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div><h1 className="text-lg font-bold text-white">Backup</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">BACKUP & RESTORE</p></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span className={`text-xs ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</span>
          </div>
        )}

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">ข้อมูลปัจจุบัน</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'ลูกค้า', count: counts.customers },
              { label: 'รถ', count: counts.vehicles },
              { label: 'JOB', count: counts.jobs },
              { label: 'พนักงาน', count: counts.staff },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 px-3 bg-zinc-800/40 rounded-lg">
                <span className="text-xs text-zinc-400">{s.label}</span>
                <span className="text-sm font-bold text-white">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500">วันที่ Backup ล่าสุด: {lastBackup || 'ยังไม่เคย Backup'}</div>
        </div>

        <button onClick={handleBackup} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 active:scale-95 transition-transform">
          <Download className="w-4 h-4 text-white" />
          <span className="text-sm text-white font-medium">สำรองข้อมูลตอนนี้</span>
        </button>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">กู้คืนข้อมูล</h3>
          <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 active:scale-95 transition-transform">
            <Upload className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300 font-medium">กู้คืนข้อมูลจาก Backup</span>
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
        </div>

        {confirmRestore && (
          <div className="glass-card metallic-border rounded-2xl p-4 space-y-3 border-amber-500/30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-400">ยืนยันการกู้คืน</h3>
            </div>
            <div className="text-xs text-zinc-400 space-y-1">
              <p>Version: {confirmRestore.version}</p>
              <p>สร้างเมื่อ: {new Date(confirmRestore.createdAt).toLocaleString('th-TH')}</p>
              <p>ลูกค้า: {confirmRestore.customers?.length || 0} | รถ: {confirmRestore.vehicles?.length || 0} | JOB: {confirmRestore.jobs?.length || 0} | พนักงาน: {confirmRestore.staff?.length || 0}</p>
            </div>
            <p className="text-xs text-red-400">ข้อมูลปัจจุบันจะถูกแทนที่ด้วยข้อมูลจาก Backup</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRestore(null)} className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 active:scale-95">ยกเลิก</button>
              <button onClick={doRestore} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-sm text-white font-medium active:scale-95">ยืนยันกู้คืน</button>
            </div>
          </div>
        )}
      </main>
    </div></AppLayout>
  );
}
