'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Car, User, Gauge, Calendar, ChevronRight, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import type { Vehicle, Customer, Job } from '@/lib/models/types';
import { useVehicles } from '@/lib/controllers/use-vehicles';
import { useCustomers } from '@/lib/controllers/use-customers';
import { useJobs } from '@/lib/controllers/use-jobs';
import AuthGuard from '@/components/auth-guard';

function lastServiceLabel(jobs: Job[]): string {
  return jobs[0]?.receivedDateTime || jobs[0]?.receivedTime || '-';
}

function VehicleCard({ vehicle, owner, jobs, onClick }: { vehicle: Vehicle; owner?: Customer; jobs: Job[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left glass-card metallic-border rounded-2xl p-4 transition-all hover:border-zinc-600 active:scale-[0.99]">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1"><h3 className="text-white font-semibold text-sm truncate">{vehicle.brand}</h3><p className="text-xs text-zinc-400 truncate">{vehicle.model}</p></div>
        <span className="inline-flex items-center justify-center bg-zinc-800 text-zinc-200 font-mono font-semibold text-sm px-2.5 py-1 rounded-md border border-zinc-700 shrink-0 ml-2">{vehicle.licensePlate}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
        {vehicle.vin && <div className="flex items-center gap-2 min-w-0 col-span-2"><Car className="w-3.5 h-3.5 text-zinc-500 shrink-0" /><span className="text-xs text-zinc-500">VIN</span><span className="text-xs text-zinc-400 font-mono truncate">{vehicle.vin}</span></div>}
        {vehicle.year && <div className="flex items-center gap-2 min-w-0"><Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" /><span className="text-xs text-zinc-400">ปี {vehicle.year}</span></div>}
        {vehicle.color && <div className="flex items-center gap-2 min-w-0"><span className="text-xs text-zinc-400">สี {vehicle.color}</span></div>}
        <div className="flex items-center gap-2 min-w-0"><Gauge className="w-3.5 h-3.5 text-zinc-500 shrink-0" /><span className="text-xs text-zinc-400">{vehicle.mileage || '-'} km</span></div>
        <div className="flex items-center gap-2 min-w-0"><User className="w-3.5 h-3.5 text-zinc-500 shrink-0" /><span className="text-xs text-zinc-400 truncate">{owner?.name || '-'}</span></div>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-800/50 pt-2.5">
        <div className="flex items-center gap-4"><div className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400">{jobs.length} งาน</span></div><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400 truncate">{lastServiceLabel(jobs)}</span></div></div>
        <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
      </div>
    </button>
  );
}

export default function VehiclesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { vehicles, loading, error } = useVehicles();
  const { customers } = useCustomers();
  const { jobs } = useJobs();

  const ownerById = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const q = searchQuery.toLowerCase().replace(/[-\s]/g, '');
    return vehicles.filter(v => {
      const owner = ownerById.get(v.customerId);
      return v.licensePlate.toLowerCase().replace(/[-\s]/g, '').includes(q) || v.vin.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || Boolean(owner?.name.toLowerCase().includes(q));
    });
  }, [vehicles, searchQuery, ownerById]);

  return (
    <AuthGuard permission="vehicles"><AppLayout showHeader={false}>
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden"><div className="max-w-2xl mx-auto px-4 pt-4 pb-3"><div className="flex items-center justify-between"><div><h1 className="text-lg font-bold text-white leading-tight">รถ</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">VEHICLES</p></div><Button onClick={() => router.push('/vehicles/new')} className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold active:scale-95"><Plus className="w-4 h-4 mr-1.5" />เพิ่มรถ</Button></div></div></header>
      <main className="max-w-2xl lg:max-w-4xl mx-auto px-4 pt-4 space-y-4 pb-24 lg:pb-0">
        <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" /><Input type="text" placeholder="ค้นหาทะเบียน / VIN / รุ่นรถ / เจ้าของ" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 pl-11 pr-4 bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm" /></div>
        <p className="text-sm text-zinc-400">{loading ? 'กำลังโหลด...' : `${filtered.length} คัน`}</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {filtered.length === 0 && !loading ? <div className="glass-card metallic-border rounded-2xl p-8 text-center space-y-4"><Car className="w-12 h-12 text-zinc-600 mx-auto" /><p className="text-zinc-400 text-sm">{searchQuery ? 'ไม่พบรถที่ตรงกับการค้นหา' : 'ยังไม่มีข้อมูลรถ'}</p><Button onClick={() => router.push('/vehicles/new')} className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold active:scale-95"><Plus className="w-5 h-5 mr-2" />เพิ่มรถ</Button></div> : <div className="space-y-3">{filtered.map(v => <VehicleCard key={v.id} vehicle={v} owner={ownerById.get(v.customerId)} jobs={jobs.filter(j => j.licensePlate === v.licensePlate)} onClick={() => router.push(`/vehicles/${v.id}`)} />)}</div>}
      </main>
    </AppLayout></AuthGuard>
  );
}
