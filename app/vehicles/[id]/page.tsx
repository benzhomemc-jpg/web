'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Car,
  User,
  Phone,
  Gauge,
  Calendar,
  Wrench,
  ChevronRight,
  Plus,
  Pencil,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { JOB_STATUSES, type Job } from '@/lib/jobs';
import { useVehicle } from '@/lib/controllers/use-vehicles';
import { useCustomers } from '@/lib/controllers/use-customers';
import { useJobs } from '@/lib/controllers/use-jobs';
import AuthGuard from '@/components/auth-guard';

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50 last:border-0">
      <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
      <span className="text-xs text-zinc-400 w-24 shrink-0">{label}</span>
      <span className="text-sm text-white font-medium flex-1 text-right">{value}</span>
    </div>
  );
}

function JobHistoryRow({ job, onClick }: { job: Job; onClick: () => void }) {
  const statusInfo = JOB_STATUSES[job.status];
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-xs">{job.jobNumber}</span>
          <Badge
            variant="outline"
            className={`${statusInfo.bgColor} ${statusInfo.color} border gap-1 px-2 py-0.5 text-[10px] font-semibold`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.shortLabel}
          </Badge>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-400">{job.receivedDateTime || `${job.receivedTime} น.`}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-400">{job.mileage} km</span>
        </div>
      </div>
      {job.complaint && (
        <p className="text-xs text-zinc-500 mt-1.5 truncate">{job.complaint}</p>
      )}
    </button>
  );
}

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const { vehicle, loading } = useVehicle(vehicleId);
  const { customers } = useCustomers();
  const { jobs: allJobs } = useJobs();
  const owner = useMemo(() => vehicle ? customers.find(c => c.id === vehicle.customerId) || null : null, [customers, vehicle]);
  const jobs = useMemo(() => vehicle ? allJobs.filter(j => j.licensePlate === vehicle.licensePlate) : [], [allJobs, vehicle]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>;
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-zinc-400 text-sm">ไม่พบข้อมูลรถ</p>
        <button onClick={() => router.push('/vehicles')} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">
          กลับหน้ารถ
        </button>
      </div>
    );
  }

  return (
    <AuthGuard permission="vehicles">
    <AppLayout showHeader={false}>
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/vehicles')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight truncate">{vehicle.model}</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">VEHICLE DETAIL</p>
            </div>
            <span className="inline-flex items-center justify-center bg-zinc-800 text-zinc-200 font-mono font-semibold text-sm px-2.5 py-1 rounded-md border border-zinc-700">
              {vehicle.licensePlate}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
        {/* Vehicle Info */}
        <div className="glass-card metallic-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
              <Car className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-base">ข้อมูลรถ</h3>
          </div>
          <InfoRow icon={Car} label="ยี่ห้อ" value={vehicle.brand} />
          <InfoRow icon={Car} label="รุ่น" value={vehicle.model} />
          <InfoRow icon={Car} label="ทะเบียน" value={vehicle.licensePlate} />
          <InfoRow icon={Car} label="จังหวัด" value={vehicle.province} />
          <InfoRow icon={Car} label="VIN" value={vehicle.vin} />
          <InfoRow icon={Car} label="Chassis Code" value={vehicle.chassisCode !== vehicle.vin ? vehicle.chassisCode : undefined} />
          <InfoRow icon={Calendar} label="ปีรถ" value={vehicle.year} />
          <InfoRow icon={Wrench} label="เลขเครื่องยนต์" value={vehicle.engineNumber} />
          <InfoRow icon={Car} label="สีรถ" value={vehicle.color} />
          <InfoRow icon={Gauge} label="เลขไมล์" value={vehicle.mileage ? `${vehicle.mileage} km` : undefined} />
        </div>

        {/* Owner */}
        <div className="glass-card metallic-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-base">เจ้าของรถ</h3>
          </div>
          {owner ? (
            <button
              onClick={() => router.push(`/customers/${owner.id}`)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 shrink-0">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white text-sm font-medium truncate">{owner.name}</p>
                <p className="text-xs text-zinc-400">{owner.phone}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
            </button>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">ไม่พบข้อมูลเจ้าของ</p>
          )}
        </div>

        {/* Service History */}
        <div className="glass-card metallic-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
                <Wrench className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-base">ประวัติการเข้าซ่อม ({jobs.length})</h3>
            </div>
            <Button
              onClick={() => router.push('/new-job')}
              variant="outline"
              className="h-8 px-3 rounded-lg bg-zinc-900/80 border-zinc-700 text-xs text-blue-400 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              เปิด JOB
            </Button>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">ยังไม่มีประวัติ</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((j) => (
                <JobHistoryRow key={j.id} job={j} onClick={() => router.push(`/job/${j.jobNumber}`)} />
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
    </AppLayout>
    </AuthGuard>
  );
}
