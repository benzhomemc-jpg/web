'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Package, Camera } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth-guard';
import { type RequisitionLineItem, generateRequisitionNumber } from '@/lib/parts-requisition';
import { useJobs } from '@/lib/controllers/use-jobs';
import { useCreateRequisition, useUpdateRequisitionStatus } from '@/lib/controllers/use-requisitions';

const PANEL: React.CSSProperties = {
  background: 'rgba(7, 11, 16, 0.86)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.11)',
  borderRadius: '18px',
};
const INPUT: React.CSSProperties = {
  background: 'rgba(10,14,20,0.88)',
  border: '1px solid rgba(255,255,255,0.11)',
  color: '#F5F7FA',
};

interface LineInput {
  key: number;
  partNumber: string;
  partName: string;
  partPhoto: string;
  quantity: string;
  unit: string;
  note: string;
}

function emptyLine(key: number): LineInput {
  return { key, partNumber: '', partName: '', partPhoto: '', quantity: '1', unit: 'ชิ้น', note: '' };
}

export default function NewRequisitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedJob = searchParams.get('job') ?? '';

  const { jobs } = useJobs();
  const { create, error: createError } = useCreateRequisition();
  const { updateStatus } = useUpdateRequisitionStatus();
  const [selectedJobNumber, setSelectedJobNumber] = useState(preselectedJob);
  const [lines, setLines] = useState<LineInput[]>([emptyLine(1)]);
  const [nextKey, setNextKey] = useState(2);
  const [saving, setSaving] = useState(false);


  const selectedJob = jobs.find(j => j.jobNumber === selectedJobNumber);

  const addLine = () => {
    setLines(prev => [...prev, emptyLine(nextKey)]);
    setNextKey(k => k + 1);
  };

  const removeLine = (key: number) => {
    setLines(prev => prev.length > 1 ? prev.filter(l => l.key !== key) : prev);
  };

  const updateLine = (key: number, field: keyof LineInput, value: string) => {
    setLines(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l));
  };

  const handlePhotoCapture = (key: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => updateLine(key, 'partPhoto', reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const canSubmit = selectedJobNumber && lines.some(l => l.partName.trim());

  const handleSubmit = async (asDraft: boolean) => {
    if (!selectedJob || !canSubmit || saving) return;
    setSaving(true);
    try {
      const items: Omit<RequisitionLineItem, 'id'>[] = lines
        .filter(l => l.partName.trim())
        .map(l => ({
          partNumber: l.partNumber.trim(),
          partName: l.partName.trim(),
          partPhoto: l.partPhoto,
          quantity: parseInt(l.quantity) || 1,
          unit: l.unit || 'ชิ้น',
          note: l.note.trim(),
        }));

      const req = await create(
        generateRequisitionNumber(),
        selectedJob.jobNumber,
        selectedJob.vehicleModel,
        selectedJob.licensePlate,
        items,
      );
      if (!req) return;
      if (!asDraft) await updateStatus(req.id, 'PENDING_APPROVAL', 'ส่งคำขอเบิก');
      router.push(`/parts/${req.id}`);
    } finally {
      setSaving(false);
    }
  };

  const headerRight = (
    <button onClick={() => router.back()} className="text-xs font-medium" style={{ color: '#0A84FF' }}>ยกเลิก</button>
  );

  return (
    <AuthGuard permission="parts">
      <AppLayout
        showBrand={false}
        headerTitle="สร้างใบเบิกอะไหล่"
        headerRight={headerRight}
        showBottomNav={false}
      >
        <div className="max-w-2xl mx-auto lg:max-w-none px-4 lg:px-0 pt-4 space-y-4 pb-28 lg:pb-8">
          {/* Job Selection */}
          <div className="p-4 space-y-3" style={PANEL}>
            <h3 className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>เลือก JOB</h3>
            <select
              value={selectedJobNumber}
              onChange={e => setSelectedJobNumber(e.target.value)}
              className="w-full h-11 px-3 rounded-xl text-sm focus:outline-none"
              style={INPUT}
            >
              <option value="">-- เลือก JOB --</option>
              {jobs.map(j => (
                <option key={j.jobNumber} value={j.jobNumber}>
                  {j.jobNumber} — {j.vehicleModel} ({j.licensePlate})
                </option>
              ))}
            </select>
            {selectedJob && (
              <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA7B2' }}>
                <span>{selectedJob.vehicleModel}</span>
                <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F7FA' }}>
                  {selectedJob.licensePlate}
                </span>
                <span>ลูกค้า: {selectedJob.customer}</span>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="p-4 space-y-4" style={PANEL}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: '#F5F7FA' }}>รายการอะไหล่</h3>
              <button onClick={addLine} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#0A84FF' }}>
                <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
              </button>
            </div>

            {lines.map((line, idx) => (
              <div
                key={line.key}
                className="p-3 rounded-xl space-y-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: '#9CA7B2' }}>รายการที่ {idx + 1}</span>
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(line.key)} className="p-1">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] mb-1 block" style={{ color: '#9CA7B2' }}>Part Number</label>
                    <input
                      value={line.partNumber}
                      onChange={e => updateLine(line.key, 'partNumber', e.target.value)}
                      placeholder="A004159..."
                      className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                      style={INPUT}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] mb-1 block" style={{ color: '#9CA7B2' }}>จำนวน</label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={e => updateLine(line.key, 'quantity', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                      style={INPUT}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] mb-1 block" style={{ color: '#9CA7B2' }}>ชื่ออะไหล่ *</label>
                  <input
                    value={line.partName}
                    onChange={e => updateLine(line.key, 'partName', e.target.value)}
                    placeholder="หัวเทียน, ผ้าเบรก..."
                    className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                    style={INPUT}
                  />
                </div>

                <div>
                  <label className="text-[11px] mb-1 block" style={{ color: '#9CA7B2' }}>หมายเหตุ</label>
                  <input
                    value={line.note}
                    onChange={e => updateLine(line.key, 'note', e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม..."
                    className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                    style={INPUT}
                  />
                </div>

                {/* Photo */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePhotoCapture(line.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA7B2' }}
                  >
                    <Camera className="w-3.5 h-3.5" /> ถ่ายรูปอะไหล่
                  </button>
                  {line.partPhoto && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={line.partPhoto} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {createError && <p className="text-sm text-red-400">{createError}</p>}

          {/* Actions: always visible on mobile */}
          <div className="fixed bottom-0 left-0 right-0 z-50 nav-blur border-t border-zinc-800 lg:static lg:border-0 lg:bg-transparent">
            <div className="max-w-2xl mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-3 lg:max-w-none lg:px-0 lg:py-0">
              <button
                onClick={() => void handleSubmit(true)}
                disabled={saving || !canSubmit}
                className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F7FA', border: '1px solid rgba(255,255,255,0.11)' }}
              >
                บันทึกร่าง
              </button>
              <button
                onClick={() => void handleSubmit(false)}
                disabled={saving || !canSubmit}
                className="flex-1 h-12 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: '#0A84FF' }}
              >
                ส่งขออนุมัติ
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
