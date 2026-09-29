'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Wrench, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { JobCard } from '@/components/views/JobCard';
import { WORKFLOW_STEPS } from '@/lib/models/constants';
import type { JobStatus } from '@/lib/models/types';
import { useJobs } from '@/lib/controllers/use-jobs';
import AuthGuard from '@/components/auth-guard';

const STATUS_ORDER: JobStatus[] = WORKFLOW_STEPS;

const FILTER_CHIPS: { value: string; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' }, { value: 'received', label: 'รับรถ' },
  { value: 'inspecting', label: 'ตรวจเช็ก' }, { value: 'pending', label: 'รออนุมัติ' },
  { value: 'parts', label: 'รออะไหล่' }, { value: 'repairing', label: 'กำลังซ่อม' },
  { value: 'qc', label: 'QC' }, { value: 'ready', label: 'พร้อมส่งมอบ' },
  { value: 'closed', label: 'ปิด JOB' },
];

type SortMode = 'newest' | 'oldest' | 'status';

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const { jobs, loading } = useJobs();

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (statusFilter !== 'all') result = result.filter(j => j.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/[-\s]/g, '');
      result = result.filter(j =>
        j.jobNumber.toLowerCase().replace(/[-\s]/g, '').includes(q) ||
        j.licensePlate.toLowerCase().replace(/[-\s]/g, '').includes(q) ||
        j.vehicleModel.toLowerCase().includes(q) ||
        j.customer.toLowerCase().includes(q) ||
        (j.vin && j.vin.toLowerCase().includes(q)) ||
        (j.phone && j.phone.replace(/[-\s]/g, '').includes(q))
      );
    }
    if (sortMode === 'oldest') result = [...result].reverse();
    else if (sortMode === 'status') result = [...result].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    return result;
  }, [jobs, searchQuery, statusFilter, sortMode]);

  const cycleSortMode = () => {
    const modes: SortMode[] = ['newest', 'oldest', 'status'];
    setSortMode(modes[(modes.indexOf(sortMode) + 1) % modes.length]);
  };

  const sortLabels: Record<SortMode, string> = { newest: 'ล่าสุด', oldest: 'เก่าสุด', status: 'สถานะ' };

  return (
    <AuthGuard permission="jobs">
      <AppLayout showHeader={false}>
        <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">งานซ่อม</h1>
                <p className="text-[10px] text-blue-400 font-medium tracking-widest">ALL JOBS</p>
              </div>
              <Button onClick={() => router.push('/new-job')}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold active:scale-95">
                <Plus className="w-4 h-4 mr-1.5" />เปิด JOB ใหม่
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl lg:max-w-4xl mx-auto px-4 pt-4 space-y-4 pb-24 lg:pb-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
            <Input type="text" placeholder="ค้นหา JOB / ทะเบียน / VIN / ลูกค้า / เบอร์โทร"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="h-12 pl-11 pr-4 bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm" />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {FILTER_CHIPS.map(chip => (
              <button key={chip.value} onClick={() => setStatusFilter(chip.value)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  statusFilter === chip.value ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'}`}>
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">{loading ? 'กำลังโหลด...' : `${filteredJobs.length} งาน`}</p>
            <button onClick={cycleSortMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/80 text-xs text-zinc-400 active:scale-95">
              <ArrowUpDown className="w-3.5 h-3.5" />{sortLabels[sortMode]}
            </button>
          </div>

          {filteredJobs.length === 0 && !loading ? (
            <div className="glass-card metallic-border rounded-2xl p-8 text-center space-y-4">
              <Wrench className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">ยังไม่มีงานซ่อม</p>
              <Button onClick={() => router.push('/new-job')}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold active:scale-95">
                <Plus className="w-5 h-5 mr-2" />เปิด JOB ใหม่
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map(job => <JobCard key={job.id} job={job} onClick={() => router.push(`/job/${job.jobNumber}`)} />)}
            </div>
          )}
        </main>
      </AppLayout>
    </AuthGuard>
  );
}
