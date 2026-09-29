'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Car,
  User,
  Calendar,
  FileText,
  Clock,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard, { useCurrentUser } from '@/components/auth-guard';
import { getAllowedTransitions, REQUISITION_STATUSES, type PartsRequisition, type RequisitionStatus } from '@/lib/parts-requisition';
import { useRequisition, useUpdateRequisitionStatus } from '@/lib/controllers/use-requisitions';

const PANEL: React.CSSProperties = {
  background: 'rgba(7, 11, 16, 0.86)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: '18px',
};

const ACTION_LABELS: Partial<Record<RequisitionStatus, { label: string; color: string; icon: typeof CheckCircle2 }>> = {
  PENDING_APPROVAL: { label: 'ส่งขออนุมัติ', color: '#f59e0b', icon: Clock },
  APPROVED:         { label: 'อนุมัติ',      color: '#0A84FF', icon: CheckCircle2 },
  WAITING_ISSUE:    { label: 'ส่งรอจ่าย',    color: '#06b6d4', icon: Package },
  ISSUED:           { label: 'จ่ายอะไหล่',    color: '#22c55e', icon: CheckCircle2 },
  RECEIVED:         { label: 'ยืนยันรับแล้ว',  color: '#10b981', icon: CheckCircle2 },
  REJECTED:         { label: 'ปฏิเสธ',       color: '#ef4444', icon: XCircle },
  OUT_OF_STOCK:     { label: 'ไม่มีของ',      color: '#f97316', icon: AlertTriangle },
  CANCELLED:        { label: 'ยกเลิก',       color: '#6b7280', icon: XCircle },
  DRAFT:            { label: 'แก้ไขใหม่',     color: '#9CA7B2', icon: FileText },
};

export default function RequisitionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const user = useCurrentUser();

  const { requisition: loadedReq, loading, refresh } = useRequisition(id);
  const { updateStatus, loading: updating } = useUpdateRequisitionStatus();
  const [localReq, setLocalReq] = useState<PartsRequisition | null>(null);
  const [actionNote, setActionNote] = useState('');
  const req = localReq ?? loadedReq;

  if (loading) return null;
  if (!req) {
    return (
      <AuthGuard permission="parts">
        <AppLayout headerTitle="ไม่พบใบเบิก" showBrand={false}>
          <div className="flex items-center justify-center min-h-[50vh]">
            <p style={{ color: '#9CA7B2' }}>ไม่พบใบเบิกอะไหล่นี้</p>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  const si = REQUISITION_STATUSES[req.status];
  const role = user?.role ?? 'technician';
  const allowed = getAllowedTransitions(req.status, role);
  const createdDate = new Date(req.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

  const handleAction = async (newStatus: RequisitionStatus) => {
    if (updating) return;
    const updated = await updateStatus(req.id, newStatus, actionNote.trim());
    if (updated) {
      setLocalReq(updated);
      setActionNote('');
      await refresh();
    }
  };

  const headerRight = (
    <button onClick={() => router.push(`/job/${req.jobNumber}`)} className="text-xs font-medium" style={{ color: '#0A84FF' }}>
      ดู JOB
    </button>
  );

  return (
    <AuthGuard permission="parts">
      <AppLayout showBrand={false} headerTitle={req.requisitionNumber} headerRight={headerRight}>
        <div className="max-w-2xl mx-auto lg:max-w-none px-4 lg:px-0 pt-4 space-y-4 pb-8">
          {/* Status Banner */}
          <div className="p-4 flex items-center justify-between" style={PANEL}>
            <div>
              <p className="text-xs mb-1" style={{ color: '#9CA7B2' }}>สถานะ</p>
              <Badge variant="outline" className={`${si.bgColor} ${si.color} border gap-1.5 px-3 py-1 text-sm font-semibold`}>
                <span className={`inline-block w-2 h-2 rounded-full ${si.dotColor}`} />
                {si.label}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#9CA7B2' }}>{createdDate}</p>
            </div>
          </div>

          {/* Job Info */}
          <div className="p-4 space-y-2" style={PANEL}>
            <h3 className="text-xs font-semibold mb-2" style={{ color: '#9CA7B2' }}>ข้อมูล JOB</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" style={{ color: '#9CA7B2' }} />
                <span className="text-sm" style={{ color: '#F5F7FA' }}>{req.jobNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5" style={{ color: '#9CA7B2' }} />
                <span className="text-sm truncate" style={{ color: '#F5F7FA' }}>{req.vehicleModel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono" style={{ color: '#F5F7FA' }}>{req.licensePlate}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" style={{ color: '#9CA7B2' }} />
                <span className="text-sm" style={{ color: '#F5F7FA' }}>{req.requestedByName}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-4 space-y-3" style={PANEL}>
            <h3 className="text-xs font-semibold" style={{ color: '#9CA7B2' }}>รายการอะไหล่ ({req.items.length})</h3>
            {req.items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl flex gap-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {item.partPhoto ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.partPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg border border-white/10 shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Package className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.15)' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#F5F7FA' }}>{item.partName}</p>
                  {item.partNumber && <p className="text-xs font-mono" style={{ color: '#9CA7B2' }}>{item.partNumber}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: '#0A84FF' }}>x{item.quantity}</span>
                    {item.note && <span className="text-xs truncate" style={{ color: '#9CA7B2' }}>{item.note}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {allowed.length > 0 && (
            <div className="p-4 space-y-3" style={PANEL}>
              <h3 className="text-xs font-semibold" style={{ color: '#9CA7B2' }}>ดำเนินการ</h3>
              <input
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                placeholder="หมายเหตุ (ถ้ามี)"
                className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                style={{ background: 'rgba(10,14,20,0.88)', border: '1px solid rgba(255,255,255,0.11)', color: '#F5F7FA' }}
              />
              <div className="flex flex-wrap gap-2">
                {allowed.map(status => {
                  const info = ACTION_LABELS[status];
                  return (
                    <button
                      key={status}
                      onClick={() => void handleAction(status)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.97]"
                      style={{ background: info?.color ?? '#0A84FF' }}
                    >
                      {info?.icon && <info.icon className="w-4 h-4" />}
                      {info?.label ?? status}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="p-4 space-y-3" style={PANEL}>
            <h3 className="text-xs font-semibold" style={{ color: '#9CA7B2' }}>ประวัติสถานะ</h3>
            {req.statusHistory.map((h, i) => {
              const toInfo = REQUISITION_STATUSES[h.to];
              const time = new Date(h.changedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${toInfo.dotColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#F5F7FA' }}>{toInfo.label}</p>
                    <p className="text-xs" style={{ color: '#9CA7B2' }}>{h.changedByName} - {time}</p>
                    {h.note && <p className="text-xs mt-0.5" style={{ color: '#9CA7B2' }}>{h.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
