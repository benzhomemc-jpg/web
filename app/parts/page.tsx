'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Package, ChevronRight, Car, FileText } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth-guard';
import { Badge } from '@/components/ui/badge';
import { REQUISITION_STATUSES, type PartsRequisition, type RequisitionStatus } from '@/lib/parts-requisition';
import { useRequisitions } from '@/lib/controllers/use-requisitions';

const STATUS_FILTER: { value: 'all' | RequisitionStatus; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'DRAFT', label: 'ร่าง' },
  { value: 'PENDING_APPROVAL', label: 'รออนุมัติ' },
  { value: 'APPROVED', label: 'อนุมัติ' },
  { value: 'WAITING_ISSUE', label: 'รอจ่าย' },
  { value: 'ISSUED', label: 'จ่ายแล้ว' },
  { value: 'RECEIVED', label: 'รับแล้ว' },
];

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(6, 10, 15, 0.90)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: '18px',
};

function RequisitionCard({ req, onClick }: { req: PartsRequisition; onClick: () => void }) {
  const si = REQUISITION_STATUSES[req.status];
  const date = new Date(req.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  return (
    <button onClick={onClick} className="w-full text-left transition-all active:scale-[0.99]" style={CARD_STYLE}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm tracking-wide" style={{ color: '#0A84FF' }}>{req.requisitionNumber}</span>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA7B2' }}>JOB {req.jobNumber}</p>
          </div>
          <Badge variant="outline" className={`${si.bgColor} ${si.color} border gap-1.5 px-2 py-0.5 text-[11px] font-semibold shrink-0`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${si.dotColor}`} />
            {si.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Car className="w-3.5 h-3.5 shrink-0" style={{ color: '#9CA7B2' }} />
            <span className="text-xs truncate" style={{ color: '#9CA7B2' }}>{req.vehicleModel}</span>
          </div>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F7FA' }}>{req.licensePlate}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px]" style={{ color: '#9CA7B2' }}>{req.items.length} รายการ</span>
            <span className="text-[11px]" style={{ color: '#9CA7B2' }}>{date}</span>
            <span className="text-[11px]" style={{ color: '#9CA7B2' }}>โดย {req.requestedByName}</span>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>
    </button>
  );
}

export default function PartsListPage() {
  const router = useRouter();
  const { requisitions: reqs, loading, error } = useRequisitions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequisitionStatus>('all');


  const filtered = useMemo(() => {
    let list = reqs;
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.requisitionNumber.toLowerCase().includes(q) ||
        r.jobNumber.toLowerCase().includes(q) ||
        r.licensePlate.toLowerCase().includes(q) ||
        r.vehicleModel.toLowerCase().includes(q) ||
        r.requestedByName.toLowerCase().includes(q) ||
        r.items.some(it => it.partName.toLowerCase().includes(q) || it.partNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [reqs, search, statusFilter]);

  return (
    <AuthGuard permission="parts">
      <AppLayout headerTitle="เบิกอะไหล่" showBrand={false}>
        <div className="max-w-2xl mx-auto lg:max-w-none px-4 lg:px-0 pt-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" style={{ color: '#0A84FF' }} />
              <h1 className="text-lg font-bold" style={{ color: '#F5F7FA' }}>ใบเบิกอะไหล่</h1>
            </div>
            <span className="text-xs" style={{ color: '#9CA7B2' }}>{filtered.length} รายการ</span>
          </div>

          {loading && <p className="text-xs" style={{ color: '#9CA7B2' }}>กำลังโหลดข้อมูลจาก MongoDB...</p>}
          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#9CA7B2' }} />
            <input
              type="text"
              placeholder="ค้นหาเลขใบเบิก / JOB / ทะเบียน / อะไหล่"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(10,14,20,0.88)', border: '1px solid rgba(255,255,255,0.11)', color: '#F5F7FA' }}
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {STATUS_FILTER.map(sf => {
              const active = statusFilter === sf.value;
              return (
                <button
                  key={sf.value}
                  onClick={() => setStatusFilter(sf.value)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: active ? '#0A84FF' : 'rgba(255,255,255,0.06)',
                    color: active ? '#fff' : '#9CA7B2',
                  }}
                >
                  {sf.label}
                </button>
              );
            })}
          </div>

          {/* New button */}
          <button
            onClick={() => router.push('/parts/new')}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-white font-semibold text-sm active:scale-[0.98] transition-all"
            style={{ background: '#0A84FF', boxShadow: '0 4px 20px rgba(10,132,255,0.25)' }}
          >
            <Plus className="w-5 h-5" />
            สร้างใบเบิกใหม่
          </button>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={CARD_STYLE}>
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
              <p className="text-sm" style={{ color: '#9CA7B2' }}>ยังไม่มีใบเบิกอะไหล่</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(r => (
                <RequisitionCard key={r.id} req={r} onClick={() => router.push(`/parts/${r.id}`)} />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
