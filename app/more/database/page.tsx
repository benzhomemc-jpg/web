'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Database, Users, Car, Wrench, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useCustomers } from '@/lib/controllers/use-customers';
import { useVehicles } from '@/lib/controllers/use-vehicles';
import { useJobs } from '@/lib/controllers/use-jobs';
import { useStaff } from '@/lib/controllers/use-staff';

export default function DatabasePage() {
  const router = useRouter();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { jobs } = useJobs();
  const { staff } = useStaff();
  const [issues, setIssues] = useState<{ label: string; count: number }[]>([]);
  const [checked, setChecked] = useState(false);
  const counts = useMemo(() => ({ customers: customers.length, vehicles: vehicles.length, jobs: jobs.length, staff: staff.length }), [customers, vehicles, jobs, staff]);

  const runCheck = () => {
    const nextIssues: { label: string; count: number }[] = [];
    const customerIds = new Set(customers.map(c => c.id));
    const orphanVehicles = vehicles.filter(v => v.customerId && !customerIds.has(v.customerId)).length;
    if (orphanVehicles) nextIssues.push({ label: 'รถที่อ้างถึงลูกค้าที่ไม่มีอยู่', count: orphanVehicles });
    const jobsWithoutPlate = jobs.filter(j => !j.licensePlate).length;
    if (jobsWithoutPlate) nextIssues.push({ label: 'JOB ที่ไม่มีทะเบียนรถ', count: jobsWithoutPlate });
    setIssues(nextIssues);
    setChecked(true);
  };

  const stats = [
    { icon: Users, label: 'ลูกค้า', count: counts.customers, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { icon: Car, label: 'รถ', count: counts.vehicles, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { icon: Wrench, label: 'JOB', count: counts.jobs, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    { icon: Users, label: 'พนักงาน', count: counts.staff, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  ];

  return (
    <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div><h1 className="text-lg font-bold text-white">Database</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">DATA MANAGEMENT</p></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"><Database className="w-5 h-5 text-blue-400" /></div>
          <div>
            <p className="text-sm font-medium text-white">MONGODB LOCAL</p>
            <p className="text-xs text-zinc-500">Storage: MongoDB ผ่าน Next.js API</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">Connected API</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className="glass-card metallic-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
              <div>
                <p className="text-lg font-bold text-white">{s.count}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">ตรวจสอบข้อมูล</h3>
          <button onClick={runCheck} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 active:scale-95 transition-transform">
            <RefreshCw className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">ตรวจสอบข้อมูล</span>
          </button>
          {checked && (
            issues.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">ไม่พบปัญหาข้อมูล</span>
              </div>
            ) : (
              <div className="space-y-2">
                {issues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-400">{issue.label}: {issue.count} รายการ</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div></AppLayout>
  );
}
