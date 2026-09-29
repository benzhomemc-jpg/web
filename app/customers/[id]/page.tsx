'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  MessageCircle,
  Building2,
  MapPin,
  FileText,
  Car,
  Wrench,
  Calendar,
  ChevronRight,
  Plus,
  Pencil,
  Gauge,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { JOB_STATUSES, type Job } from '@/lib/jobs';
import { formatAddress } from '@/lib/store';
import type { Vehicle } from '@/lib/models/types';
import { useCustomer } from '@/lib/controllers/use-customers';
import { useCustomerVehicles } from '@/lib/controllers/use-vehicles';
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

function VehicleRow({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 shrink-0">
        <Car className="w-5 h-5 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-white text-sm font-medium truncate">{vehicle.model}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-400 font-mono">{vehicle.licensePlate}</span>
          {vehicle.color && <span className="text-xs text-zinc-500">{vehicle.color}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
    </button>
  );
}

function JobRow({ job, onClick }: { job: Job; onClick: () => void }) {
  const statusInfo = JOB_STATUSES[job.status];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 active:scale-[0.98] transition-transform"
    >
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-400 font-bold text-xs">{job.jobNumber}</span>
          <Badge
            variant="outline"
            className={`${statusInfo.bgColor} ${statusInfo.color} border gap-1 px-2 py-0.5 text-[10px] font-semibold`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.shortLabel}
          </Badge>
        </div>
        <p className="text-white text-sm truncate">{job.vehicleModel}</p>
        <p className="text-xs text-zinc-500 truncate">
          {job.complaint || 'ไม่ระบุอาการ'}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
    </button>
  );
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const { customer, loading } = useCustomer(customerId);
  const { vehicles } = useCustomerVehicles(customerId);
  const { jobs: allJobs } = useJobs();
  const jobs = useMemo(() => {
    if (!customer) return [];
    return allJobs.filter((job) => (customer.phone && job.phone === customer.phone) || job.customer === customer.name);
  }, [allJobs, customer]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>;
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-zinc-400 text-sm">ไม่พบข้อมูลลูกค้า</p>
        <button onClick={() => router.push('/customers')} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">
          กลับหน้าลูกค้า
        </button>
      </div>
    );
  }

  const addr = formatAddress(customer.address);
  const isCompany = customer.customerType === 'company';

  return (
    <AuthGuard permission="customers">
    <AppLayout showHeader={false}>
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/customers')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight truncate">{customer.name}</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">CUSTOMER DETAIL</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
        {/* Customer Info */}
        <div className="glass-card metallic-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-base">ข้อมูลลูกค้า</h3>
          </div>
          <InfoRow icon={User} label="ชื่อ" value={customer.name} />
          <InfoRow icon={Phone} label="โทรศัพท์" value={customer.phone} />
          <InfoRow icon={MessageCircle} label="LINE" value={customer.lineId} />
          <InfoRow icon={User} label="ประเภท" value={isCompany ? 'บริษัท' : 'บุคคล'} />
          {isCompany && <InfoRow icon={Building2} label="ชื่อบริษัท" value={customer.companyName} />}
          {addr && <InfoRow icon={MapPin} label="ที่อยู่" value={addr} />}
          {customer.taxId && <InfoRow icon={FileText} label="Tax ID" value={customer.taxId} />}
          {customer.branch && (
            <InfoRow icon={Building2} label="สาขา" value={customer.branch === 'headquarters' ? 'สำนักงานใหญ่' : 'สาขาอื่น'} />
          )}

          <button
            onClick={() => {/* edit placeholder */}}
            className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs text-blue-400 font-medium active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            แก้ไขข้อมูล
          </button>
        </div>

        {/* Vehicles */}
        <div className="glass-card metallic-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
                <Car className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-base">รถของลูกค้า ({vehicles.length})</h3>
            </div>
            <Button
              onClick={() => router.push(`/vehicles/new?customerId=${customer.id}`)}
              variant="outline"
              className="h-8 px-3 rounded-lg bg-zinc-900/80 border-zinc-700 text-xs text-blue-400 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              เพิ่มรถ
            </Button>
          </div>
          {vehicles.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">ยังไม่มีข้อมูลรถ</p>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => (
                <VehicleRow key={v.id} vehicle={v} onClick={() => router.push(`/vehicles/${v.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Job History */}
        <div className="glass-card metallic-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
                <Wrench className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-base">ประวัติงานซ่อม ({jobs.length})</h3>
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
                <JobRow key={j.id} job={j} onClick={() => router.push(`/job/${j.jobNumber}`)} />
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
