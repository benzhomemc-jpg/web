'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, User, Phone, MessageCircle, ChevronRight, Building2, Users, Wrench, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { formatAddress } from '@/lib/store';
import type { Customer, Vehicle, Job } from '@/lib/models/types';
import { useCustomers } from '@/lib/controllers/use-customers';
import { useVehicles } from '@/lib/controllers/use-vehicles';
import { useJobs } from '@/lib/controllers/use-jobs';
import AuthGuard from '@/components/auth-guard';

function lastServiceLabel(jobs: Job[]): string {
  if (!jobs.length) return '-';
  const value = jobs[0]?.receivedDateTime || jobs[0]?.receivedTime;
  return value || '-';
}

function CustomerCard({ customer, vehicles, jobs, onClick }: { customer: Customer; vehicles: Vehicle[]; jobs: Job[]; onClick: () => void }) {
  const addr = formatAddress(customer.address);
  const isCompany = customer.customerType === 'company';
  const relatedVehicles = vehicles.filter(v => v.customerId === customer.id);
  const relatedJobs = jobs.filter(j => (customer.phone && j.phone === customer.phone) || j.customer === customer.name);

  return (
    <button onClick={onClick} className="w-full text-left glass-card metallic-border rounded-2xl p-4 transition-all hover:border-zinc-600 active:scale-[0.99]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
            {isCompany ? <Building2 className="w-5 h-5 text-blue-400" /> : <User className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{customer.name}</h3>
            {isCompany && customer.companyName && <p className="text-xs text-zinc-500 truncate">{customer.companyName}</p>}
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${isCompany ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'}`}>
          {isCompany ? 'บริษัท' : 'บุคคล'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
        <div className="flex items-center gap-2 min-w-0"><Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" /><span className="text-xs text-zinc-400 truncate">{customer.phone || '-'}</span></div>
        <div className="flex items-center gap-2 min-w-0"><MessageCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" /><span className="text-xs text-zinc-400 truncate">{customer.lineId || '-'}</span></div>
      </div>
      {addr && <p className="text-xs text-zinc-500 mb-3 truncate">{addr}</p>}
      <div className="flex items-center justify-between border-t border-zinc-800/50 pt-2.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400">{relatedVehicles.length} คัน</span></div>
          <div className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400">{relatedJobs.length} งาน</span></div>
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs text-zinc-400 truncate">{lastServiceLabel(relatedJobs)}</span></div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
      </div>
    </button>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { customers, loading, error } = useCustomers();
  const { vehicles } = useVehicles();
  const { jobs } = useJobs();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().replace(/[-\s]/g, '');
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.replace(/[-\s]/g, '').includes(q) || c.lineId.toLowerCase().includes(q) || c.taxId.replace(/[-\s]/g, '').includes(q) || (c.companyName && c.companyName.toLowerCase().includes(q)));
  }, [customers, searchQuery]);

  return (
    <AuthGuard permission="customers"><AppLayout showHeader={false}>
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden"><div className="max-w-2xl mx-auto px-4 pt-4 pb-3"><div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold text-white leading-tight">ลูกค้า</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">CUSTOMERS</p></div>
        <Button onClick={() => router.push('/customers/new')} className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold active:scale-95"><Plus className="w-4 h-4 mr-1.5" />เพิ่มลูกค้า</Button>
      </div></div></header>
      <main className="max-w-2xl lg:max-w-4xl mx-auto px-4 pt-4 space-y-4 pb-24 lg:pb-0">
        <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" /><Input type="text" placeholder="ค้นหาชื่อ / เบอร์โทร / LINE / Tax ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 pl-11 pr-4 bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm" /></div>
        <p className="text-sm text-zinc-400">{loading ? 'กำลังโหลด...' : `${filtered.length} ลูกค้า`}</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {filtered.length === 0 && !loading ? (
          <div className="glass-card metallic-border rounded-2xl p-8 text-center space-y-4"><Users className="w-12 h-12 text-zinc-600 mx-auto" /><p className="text-zinc-400 text-sm">{searchQuery ? 'ไม่พบลูกค้าที่ตรงกับการค้นหา' : 'ยังไม่มีข้อมูลลูกค้า'}</p><Button onClick={() => router.push('/customers/new')} className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold active:scale-95"><Plus className="w-5 h-5 mr-2" />เพิ่มลูกค้า</Button></div>
        ) : (
          <div className="space-y-3">{filtered.map(c => <CustomerCard key={c.id} customer={c} vehicles={vehicles} jobs={jobs} onClick={() => router.push(`/customers/${c.id}`)} />)}</div>
        )}
      </main>
    </AppLayout></AuthGuard>
  );
}
