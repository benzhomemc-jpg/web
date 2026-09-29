'use client';

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Check,
  X,
  Camera,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Car,
  Wrench,
  ClipboardList,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  INSPECTION_SYSTEMS,
  INSPECTION_RESULTS,
  sampleDiagnostic,
  type InspectionResult,
  type ChecklistSystem,
  type DtcCode,
  type DiagnosticReport,
  type Job,
} from '@/lib/jobs';
import AuthGuard from '@/components/auth-guard';
import { useJob } from '@/lib/controllers/use-jobs';
import AppLayout from '@/components/layout/AppLayout';

const inputClass = 'w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors';
const textareaClass = 'w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-none';

function SystemChecklist({
  system,
  onUpdate,
}: {
  system: ChecklistSystem;
  onUpdate: (systemId: string, itemKey: string, field: string, value: unknown) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const checkedCount = system.items.filter((i) => i.checked).length;
  const totalCount = system.items.length;
  const allChecked = checkedCount === totalCount;

  return (
    <div className="glass-card metallic-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-lg border shrink-0 ${
              allChecked
                ? 'bg-green-500/15 border-green-500/30'
                : 'bg-blue-500/15 border-blue-500/30'
            }`}
          >
            {allChecked ? (
              <Check className="w-4.5 h-4.5 text-green-400" />
            ) : (
              <ClipboardList className="w-4.5 h-4.5 text-blue-400" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold text-sm">{system.label}</h3>
            <p className="text-[10px] text-zinc-500">
              {checkedCount}/{totalCount} ตรวจแล้ว
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {system.items.map((item) => (
              <div
                key={item.key}
                className={`w-1.5 h-1.5 rounded-full ${
                  item.checked ? 'bg-green-500' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/50 divide-y divide-zinc-800/30">
          {system.items.map((item) => (
            <ChecklistItemRow
              key={item.key}
              systemId={system.id}
              item={item}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChecklistItemRow({
  systemId,
  item,
  onUpdate,
}: {
  systemId: string;
  item: ChecklistSystem['items'][number];
  onUpdate: (systemId: string, itemKey: string, field: string, value: unknown) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultInfo = INSPECTION_RESULTS[item.result];

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate(systemId, item.key, 'photos', [...item.photos, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => {
    const next = item.photos.filter((_, i) => i !== idx);
    onUpdate(systemId, item.key, 'photos', next);
  };

  return (
    <div className="p-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handlePhoto(e.target.files?.[0])}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => onUpdate(systemId, item.key, 'checked', !item.checked)}
          className={`flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 transition-all active:scale-90 ${
            item.checked
              ? 'bg-green-500/20 border-green-500/40'
              : 'bg-zinc-800 border-zinc-700'
          }`}
        >
          {item.checked && <Check className="w-4 h-4 text-green-400" />}
        </button>

        <span
          className={`text-sm flex-1 ${item.checked ? 'text-white' : 'text-zinc-400'}`}
        >
          {item.label}
        </span>

        <button
          onClick={() => setShowDetail(!showDetail)}
          className="text-zinc-500 active:scale-90 transition-transform"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showDetail ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {showDetail && (
        <div className="mt-3 ml-10 space-y-3">
          {/* Result selector */}
          <div>
            <Label className="text-[10px] text-zinc-500 mb-1.5 block">ผลการตรวจ</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(INSPECTION_RESULTS) as InspectionResult[]).map((r) => {
                const info = INSPECTION_RESULTS[r];
                const selected = item.result === r;
                return (
                  <button
                    key={r}
                    onClick={() => onUpdate(systemId, item.key, 'result', r)}
                    className={`h-9 rounded-lg border text-[11px] font-medium transition-all active:scale-95 ${
                      selected
                        ? `${info.bgColor} ${info.color}`
                        : 'bg-zinc-900/80 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <Label className="text-[10px] text-zinc-500 mb-1.5 block">หมายเหตุช่าง</Label>
            <Textarea
              value={item.note}
              onChange={(e) => onUpdate(systemId, item.key, 'note', e.target.value)}
              placeholder="ระบุรายละเอียด..."
              className={`${textareaClass} min-h-[60px]`}
            />
          </div>

          {/* Photos */}
          <div>
            <Label className="text-[10px] text-zinc-500 mb-1.5 block">รูปภาพ</Label>
            <div className="flex gap-2 flex-wrap">
              {item.photos.map((photo, idx) => (
                <div key={idx} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`photo-${idx}`}
                    className="w-16 h-16 rounded-lg object-cover border border-zinc-700"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center active:scale-90"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <Camera className="w-4 h-4 text-zinc-500" />
                <span className="text-[9px] text-zinc-500">เพิ่ม</span>
              </button>
            </div>
          </div>

          {/* Result badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500">สถานะ:</span>
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${resultInfo.bgColor} ${resultInfo.color}`}>
              {resultInfo.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function DtcCard({
  dtc,
  onUpdate,
  onRemove,
}: {
  dtc: DtcCode;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onRemove: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate(dtc.id, 'photo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const statusColors: Record<string, string> = {
    current: 'text-red-400 bg-red-500/15 border-red-500/30',
    pending: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    history: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30',
  };

  return (
    <div className="glass-card metallic-border rounded-2xl p-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handlePhoto(e.target.files?.[0])}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-white font-mono font-bold text-sm">{dtc.code}</p>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[dtc.status]}`}>
              {dtc.status === 'current' ? 'Current' : dtc.status === 'pending' ? 'Pending' : 'History'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(dtc.id)}
          className="text-zinc-500 hover:text-red-400 active:scale-90 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-[10px] text-zinc-500 mb-1 block">สถานะ DTC</Label>
          <Select
            value={dtc.status}
            onValueChange={(v) => onUpdate(dtc.id, 'status', v)}
          >
            <SelectTrigger className={`${inputClass} bg-zinc-900/80 h-10`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="current" className="text-white">Current</SelectItem>
              <SelectItem value="pending" className="text-white">Pending</SelectItem>
              <SelectItem value="history" className="text-white">History</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[10px] text-zinc-500 mb-1 block">รายละเอียด</Label>
          <Textarea
            value={dtc.detail}
            onChange={(e) => onUpdate(dtc.id, 'detail', e.target.value)}
            placeholder="รายละเอียด Fault Code..."
            className={`${textareaClass} min-h-[60px]`}
          />
        </div>

        <div className="flex items-center gap-2">
          {dtc.photo && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dtc.photo} alt="dtc" className="w-16 h-16 rounded-lg object-cover border border-zinc-700" />
              <button
                onClick={() => onUpdate(dtc.id, 'photo', null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900/80 text-xs text-zinc-400 active:scale-95 transition-transform"
          >
            <Camera className="w-3.5 h-3.5" />
            เพิ่มรูป
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InspectionPage() {
  const router = useRouter();
  const params = useParams();
  const jobNumber = params.job as string;

  const { job, loading: jobLoading } = useJob(jobNumber);
  const [systems, setSystems] = useState<ChecklistSystem[]>(INSPECTION_SYSTEMS);
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport>(sampleDiagnostic);
  const [showAddDtc, setShowAddDtc] = useState(false);
  const [newDtcCode, setNewDtcCode] = useState('');
  const [newDtcStatus, setNewDtcStatus] = useState<'current' | 'pending' | 'history'>('current');
  const [newDtcDetail, setNewDtcDetail] = useState('');
  const reportFileRef = useRef<HTMLInputElement>(null);

  const handleUpdateItem = (systemId: string, itemKey: string, field: string, value: unknown) => {
    setSystems((prev) =>
      prev.map((sys) =>
        sys.id !== systemId
          ? sys
          : {
              ...sys,
              items: sys.items.map((item) =>
                item.key !== itemKey ? item : { ...item, [field]: value }
              ),
            }
      )
    );
  };

  const handleDtcUpdate = (id: string, field: string, value: unknown) => {
    setDiagnostic((prev) => ({
      ...prev,
      dtcCodes: prev.dtcCodes.map((d) => (d.id !== id ? d : { ...d, [field]: value })),
    }));
  };

  const handleDtcRemove = (id: string) => {
    setDiagnostic((prev) => ({
      ...prev,
      dtcCodes: prev.dtcCodes.filter((d) => d.id !== id),
    }));
  };

  const addDtc = () => {
    if (!newDtcCode.trim()) return;
    setDiagnostic((prev) => ({
      ...prev,
      dtcCodes: [
        ...prev.dtcCodes,
        {
          id: `dtc-${Date.now()}`,
          code: newDtcCode.toUpperCase(),
          status: newDtcStatus,
          detail: newDtcDetail,
          photo: null,
        },
      ],
    }));
    setNewDtcCode('');
    setNewDtcStatus('current');
    setNewDtcDetail('');
    setShowAddDtc(false);
  };

  const handleReportPhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDiagnostic((prev) => ({ ...prev, reportPhoto: reader.result as string, reportAttached: true }));
    };
    reader.readAsDataURL(file);
  };

  // Stats
  const totalItems = systems.reduce((sum, s) => sum + s.items.length, 0);
  const checkedItems = systems.reduce(
    (sum, s) => sum + s.items.filter((i) => i.checked).length,
    0
  );
  const urgentItems = systems.reduce(
    (sum, s) => sum + s.items.filter((i) => i.checked && i.result === 'urgent').length,
    0
  );
  const repairItems = systems.reduce(
    (sum, s) => sum + s.items.filter((i) => i.checked && i.result === 'repair').length,
    0
  );
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <AuthGuard permission="inspection">
    <AppLayout showHeader={false} showBottomNav={false}>
    <div className="min-h-screen bg-background pb-28 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight">การตรวจวิเคราะห์</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest leading-tight">
                TECHNICIAN INSPECTION
              </p>
            </div>
          </div>
          {job && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-blue-400 font-mono font-medium">{job.jobNumber}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-white font-medium truncate">{job.vehicleModel}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400 font-mono">{job.licensePlate}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* Progress Summary */}
        <div className="glass-card metallic-border rounded-2xl p-5 stat-glow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm">ความคืบหน้าการตรวจ</h2>
            <span className="text-2xl font-bold text-blue-400">{progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{checkedItems}</p>
              <p className="text-[10px] text-zinc-500">ตรวจแล้ว</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-zinc-400">{totalItems - checkedItems}</p>
              <p className="text-[10px] text-zinc-500">ยังไม่ตรวจ</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{repairItems}</p>
              <p className="text-[10px] text-zinc-500">ต้องซ่อม</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">{urgentItems}</p>
              <p className="text-[10px] text-zinc-500">เร่งด่วน</p>
            </div>
          </div>
        </div>

        {/* Inspection Systems */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">รายการตรวจตามระบบ</h2>
          <div className="space-y-3">
            {systems.map((system) => (
              <SystemChecklist
                key={system.id}
                system={system}
                onUpdate={handleUpdateItem}
              />
            ))}
          </div>
        </div>

        {/* Diagnostic / DTC Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Diagnostic</h2>
            <Button
              onClick={() => setShowAddDtc(!showAddDtc)}
              className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              เพิ่ม DTC
            </Button>
          </div>

          {/* XENTRY Scan status */}
          <div className="glass-card metallic-border rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
                  <Search className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">XENTRY SCAN</p>
                  <p className="text-[10px] text-zinc-500">Mercedes-Benz Diagnostic</p>
                </div>
              </div>
              <button
                onClick={() => setDiagnostic((prev) => ({ ...prev, xentryScan: !prev.xentryScan }))}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  diagnostic.xentryScan ? 'bg-green-500/30' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full transition-transform ${
                    diagnostic.xentryScan
                      ? 'translate-x-5 bg-green-400'
                      : 'translate-x-0.5 bg-zinc-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Add DTC form */}
          {showAddDtc && (
            <div className="glass-card metallic-border rounded-2xl p-4 space-y-3 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">DTC Code</Label>
                  <Input
                    value={newDtcCode}
                    onChange={(e) => setNewDtcCode(e.target.value)}
                    placeholder="P0299"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">สถานะ</Label>
                  <Select value={newDtcStatus} onValueChange={(v) => setNewDtcStatus(v as 'current' | 'pending' | 'history')}>
                    <SelectTrigger className={`${inputClass} bg-zinc-900/80 h-12`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="current" className="text-white">Current</SelectItem>
                      <SelectItem value="pending" className="text-white">Pending</SelectItem>
                      <SelectItem value="history" className="text-white">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-zinc-500 mb-1 block">รายละเอียด</Label>
                <Textarea
                  value={newDtcDetail}
                  onChange={(e) => setNewDtcDetail(e.target.value)}
                  placeholder="รายละเอียด Fault Code..."
                  className={textareaClass}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={addDtc}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium active:scale-95"
                >
                  เพิ่ม
                </Button>
                <Button
                  onClick={() => setShowAddDtc(false)}
                  variant="outline"
                  className="h-11 px-4 rounded-xl bg-zinc-900/80 border-zinc-700 text-zinc-300 active:scale-95"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          )}

          {/* DTC Cards */}
          {diagnostic.dtcCodes.length === 0 && !showAddDtc ? (
            <div className="glass-card metallic-border rounded-2xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">ยังไม่มี DTC / Fault Code</p>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnostic.dtcCodes.map((dtc) => (
                <DtcCard
                  key={dtc.id}
                  dtc={dtc}
                  onUpdate={handleDtcUpdate}
                  onRemove={handleDtcRemove}
                />
              ))}
            </div>
          )}

          {/* Attach diagnostic report */}
          <input
            ref={reportFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleReportPhoto(e.target.files?.[0])}
          />
          <div className="glass-card metallic-border rounded-2xl p-4 mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700">
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">รายงาน Diagnostic</p>
                <p className="text-[10px] text-zinc-500">
                  {diagnostic.reportAttached ? 'แนบแล้ว' : 'ยังไม่ได้แนบ'}
                </p>
              </div>
              <button
                onClick={() => reportFileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900/80 text-xs text-zinc-400 active:scale-95 transition-transform"
              >
                <Paperclip className="w-3.5 h-3.5" />
                แนบรายงาน
              </button>
            </div>
            {diagnostic.reportPhoto && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={diagnostic.reportPhoto}
                  alt="diagnostic report"
                  className="w-full rounded-xl border border-zinc-700"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 nav-blur border-t border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="h-14 flex-1 text-base font-semibold rounded-xl bg-zinc-800/80 border-zinc-700 text-zinc-200 active:scale-95"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={() => router.back()}
            className="h-14 flex-1 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Save className="w-5 h-5 mr-2" />
            บันทึกการตรวจ
          </Button>
        </div>
      </div>
    </div>
    </AppLayout>
    </AuthGuard>
  );
}
