'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Wrench, Clock, CheckCircle2, Car, ChevronRight, Gauge, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard, { useCurrentUser } from '@/components/auth-guard';
import MMBBrandLogo from '@/components/branding/MMBBrandLogo';
import { JOB_STATUSES, WORKFLOW_STEPS, STATUS_PROGRESS } from '@/lib/models/constants';
import { getRoleLabel } from '@/lib/controllers/auth-context';
import type { Job, JobStatus } from '@/lib/models/types';
import { useJobs } from '@/lib/controllers/use-jobs';
import { ensureDefaultAdmin } from '@/lib/controllers/auth-context';

const STATUS_ORDER: JobStatus[] = WORKFLOW_STEPS;

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(7, 11, 16, 0.86)', backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.11)', borderRadius: '18px',
};

function StatCard({ icon: Icon, label, value, accentColor }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string; value: string | number; accentColor: string;
}) {
  return (
    <div className="p-4 flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]" style={CARD_STYLE}>
      <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0" style={{ backgroundColor: `${accentColor}1a` }}>
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium leading-tight" style={{ color: '#9CA7B2' }}>{label}</p>
        <p className="text-2xl font-bold leading-tight mt-0.5" style={{ color: '#F5F7FA' }}>{value}</p>
      </div>
    </div>
  );
}

function DashboardJobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const statusInfo = JOB_STATUSES[job.status];
  const progress = STATUS_PROGRESS[job.status];
  const statusIndex = STATUS_ORDER.indexOf(job.status);

  return (
    <button onClick={onClick}
      className="w-full text-left overflow-hidden transition-all active:scale-[0.99]"
      style={{ background: 'rgba(6, 10, 15, 0.90)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.10)', borderRadius: '18px' }}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className="font-bold text-sm tracking-wide" style={{ color: '#0A84FF' }}>{job.jobNumber}</span>
          <Badge variant="outline" className={`${statusInfo.bgColor} ${statusInfo.color} border gap-1.5 px-2.5 py-1 text-xs font-semibold`}>
            <span className={`status-dot ${statusInfo.dotColor}`} />{statusInfo.label}
          </Badge>
        </div>
        <h3 className="font-semibold text-base mb-1" style={{ color: '#F5F7FA' }}>{job.vehicleModel}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center font-mono font-semibold text-sm px-2.5 py-1 rounded-md"
            style={{ background: 'rgba(9, 14, 20, 0.88)', border: '1px solid rgba(255, 255, 255, 0.11)', color: '#F5F7FA' }}>
            {job.licensePlate}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
          <div className="flex items-center gap-2 min-w-0"><User className="w-3.5 h-3.5 shrink-0" style={{ color: '#9CA7B2' }} /><span className="text-xs truncate" style={{ color: '#9CA7B2' }}>{job.customer}</span></div>
          <div className="flex items-center gap-2 min-w-0"><Gauge className="w-3.5 h-3.5 shrink-0" style={{ color: '#9CA7B2' }} /><span className="text-xs truncate" style={{ color: '#9CA7B2' }}>{job.mileage} km</span></div>
          <div className="flex items-center gap-2 min-w-0"><Wrench className="w-3.5 h-3.5 shrink-0" style={{ color: '#9CA7B2' }} /><span className="text-xs truncate" style={{ color: '#9CA7B2' }}>{job.workshopSupervisor || job.technician}</span></div>
          <div className="flex items-center gap-2 min-w-0"><Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: '#9CA7B2' }} /><span className="text-xs truncate" style={{ color: '#9CA7B2' }}>รับ {job.receivedTime} น.</span></div>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          {STATUS_ORDER.map((s, i) => (
            <div key={s} className="h-1 flex-1 rounded-full transition-colors"
              style={{ backgroundColor: i <= statusIndex ? JOB_STATUSES[s].dotColor : 'rgba(255, 255, 255, 0.08)' }} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium" style={{ color: '#9CA7B2' }}>ความคืบหน้า {progress}%</span>
          <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { jobs, loading } = useJobs();
  const user = useCurrentUser();

  useEffect(() => { ensureDefaultAdmin(); }, []);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase().replace(/[-\s]/g, '');
    return jobs.filter(j =>
      j.jobNumber.toLowerCase().replace(/[-\s]/g, '').includes(q) ||
      j.licensePlate.toLowerCase().replace(/[-\s]/g, '').includes(q) ||
      j.vehicleModel.toLowerCase().includes(q) ||
      j.customer.toLowerCase().includes(q) ||
      (j.vin && j.vin.toLowerCase().includes(q)) ||
      (j.phone && j.phone.replace(/[-\s]/g, '').includes(q))
    );
  }, [jobs, searchQuery]);

  const todayCount = jobs.length;
  const repairingCount = jobs.filter(j => j.status === 'repairing').length;
  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const readyCount = jobs.filter(j => j.status === 'ready').length;

  const today = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AuthGuard permission="dashboard">
      <AppLayout showHeader={false}>
        <header className="sticky top-0 z-40 lg:hidden"
          style={{ background: 'rgba(4, 8, 13, 0.72)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.10)' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3" style={{ padding: '14px 18px' }}>
            <div className="max-w-[55%]"><MMBBrandLogo compact /></div>
            <div className="max-w-[45%] text-right">
              {user && <p className="text-[11px] font-medium leading-tight mb-0.5" style={{ color: '#0A84FF' }}>{user.nickname} - {getRoleLabel(user.role)}</p>}
              <p className="text-[10px] leading-tight" style={{ color: '#9CA7B2' }}>{today}</p>
            </div>
          </div>
        </header>

        <div className="hidden lg:block mb-6">
          <div className="flex items-center justify-between">
            <MMBBrandLogo />
            <div className="text-right">
              {user && <p className="text-sm font-medium mb-0.5" style={{ color: '#0A84FF' }}>{user.nickname} - {getRoleLabel(user.role)}</p>}
              <p className="text-xs" style={{ color: '#9CA7B2' }}>{today}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto lg:max-w-none px-4 lg:px-0 pt-4 lg:pt-0 space-y-5">
          {loading && <div className="text-center py-8 text-zinc-500 text-sm">กำลังโหลด...</div>}

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Clock} label="งานวันนี้" value={todayCount} accentColor="#3b82f6" />
            <StatCard icon={Wrench} label="กำลังซ่อม" value={repairingCount} accentColor="#ef4444" />
            <StatCard icon={CheckCircle2} label="รออนุมัติ" value={pendingCount} accentColor="#f59e0b" />
            <StatCard icon={Car} label="พร้อมส่งมอบ" value={readyCount} accentColor="#22c55e" />
          </section>

          <section>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#9CA7B2' }} />
              <input type="text" placeholder="ค้นหา JOB / ทะเบียน / VIN / ลูกค้า" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl text-sm focus:outline-none"
                style={{ background: 'rgba(10, 14, 20, 0.88)', border: '1px solid rgba(255, 255, 255, 0.11)', color: '#F5F7FA' }} />
            </div>
          </section>

          <section>
            <Button onClick={() => router.push('/new-job')}
              className="w-full h-14 text-base font-semibold rounded-xl text-white shadow-lg transition-all active:scale-[0.98]"
              style={{ background: '#0A84FF', boxShadow: '0 4px 20px rgba(10, 132, 255, 0.25)' }}>
              <Plus className="w-5 h-5 mr-2" />เปิด JOB ใหม่
            </Button>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>งานในอู่ ({filteredJobs.length})</h2>
              <button onClick={() => router.push('/jobs')} className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: '#0A84FF' }}>ดูทั้งหมด</button>
            </div>
            {filteredJobs.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={CARD_STYLE}>
                <p className="text-sm" style={{ color: '#9CA7B2' }}>ไม่พบงานที่ตรงกับการค้นหา</p>
              </div>
            ) : (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {filteredJobs.map(job => <DashboardJobCard key={job.id} job={job} onClick={() => router.push(`/job/${job.jobNumber}`)} />)}
              </div>
            )}
          </section>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
