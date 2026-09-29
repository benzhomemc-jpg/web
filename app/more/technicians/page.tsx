'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Briefcase, Wrench } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { STAFF_STATUSES } from '@/lib/store';
import type { Staff } from '@/lib/models/types';
import { useStaffByRole } from '@/lib/controllers/use-staff';
import { useJobs } from '@/lib/controllers/use-jobs';

export default function TechniciansPage() {
  const router = useRouter();
  const { staff } = useStaffByRole('technician');
  const { jobs } = useJobs();
  const jobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    staff.forEach(s => {
      counts[s.id] = jobs.filter(j =>
        j.technician?.includes(s.firstName) || (s.nickname && j.technician?.includes(s.nickname)) ||
        j.assignedTechnicians?.some(t => t.name.includes(s.firstName) || (s.nickname && t.name.includes(s.nickname)))
      ).length;
    });
    return counts;
  }, [staff, jobs]);

  const getAvailability = (s: Staff) => {
    if (s.status === 'suspended') return { label: 'พักงาน', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (s.status === 'inactive') return { label: 'ปิดการใช้งาน', color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/30' };
    const active = (jobCounts[s.id] || 0) > 0;
    return active
      ? { label: 'กำลังทำงาน', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' }
      : { label: 'ว่าง', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };
  };

  return (
    <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">ช่างเทคนิค</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">TECHNICIANS</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-4">
          <p className="text-xs text-zinc-400 mb-3">รายชื่อช่างเทคนิคจากฐานข้อมูลพนักงาน สามารถเพิ่ม/แก้ไขได้ที่หน้า "ผู้ใช้งาน / Staff"</p>
          <button onClick={() => router.push('/more/staff')} className="text-xs text-blue-400 font-medium">ไปที่หน้าจัดการพนักงาน →</button>
        </div>

        {staff.length === 0 ? (
          <div className="glass-card metallic-border rounded-2xl p-8 text-center">
            <p className="text-zinc-400 text-sm mb-2">ยังไม่มีช่างเทคนิค</p>
            <p className="text-zinc-500 text-xs">เพิ่มพนักงานตำแหน่ง Technician ที่หน้า Staff</p>
          </div>
        ) : (
          <div className="space-y-2">
            {staff.map(s => {
              const avail = getAvailability(s);
              return (
                <div key={s.id} className="glass-card metallic-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white">{s.firstName} {s.lastName}</span>
                      {s.nickname && <span className="text-xs text-zinc-500 ml-1">({s.nickname})</span>}
                      <div className="text-xs text-zinc-500 mt-0.5">{s.code}</div>
                      {s.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs text-zinc-400">{s.phone}</span>
                        </div>
                      )}
                      {s.specialties && s.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.specialties.map(sp => (
                            <span key={sp} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">{sp}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1.5">
                        <Briefcase className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-400">{jobCounts[s.id] || 0} งานปัจจุบัน</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${avail.bg} ${avail.color}`}>{avail.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div></AppLayout>
  );
}
