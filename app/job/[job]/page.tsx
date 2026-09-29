'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Wrench,
  User,
  Car,
  Gauge,
  Phone,
  Calendar,
  FileText,
  Fuel,
  Camera,
  ClipboardCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Check,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  History,
  ListChecks,
  Receipt,
  Package,
  ChevronRight,
  AlertCircle,
  MapPin,
  Building2,
  Pencil,
  MessageCircle,
  XCircle,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  JOB_STATUSES,
  WORKFLOW_STEPS,
  formatCurrency,
  type Job,
  type JobStatus,
  INSPECTION_RESULTS,
  sampleInspections,
  type QuotationItem,
  type QuotationStatus,
  QUOTATION_STATUSES,
  sampleQuotationItems,
  type RepairTask,
  type RepairStatus,
  REPAIR_STATUS_INFO,
  sampleRepairTasks,
  type PartItem,
  type PartAvailability,
  PART_AVAILABILITY,
  sampleParts,
  PHOTO_CATEGORIES,
  type GalleryPhoto,
  QC_CHECKLIST,
  type TimelineEvent,
  sampleTimeline,
  formatAddress,
  type CustomerAddress,
  EMPTY_ADDRESS,
  type BranchType,
} from '@/lib/jobs';
import {
  getAllowedTransitions,
  REQUISITION_STATUSES,
  type PartsRequisition,
  type RequisitionStatus,
  type RequisitionLineItem,
  generateRequisitionNumber,
} from '@/lib/parts-requisition';
import { getCurrentUser, type UserSession } from '@/lib/auth';
import AuthGuard from '@/components/auth-guard';
import AppLayout from '@/components/layout/AppLayout';
import { useJob } from '@/lib/controllers/use-jobs';
import { useRequisitionsForJob, useCreateRequisition, useUpdateRequisitionStatus } from '@/lib/controllers/use-requisitions';

const inputClass = 'w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors';
const textareaClass = 'w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-none min-h-[80px]';

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
      <span className="text-xs text-zinc-400 w-28 shrink-0">{label}</span>
      <span className="text-sm text-white font-medium flex-1 text-right">{value}</span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card metallic-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 shrink-0">
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-white font-semibold text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// --- Tab: ภาพรวม ---

function CustomerInfoSection({ job, onEdit }: { job: Job; onEdit: () => void }) {
  const addr = job.address;
  const addrStr = addr ? formatAddress(addr) : '';
  const isCompany = job.customerType === 'company';

  return (
    <SectionCard icon={User} title="ข้อมูลลูกค้า">
      <div className="space-y-0">
        {isCompany && job.companyName && (
          <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50">
            <Building2 className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-400 w-28 shrink-0">บริษัท</span>
            <span className="text-sm text-white font-medium flex-1 text-right">{job.companyName}</span>
          </div>
        )}
        <InfoRow icon={User} label="ชื่อ" value={job.customer} />
        <InfoRow icon={Phone} label="เบอร์โทร" value={job.phone} />
        <InfoRow icon={MessageCircle} label="LINE" value={job.lineContact} />
        <InfoRow icon={User} label="ประเภทลูกค้า" value={isCompany ? 'บริษัท' : 'บุคคล'} />
        {addrStr && <InfoRow icon={MapPin} label="ที่อยู่" value={addrStr} />}
        {job.taxId && <InfoRow icon={FileText} label="เลขผู้เสียภาษี" value={job.taxId} />}
        {job.branch && (
          <InfoRow icon={Building2} label="สาขา" value={job.branch === 'headquarters' ? 'สำนักงานใหญ่' : 'สาขาอื่น'} />
        )}
      </div>
      <button
        onClick={onEdit}
        className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs text-blue-400 font-medium active:scale-95 transition-all"
      >
        <Pencil className="w-3.5 h-3.5" />
        แก้ไขข้อมูลลูกค้า
      </button>
    </SectionCard>
  );
}

function EditCustomerModal({
  job,
  onSave,
  onClose,
}: {
  job: Job;
  onSave: (data: {
    customer: string;
    phone: string;
    lineContact: string;
    customerType: 'person' | 'company';
    companyName: string;
    address: CustomerAddress;
    taxId: string;
    branch: BranchType | '';
  }) => void;
  onClose: () => void;
}) {
  const [customer, setCustomer] = useState(job.customer || '');
  const [phone, setPhone] = useState(job.phone || '');
  const [lineContact, setLineContact] = useState(job.lineContact || '');
  const [customerType, setCustomerType] = useState<'person' | 'company'>(job.customerType || 'person');
  const [companyName, setCompanyName] = useState(job.companyName || '');
  const [address, setAddress] = useState<CustomerAddress>(job.address || { ...EMPTY_ADDRESS });
  const [taxId, setTaxId] = useState(job.taxId || '');
  const [branch, setBranch] = useState<BranchType | ''>(job.branch || '');

  const fldClass = 'h-11 bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto overscroll-contain bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl p-5 pb-0 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-base">แก้ไขข้อมูลลูกค้า</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center active:scale-95">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">ประเภทลูกค้า</label>
            <div className="grid grid-cols-2 gap-2">
              {(['person', 'company'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setCustomerType(t)}
                  className={`h-10 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                    customerType === t ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                  {t === 'person' ? 'บุคคล' : 'บริษัท'}
                </button>
              ))}
            </div>
          </div>

          {customerType === 'company' && (
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">ชื่อบริษัท</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ชื่อบริษัท" className={fldClass} />
            </div>
          )}

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">ชื่อลูกค้า</label>
            <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="ชื่อ-นามสกุล" className={fldClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">เบอร์โทร</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08X-XXX-XXXX" className={fldClass} />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">LINE</label>
              <Input value={lineContact} onChange={(e) => setLineContact(e.target.value)} placeholder="LINE ID" className={fldClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">เลขประจำตัวผู้เสียภาษี</label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="เลข 13 หลัก" maxLength={13} className={`${fldClass} font-mono`} />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">สาขา</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => setBranch(branch === 'headquarters' ? '' : 'headquarters')}
                  className={`h-10 rounded-xl border text-[10px] font-medium transition-all active:scale-95 ${
                    branch === 'headquarters' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>สำนักงานใหญ่</button>
                <button type="button" onClick={() => setBranch(branch === 'branch' ? '' : 'branch')}
                  className={`h-10 rounded-xl border text-[10px] font-medium transition-all active:scale-95 ${
                    branch === 'branch' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>สาขาอื่น</button>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <label className="text-[10px] text-zinc-500 mb-1 block">{customerType === 'company' ? 'ที่อยู่บริษัท' : 'ที่อยู่'}</label>
            <div className="space-y-2">
              <Input value={address.addressLine} onChange={(e) => setAddress((a) => ({ ...a, addressLine: e.target.value }))} placeholder="บ้านเลขที่ / อาคาร / หมู่บ้าน" className={fldClass} />
              <div className="grid grid-cols-3 gap-2">
                <Input value={address.moo} onChange={(e) => setAddress((a) => ({ ...a, moo: e.target.value }))} placeholder="หมู่" className={fldClass} />
                <Input value={address.soi} onChange={(e) => setAddress((a) => ({ ...a, soi: e.target.value }))} placeholder="ซอย" className={fldClass} />
                <Input value={address.road} onChange={(e) => setAddress((a) => ({ ...a, road: e.target.value }))} placeholder="ถนน" className={fldClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={address.subDistrict} onChange={(e) => setAddress((a) => ({ ...a, subDistrict: e.target.value }))} placeholder="แขวง / ตำบล" className={fldClass} />
                <Input value={address.district} onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))} placeholder="เขต / อำเภอ" className={fldClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={address.province} onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))} placeholder="จังหวัด" className={fldClass} />
                <Input value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} placeholder="รหัสไปรษณีย์" maxLength={5} className={`${fldClass} font-mono`} />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 -mx-5 mt-4 flex gap-2 border-t border-zinc-800 bg-zinc-900/95 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
          <button
            onClick={() => onSave({ customer, phone, lineContact, customerType, companyName, address, taxId, branch })}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm active:scale-95 transition-all"
          >
            บันทึก
          </button>
          <button
            onClick={onClose}
            className="h-12 px-6 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium active:scale-95"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ job, onEditCustomer }: { job: Job; onEditCustomer: () => void }) {
  return (
    <div className="space-y-4">
      <CustomerInfoSection job={job} onEdit={onEditCustomer} />

      <SectionCard icon={FileText} title="อาการที่ลูกค้าแจ้ง">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {job.complaint || 'ไม่ระบุ'}
          </p>
        </div>
        {job.quickItems && job.quickItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {job.quickItems.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard icon={Car} title="ข้อมูลรถ">
        <InfoRow icon={Car} label="ทะเบียน" value={job.licensePlate} />
        <InfoRow icon={Car} label="จังหวัด" value={job.province} />
        <InfoRow icon={Car} label="VIN / เลขตัวถัง" value={job.vin} />
        <InfoRow icon={Car} label="รุ่นรถ" value={job.vehicleModel} />
        <InfoRow icon={Calendar} label="ปีรถ" value={job.modelYear} />
        <InfoRow icon={Wrench} label="เลขเครื่องยนต์" value={job.engineNumber} />
        <InfoRow icon={Car} label="สีรถ" value={job.color} />
        <InfoRow icon={Gauge} label="เลขไมล์" value={`${job.mileage} km`} />
      </SectionCard>

      <SectionCard icon={Fuel} title="สภาพรถ">
        <InfoRow icon={Fuel} label="ระดับน้ำมัน" value={job.fuelLevel} />
        <InfoRow icon={FileText} label="ของมีค่าในรถ" value={job.valuables} />
        <InfoRow icon={FileText} label="หมายเหตุสภาพรถ" value={job.conditionNote} />
      </SectionCard>

      {job.photos && Object.keys(job.photos).length > 0 && (
        <SectionCard icon={Camera} title="รูปตรวจรับรถ">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(job.photos).map(([key, src]) => (
              <div key={key} className="rounded-xl overflow-hidden border border-zinc-700 aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={key} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// --- Tab: ตรวจเช็ก ---

function InspectionTab({ job, router }: { job: Job; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="space-y-4">
      {/* Summary of existing inspections */}
      <div className="glass-card metallic-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30">
            <ListChecks className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">การตรวจวิเคราะห์</h3>
            <p className="text-[10px] text-zinc-500">ตรวจตามระบบ + Diagnostic / DTC</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          หน้าตรวจวิเคราะห์แยกตามระบบ พร้อม XENTRY Scan และ DTC
        </p>
        <Button
          onClick={() => router.push(`/job/${job.jobNumber}/inspection`)}
          className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <ListChecks className="w-5 h-5 mr-2" />
          เปิดหน้าตรวจวิเคราะห์
        </Button>
      </div>

      {/* Quick inspection items preview */}
      {sampleInspections.map((item) => {
        const resultInfo = INSPECTION_RESULTS[item.result];
        return (
          <div key={item.id} className="glass-card metallic-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">{item.category}</span>
                <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${resultInfo.bgColor} ${resultInfo.color}`}>
                  {resultInfo.label}
                </span>
              </div>
            </div>
            {item.note && (
              <p className="text-sm text-zinc-300 mb-2">{item.note}</p>
            )}
            {item.dtc && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-mono font-medium">DTC: {item.dtc}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Tab: ใบเสนอราคา ---

function QuotationTab() {
  const [items, setItems] = useState<QuotationItem[]>(sampleQuotationItems);
  const [status, setStatus] = useState<QuotationStatus>('draft');
  const [showAddPart, setShowAddPart] = useState(false);
  const [showAddLabor, setShowAddLabor] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('');

  const calc = useMemo(() => {
    let partsSub = 0;
    let laborSub = 0;
    let totalDiscount = 0;
    items.forEach((item) => {
      partsSub += item.partsPrice * item.quantity;
      laborSub += item.laborPrice * item.quantity;
      totalDiscount += item.discount;
    });
    const beforeVat = partsSub + laborSub - totalDiscount;
    const vat = Math.round(beforeVat * 0.07);
    const grandTotal = beforeVat + vat;
    return { partsSub, laborSub, totalDiscount, vat, grandTotal };
  }, [items]);

  const addItem = (type: 'part' | 'labor') => {
    const qty = parseInt(newQty) || 1;
    const price = parseFloat(newPrice) || 0;
    setItems((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        type,
        name: newName,
        partNumber: newPartNumber,
        quantity: qty,
        partsPrice: type === 'part' ? price : 0,
        laborPrice: type === 'labor' ? price : 0,
        discount: 0,
      },
    ]);
    setNewName('');
    setNewPartNumber('');
    setNewQty('1');
    setNewPrice('');
    setShowAddPart(false);
    setShowAddLabor(false);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const statusInfo = QUOTATION_STATUSES[status];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <Select value={status} onValueChange={(v) => setStatus(v as QuotationStatus)}>
          <SelectTrigger className="h-9 w-auto text-xs bg-zinc-900/80 border-zinc-700 text-white rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {(Object.keys(QUOTATION_STATUSES) as QuotationStatus[]).map((s) => (
              <SelectItem key={s} value={s} className="text-white">
                {QUOTATION_STATUSES[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.map((item) => (
        <div key={item.id} className="glass-card metallic-border rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.type === 'part' ? 'bg-violet-500/15 text-violet-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
                {item.type === 'part' ? 'อะไหล่' : 'ค่าแรง'}
              </span>
              <span className="text-white font-medium text-sm">{item.name}</span>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-zinc-500 hover:text-red-400 active:scale-90 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {item.partNumber && (
            <p className="text-xs text-zinc-500 font-mono mb-2">P/N: {item.partNumber}</p>
          )}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-zinc-500">จำนวน</span>
              <p className="text-white font-medium">{item.quantity}</p>
            </div>
            <div>
              <span className="text-zinc-500">ราคา</span>
              <p className="text-white font-medium">{formatCurrency(item.type === 'part' ? item.partsPrice : item.laborPrice)}</p>
            </div>
            <div>
              <span className="text-zinc-500">ส่วนลด</span>
              <p className="text-white font-medium">{item.discount > 0 ? `-${formatCurrency(item.discount)}` : '-'}</p>
            </div>
            <div>
              <span className="text-zinc-500">รวม</span>
              <p className="text-blue-400 font-bold">
                {formatCurrency((item.type === 'part' ? item.partsPrice : item.laborPrice) * item.quantity - item.discount)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {(showAddPart || showAddLabor) && (
        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h4 className="text-sm text-white font-semibold">
            {showAddPart ? 'เพิ่มอะไหล่' : 'เพิ่มค่าแรง'}
          </h4>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">รายการ</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={showAddPart ? 'ชื่ออะไหล่' : 'รายการค่าแรง'}
              className={inputClass}
            />
          </div>
          {showAddPart && (
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Part Number</Label>
              <Input
                value={newPartNumber}
                onChange={(e) => setNewPartNumber(e.target.value)}
                placeholder="A0000000000"
                className={`${inputClass} font-mono`}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">จำนวน</Label>
              <Input
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">ราคา (บาท)</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => addItem(showAddPart ? 'part' : 'labor')}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium active:scale-95"
            >
              เพิ่ม
            </Button>
            <Button
              onClick={() => { setShowAddPart(false); setShowAddLabor(false); }}
              variant="outline"
              className="h-11 px-4 rounded-xl bg-zinc-900/80 border-zinc-700 text-zinc-300 active:scale-95"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => { setShowAddPart(true); setShowAddLabor(false); }}
          variant="outline"
          className="flex-1 h-12 rounded-xl bg-zinc-900/80 border-zinc-700 text-violet-400 font-medium active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มอะไหล่
        </Button>
        <Button
          onClick={() => { setShowAddLabor(true); setShowAddPart(false); }}
          variant="outline"
          className="flex-1 h-12 rounded-xl bg-zinc-900/80 border-zinc-700 text-cyan-400 font-medium active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มค่าแรง
        </Button>
      </div>

      {/* Summary */}
      <div className="glass-card metallic-border rounded-2xl p-5 space-y-2.5">
        <h3 className="text-white font-semibold text-sm mb-2">สรุปใบเสนอราคา</h3>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">รวมค่าอะไหล่</span>
          <span className="text-white font-medium">{formatCurrency(calc.partsSub)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">รวมค่าแรง</span>
          <span className="text-white font-medium">{formatCurrency(calc.laborSub)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">ส่วนลด</span>
          <span className="text-amber-400 font-medium">-{formatCurrency(calc.totalDiscount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">VAT 7%</span>
          <span className="text-white font-medium">{formatCurrency(calc.vat)}</span>
        </div>
        <div className="border-t border-zinc-800 pt-2.5 flex justify-between">
          <span className="text-white font-semibold">รวมทั้งสิ้น</span>
          <span className="text-blue-400 font-bold text-lg">{formatCurrency(calc.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

// --- Tab: งานซ่อม ---

function RepairTab() {
  const [tasks, setTasks] = useState<RepairTask[]>(sampleRepairTasks);
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newTech, setNewTech] = useState('');

  const addTask = () => {
    if (!newDesc.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        description: newDesc,
        technician: newTech || 'รอมอบหมาย',
        startTime: '',
        finishTime: '',
        status: 'pending',
        notes: '',
        beforePhotos: [],
        afterPhotos: [],
      },
    ]);
    setNewDesc('');
    setNewTech('');
    setShowAdd(false);
  };

  const cycleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: Record<RepairStatus, RepairStatus> = {
          pending: 'in_progress',
          in_progress: 'done',
          done: 'pending',
        };
        const newStatus = next[t.status];
        return {
          ...t,
          status: newStatus,
          startTime: newStatus === 'in_progress' && !t.startTime
            ? new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : t.startTime,
          finishTime: newStatus === 'done' && !t.finishTime
            ? new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : t.finishTime,
        };
      })
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">งานซ่อม ({tasks.length})</p>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มงานซ่อม
        </Button>
      </div>

      {showAdd && (
        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">รายละเอียดงานซ่อม</Label>
            <Textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="ระบุงานซ่อม..."
              className={textareaClass}
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">ช่างผู้รับผิดชอบ</Label>
            <Input
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="ชื่อช่าง"
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addTask}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium active:scale-95"
            >
              เพิ่ม
            </Button>
            <Button
              onClick={() => setShowAdd(false)}
              variant="outline"
              className="h-11 px-4 rounded-xl bg-zinc-900/80 border-zinc-700 text-zinc-300 active:scale-95"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {tasks.map((task) => {
        const info = REPAIR_STATUS_INFO[task.status];
        return (
          <div key={task.id} className="glass-card metallic-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-white font-medium text-sm flex-1">{task.description}</p>
              <button
                onClick={() => removeTask(task.id)}
                className="text-zinc-500 hover:text-red-400 active:scale-90 transition-colors ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">{task.technician}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">
                  {task.startTime || 'ยังไม่เริ่ม'} - {task.finishTime || '...'}
                </span>
              </div>
            </div>
            {task.notes && (
              <p className="text-xs text-zinc-300 bg-zinc-900/50 rounded-lg p-2 mb-3 border border-zinc-800">
                {task.notes}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cycleStatus(task.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${info.bgColor} ${info.color} active:scale-95 transition-transform`}
              >
                {info.label}
              </button>
              <div className="flex gap-2 ml-auto">
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-400 active:scale-95">
                  <Camera className="w-3.5 h-3.5" /> ก่อน
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-400 active:scale-95">
                  <Camera className="w-3.5 h-3.5" /> หลัง
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Tab: อะไหล่ ---

function PartsTab({ job }: { job: Job }) {
  const router = useRouter();
  const [parts, setParts] = useState<PartItem[]>(sampleParts);
  const [showAdd, setShowAdd] = useState(false);
  const [newPn, setNewPn] = useState('');
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('');
  const [newAvail, setNewAvail] = useState<PartAvailability>('ordered');
  const { requisitions } = useRequisitionsForJob(job?.jobNumber || null);

  const addPart = () => {
    if (!newName.trim()) return;
    setParts((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        partNumber: newPn,
        name: newName,
        quantity: parseInt(newQty) || 1,
        price: parseFloat(newPrice) || 0,
        availability: newAvail,
      },
    ]);
    setNewPn('');
    setNewName('');
    setNewQty('1');
    setNewPrice('');
    setNewAvail('ordered');
    setShowAdd(false);
  };

  const cycleAvail = (id: string) => {
    setParts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next: Record<PartAvailability, PartAvailability> = {
          ordered: 'received',
          received: 'picked',
          picked: 'ordered',
        };
        return { ...p, availability: next[p.availability] };
      })
    );
  };

  const removePart = (id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">อะไหล่ ({parts.length})</p>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มอะไหล่
        </Button>
      </div>

      {showAdd && (
        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">Part Number</Label>
              <Input
                value={newPn}
                onChange={(e) => setNewPn(e.target.value)}
                placeholder="A0000000000"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">ชื่ออะไหล่</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ชื่ออะไหล่"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">จำนวน</Label>
              <Input
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">ราคา</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400 mb-1.5 block">สถานะ</Label>
              <Select value={newAvail} onValueChange={(v) => setNewAvail(v as PartAvailability)}>
                <SelectTrigger className={`${inputClass} bg-zinc-900/80`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {(Object.keys(PART_AVAILABILITY) as PartAvailability[]).map((a) => (
                    <SelectItem key={a} value={a} className="text-white">
                      {PART_AVAILABILITY[a].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addPart}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium active:scale-95"
            >
              เพิ่ม
            </Button>
            <Button
              onClick={() => setShowAdd(false)}
              variant="outline"
              className="h-11 px-4 rounded-xl bg-zinc-900/80 border-zinc-700 text-zinc-300 active:scale-95"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {parts.map((part) => {
        const availInfo = PART_AVAILABILITY[part.availability];
        return (
          <div key={part.id} className="glass-card metallic-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{part.name}</p>
                {part.partNumber && (
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">P/N: {part.partNumber}</p>
                )}
              </div>
              <button
                onClick={() => removePart(part.id)}
                className="text-zinc-500 hover:text-red-400 active:scale-90 transition-colors ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">x{part.quantity}</span>
                <span className="text-sm text-white font-medium">{formatCurrency(part.price)}</span>
              </div>
              <button
                onClick={() => cycleAvail(part.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${availInfo.bgColor} ${availInfo.color} active:scale-95 transition-transform`}
              >
                {availInfo.label}
              </button>
            </div>
          </div>
        );
      })}

      {/* Requisitions section */}
      <div className="pt-2 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-zinc-400">ใบเบิกอะไหล่ ({requisitions.length})</p>
          <button
            onClick={() => router.push(`/parts/new?job=${job.jobNumber}`)}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: '#0A84FF' }}
          >
            <Plus className="w-3.5 h-3.5" /> สร้างใบเบิก
          </button>
        </div>
        {requisitions.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">ยังไม่มีใบเบิกอะไหล่สำหรับ JOB นี้</p>
        ) : (
          requisitions.map(r => {
            const rsi = REQUISITION_STATUSES[r.status];
            return (
              <button
                key={r.id}
                onClick={() => router.push(`/parts/${r.id}`)}
                className="w-full text-left glass-card metallic-border rounded-xl p-3 mb-2 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-sm font-medium" style={{ color: '#0A84FF' }}>{r.requisitionNumber}</span>
                    <span className="text-xs ml-2" style={{ color: '#9CA7B2' }}>{r.items.length} รายการ</span>
                  </div>
                  <Badge variant="outline" className={`${rsi.bgColor} ${rsi.color} border text-[10px] px-2 py-0.5 font-medium`}>
                    {rsi.label}
                  </Badge>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// --- Tab: เบิกอะไหล่ ---

const PART_UNITS = ['ชิ้น', 'ตัว', 'อัน', 'ลิตร', 'ชุด', 'คู่', 'กล่อง', 'ม้วน', 'แกลลอน', 'กิโลกรัม'];

const ACTION_BUTTON_COLORS: Partial<Record<RequisitionStatus, string>> = {
  PENDING_APPROVAL: '#f59e0b',
  APPROVED:         '#0A84FF',
  WAITING_ISSUE:    '#06b6d4',
  ISSUED:           '#22c55e',
  RECEIVED:         '#10b981',
  REJECTED:         '#ef4444',
  OUT_OF_STOCK:     '#f97316',
  CANCELLED:        '#6b7280',
  DRAFT:            '#71717a',
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

function RequisitionTab({ job }: { job: Job }) {
  const { requisitions, refresh: reload } = useRequisitionsForJob(job.jobNumber);
  const { create } = useCreateRequisition();
  const { updateStatus } = useUpdateRequisitionStatus();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lines, setLines] = useState<LineInput[]>([emptyLine(1)]);
  const [nextKey, setNextKey] = useState(2);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const user = getCurrentUser();

  const counts = useMemo(() => {
    const total = requisitions.length;
    const pending = requisitions.filter(r => r.status === 'PENDING_APPROVAL').length;
    const waiting = requisitions.filter(r => r.status === 'WAITING_ISSUE' || r.status === 'APPROVED').length;
    const issued = requisitions.filter(r => r.status === 'ISSUED' || r.status === 'RECEIVED').length;
    return { total, pending, waiting, issued };
  }, [requisitions]);

  // --- Create form helpers ---
  const addLine = () => { setLines(prev => [...prev, emptyLine(nextKey)]); setNextKey(k => k + 1); };
  const removeLine = (key: number) => { setLines(prev => prev.length > 1 ? prev.filter(l => l.key !== key) : prev); };
  const updateLine = (key: number, field: keyof LineInput, value: string) => {
    setLines(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l));
  };
  const handlePhotoCapture = (key: number) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
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

  const canSubmit = lines.some(l => l.partName.trim());

  const handleSubmit = async (asDraft: boolean) => {
    if (!canSubmit) return;
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
    const req = await create(generateRequisitionNumber(), job.jobNumber, job.vehicleModel, job.licensePlate, items);
    if (!req) return;
    if (!asDraft) await updateStatus(req.id, 'PENDING_APPROVAL', 'ส่งคำขอเบิก');
    setLines([emptyLine(1)]); setNextKey(2); setShowCreate(false);
    await reload();
  };

  const handleAction = async (reqId: string, newStatus: RequisitionStatus) => {
    const note = actionNotes[reqId] || '';
    await updateStatus(reqId, newStatus, note.trim());
    setActionNotes(prev => ({ ...prev, [reqId]: '' }));
    await reload();
  };

  const role = user?.role ?? 'technician';

  return (
    <div className="space-y-4">
      {/* Summary counters */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'ทั้งหมด', value: counts.total, color: '#F5F7FA' },
          { label: 'รออนุมัติ', value: counts.pending, color: '#f59e0b' },
          { label: 'รอจ่าย', value: counts.waiting, color: '#06b6d4' },
          { label: 'จ่าย/รับแล้ว', value: counts.issued, color: '#22c55e' },
        ].map(c => (
          <div key={c.label} className="glass-card metallic-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Create button */}
      <Button
        onClick={() => setShowCreate(!showCreate)}
        className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold active:scale-95"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        ขอเบิกอะไหล่
      </Button>

      {/* Create form */}
      {showCreate && (
        <div className="glass-card metallic-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">รายการอะไหล่</h4>
            <button onClick={addLine} className="flex items-center gap-1 text-xs font-medium text-blue-400">
              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
            </button>
          </div>

          {lines.map((line, idx) => (
            <div key={line.key} className="p-3 rounded-xl space-y-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">#{idx + 1}</span>
                {lines.length > 1 && (
                  <button onClick={() => removeLine(line.key)} className="p-0.5"><Trash2 className="w-3.5 h-3.5 text-red-400/60" /></button>
                )}
              </div>
              <div>
                <Label className="text-[11px] text-zinc-500 mb-1 block">ชื่ออะไหล่ *</Label>
                <Input value={line.partName} onChange={e => updateLine(line.key, 'partName', e.target.value)} placeholder="หัวเทียน, ผ้าเบรก..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-zinc-500 mb-1 block">Part Number</Label>
                  <Input value={line.partNumber} onChange={e => updateLine(line.key, 'partNumber', e.target.value)} placeholder="A004159..." className={`${inputClass} font-mono`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-zinc-500 mb-1 block">จำนวน</Label>
                    <Input type="number" min="1" value={line.quantity} onChange={e => updateLine(line.key, 'quantity', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <Label className="text-[11px] text-zinc-500 mb-1 block">หน่วย</Label>
                    <Select value={line.unit} onValueChange={v => updateLine(line.key, 'unit', v)}>
                      <SelectTrigger className={`${inputClass} bg-zinc-900/80`}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {PART_UNITS.map(u => <SelectItem key={u} value={u} className="text-white">{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-[11px] text-zinc-500 mb-1 block">หมายเหตุ</Label>
                <Input value={line.note} onChange={e => updateLine(line.key, 'note', e.target.value)} placeholder="รายละเอียดเพิ่มเติม..." className={inputClass} />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handlePhotoCapture(line.key)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-800/60 border border-zinc-700 text-zinc-400">
                  <Camera className="w-3.5 h-3.5" /> ถ่ายรูปอะไหล่
                </button>
                {line.partPhoto && (
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.partPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <Button onClick={() => void handleSubmit(true)} disabled={!canSubmit} variant="outline" className="flex-1 h-11 rounded-xl bg-zinc-900/80 border-zinc-700 text-zinc-300 active:scale-95 disabled:opacity-40">
              บันทึกร่าง
            </Button>
            <Button onClick={() => void handleSubmit(false)} disabled={!canSubmit} className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium active:scale-95 disabled:opacity-40">
              <Send className="w-4 h-4 mr-1.5" /> ส่งขออนุมัติ
            </Button>
          </div>
          <button onClick={() => setShowCreate(false)} className="w-full text-center text-xs text-zinc-500 py-1">ยกเลิก</button>
        </div>
      )}

      {/* Requisition list */}
      {requisitions.length === 0 && !showCreate && (
        <div className="glass-card metallic-border rounded-2xl p-8 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
          <p className="text-sm text-zinc-500">ยังไม่มีใบเบิกอะไหล่สำหรับ JOB นี้</p>
          <p className="text-xs text-zinc-600 mt-1">กด &quot;ขอเบิกอะไหล่&quot; เพื่อสร้างใบเบิกใหม่</p>
        </div>
      )}

      {requisitions.map(req => {
        const si = REQUISITION_STATUSES[req.status];
        const expanded = expandedId === req.id;
        const allowed = getAllowedTransitions(req.status, role);
        const date = new Date(req.createdAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

        return (
          <div key={req.id} className="glass-card metallic-border rounded-2xl overflow-hidden">
            {/* Header */}
            <button onClick={() => setExpandedId(expanded ? null : req.id)} className="w-full text-left p-4">
              <div className="flex items-start justify-between mb-1.5">
                <div className="min-w-0">
                  <span className="text-sm font-bold text-blue-400">{req.requisitionNumber}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-zinc-500">{req.items.length} รายการ</span>
                    <span className="text-[11px] text-zinc-600">{date}</span>
                    <span className="text-[11px] text-zinc-500">โดย {req.requestedByName || 'ไม่ระบุ'}</span>
                  </div>
                </div>
                <Badge variant="outline" className={`${si.bgColor} ${si.color} border gap-1 px-2 py-0.5 text-[10px] font-semibold shrink-0`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${si.dotColor}`} />
                  {si.label}
                </Badge>
              </div>
              {/* Compact item list */}
              {!expanded && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {req.items.slice(0, 4).map(it => (
                    <span key={it.id} className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 truncate max-w-[140px]">
                      {it.partName} x{it.quantity}
                    </span>
                  ))}
                  {req.items.length > 4 && <span className="text-[10px] text-zinc-600 self-center">+{req.items.length - 4} อื่นๆ</span>}
                </div>
              )}
            </button>

            {/* Expanded details */}
            {expanded && (
              <div className="px-4 pb-4 space-y-3">
                {/* Items */}
                {req.items.map(item => (
                  <div key={item.id} className="flex gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {item.partPhoto ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-700 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.partPhoto} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-zinc-700/50 shrink-0 flex items-center justify-center bg-zinc-900/50">
                        <Package className="w-4 h-4 text-zinc-700" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{item.partName}</p>
                      {item.partNumber && <p className="text-[11px] text-zinc-500 font-mono">{item.partNumber}</p>}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-blue-400">x{item.quantity} {item.unit || 'ชิ้น'}</span>
                        {item.note && <span className="text-[11px] text-zinc-500 truncate">{item.note}</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Actions */}
                {allowed.length > 0 && (
                  <div className="pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Input
                      value={actionNotes[req.id] || ''}
                      onChange={e => setActionNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                      placeholder="หมายเหตุ (ถ้ามี)"
                      className={`${inputClass} h-9 text-xs`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {allowed.map(status => {
                        const sInfo = REQUISITION_STATUSES[status];
                        const bgColor = ACTION_BUTTON_COLORS[status] ?? '#0A84FF';
                        return (
                          <button
                            key={status}
                            onClick={() => void handleAction(req.id, status)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-white active:scale-95 transition-transform"
                            style={{ background: bgColor }}
                          >
                            {sInfo.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status history */}
                {req.statusHistory.length > 0 && (
                  <div className="pt-2 space-y-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[11px] text-zinc-600 font-medium mb-1">ประวัติสถานะ</p>
                    {req.statusHistory.map((h, i) => {
                      const toInfo = REQUISITION_STATUSES[h.to];
                      const time = new Date(h.changedAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${toInfo.dotColor}`} />
                          <div>
                            <span className="text-[11px] text-zinc-400">{toInfo.label}</span>
                            <span className="text-[11px] text-zinc-600 ml-1.5">{h.changedByName} - {time}</span>
                            {h.note && <span className="text-[11px] text-zinc-600 ml-1"> ({h.note})</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GalleryTab() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [activeCategory, setActiveCategory] = useState('intake');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos((prev) => [
        ...prev,
        {
          id: `g-${Date.now()}`,
          category: activeCategory,
          src: reader.result as string,
          timestamp: new Date().toLocaleString('th-TH', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const filteredPhotos = photos.filter((p) => p.category === activeCategory);
  const categoryLabel = PHOTO_CATEGORIES.find((c) => c.key === activeCategory)?.label || '';

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {PHOTO_CATEGORIES.map((cat) => {
          const selected = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                selected
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                  : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => fileRef.current?.click()}
        className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/20 active:scale-95"
      >
        <Camera className="w-5 h-5 mr-2" />
        ถ่ายรูป / เพิ่มรูป - {categoryLabel}
      </Button>

      {filteredPhotos.length === 0 ? (
        <div className="glass-card metallic-border rounded-2xl p-8 text-center">
          <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">ยังไม่มีรูปในหมวด {categoryLabel}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="rounded-xl overflow-hidden border border-zinc-700 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.category} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-[10px] text-white">{photo.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Tab: QC ---

function QCTab() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [qcTech, setQcTech] = useState('');
  const [roadTestMileage, setRoadTestMileage] = useState('');
  const [qcNotes, setQcNotes] = useState('');
  const [passed, setPassed] = useState(false);

  const allChecked = QC_CHECKLIST.every((item) => checklist[item.key]);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePass = () => {
    if (!allChecked) return;
    setPassed(true);
  };

  return (
    <div className="space-y-4">
      {passed && (
        <div className="glass-card rounded-2xl p-4 border border-green-500/30 bg-green-500/5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-green-400 font-semibold text-sm">ผ่าน QC แล้ว</p>
            <p className="text-xs text-zinc-400">{new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      )}

      <SectionCard icon={ShieldCheck} title="QC Checklist">
        <div className="space-y-2">
          {QC_CHECKLIST.map((item) => {
            const checked = checklist[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 active:scale-[0.98] transition-transform"
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-lg border shrink-0 ${
                    checked
                      ? 'bg-green-500/20 border-green-500/40'
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                >
                  {checked && <Check className="w-4 h-4 text-green-400" />}
                </div>
                <span className={`text-sm ${checked ? 'text-white' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard icon={User} title="ข้อมูล QC">
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">QC Technician</Label>
            <Input
              value={qcTech}
              onChange={(e) => setQcTech(e.target.value)}
              placeholder="ชื่อช่าง QC"
              className={inputClass}
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">Road Test Mileage (km)</Label>
            <Input
              type="number"
              value={roadTestMileage}
              onChange={(e) => setRoadTestMileage(e.target.value)}
              placeholder="เช่น 15"
              className={inputClass}
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">QC Notes</Label>
            <Textarea
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder="หมายเหตุ QC..."
              className={textareaClass}
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400 mb-1.5 block">วันที่และเวลา QC</Label>
            <div className="h-12 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center px-4">
              <span className="text-sm text-zinc-300">{new Date().toLocaleString('th-TH')}</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <Button
        onClick={handlePass}
        disabled={!allChecked || passed}
        className={`w-full h-14 rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-all ${
          passed
            ? 'bg-green-600/30 text-green-400 cursor-default'
            : allChecked
              ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-500/20'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
        }`}
      >
        <ShieldCheck className="w-5 h-5 mr-2" />
        {passed ? 'ผ่าน QC แล้ว' : 'ผ่าน QC'}
      </Button>
      {!allChecked && !passed && (
        <p className="text-xs text-zinc-500 text-center">ต้องตรวจสอบครบทุกรายการก่อน</p>
      )}
    </div>
  );
}

// --- Tab: ประวัติ ---

function HistoryTab() {
  return (
    <div className="space-y-4">
      <SectionCard icon={History} title="Job Timeline">
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-zinc-800" />
          <div className="space-y-4">
            {sampleTimeline.map((event, idx) => (
              <div key={event.id} className="relative">
                {/* Dot */}
                <div
                  className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                    idx === sampleTimeline.length - 1 ? 'bg-blue-500' : 'bg-zinc-600'
                  }`}
                />
                <div className="ml-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-blue-400 font-mono text-xs font-medium">{event.time}</span>
                    <span className="text-white font-medium text-sm">{event.label}</span>
                  </div>
                  {event.detail && (
                    <p className="text-xs text-zinc-400">{event.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// --- Main Page ---

const TABS = [
  { id: 'overview', label: 'ภาพรวม', icon: FileText },
  { id: 'inspection', label: 'ตรวจเช็ก', icon: ListChecks },
  { id: 'quotation', label: 'ใบเสนอราคา', icon: Receipt },
  { id: 'repair', label: 'งานซ่อม', icon: Wrench },
  { id: 'parts', label: 'อะไหล่', icon: Package },
  { id: 'requisition', label: 'เบิกอะไหล่', icon: ClipboardList },
  { id: 'gallery', label: 'รูปภาพ', icon: Camera },
  { id: 'qc', label: 'QC', icon: ShieldCheck },
  { id: 'history', label: 'ประวัติ', icon: History },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobNumber = params.job as string;

  const { job: dbJob, loading, update: updateJob } = useJob(jobNumber);

  const [job, setJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [editingCustomer, setEditingCustomer] = useState(false);

  const handleSaveCustomer = async (data: {
    customer: string;
    phone: string;
    lineContact: string;
    customerType: 'person' | 'company';
    companyName: string;
    address: CustomerAddress;
    taxId: string;
    branch: BranchType | '';
  }) => {
    const updates: Partial<Job> = {
      customer: data.customer,
      phone: data.phone,
      lineContact: data.lineContact,
      customerType: data.customerType,
      companyName: data.customerType === 'company' ? data.companyName : undefined,
      address: data.address,
      taxId: data.taxId || undefined,
      branch: data.branch || undefined,
    };
    const saved = await updateJob(updates);
    if (saved) setJob(saved);
    setEditingCustomer(false);
  };

  useEffect(() => {
    setJob(dbJob);
  }, [dbJob]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-zinc-500 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-zinc-400 text-sm">ไม่พบงานที่ค้นหา</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const statusInfo = JOB_STATUSES[job.status];
  const currentStepIndex = WORKFLOW_STEPS.indexOf(job.status);

  const changeStatus = (newStatus: JobStatus) => {
    void (async () => {
      const saved = await updateJob({ status: newStatus });
      if (saved) setJob(saved);
    })();
  };

  return (
    <AuthGuard permission="job_detail">
    <AppLayout showHeader={false} showBottomNav={false}>
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-blue-400 leading-tight truncate">
                {job.jobNumber}
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium tracking-widest leading-tight">
                JOB DETAIL
              </p>
            </div>
            <Badge
              variant="outline"
              className={`${statusInfo.bgColor} ${statusInfo.color} border gap-1.5 px-2.5 py-1 text-xs font-semibold`}
            >
              <span className={`status-dot ${statusInfo.dotColor}`} />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* Top Section: Vehicle Summary */}
        <div className="glass-card metallic-border rounded-2xl overflow-hidden stat-glow">
          {/* Vehicle photo area */}
          <div className="h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative">
            {job.photos && job.photos.front ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={job.photos.front} alt="รถ" className="w-full h-full object-cover" />
            ) : (
              <Car className="w-16 h-16 text-zinc-700" />
            )}
            <div className="absolute top-3 left-3">
              <span className="text-blue-400 font-bold text-sm tracking-wide bg-black/40 backdrop-blur px-2.5 py-1 rounded-lg">
                {job.jobNumber}
              </span>
            </div>
          </div>

          {/* Vehicle info */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-xl">{job.vehicleModel}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center justify-center bg-zinc-800 text-zinc-200 font-mono font-semibold text-sm px-2.5 py-1 rounded-md border border-zinc-700">
                    {job.licensePlate}
                  </span>
                  {job.color && (
                    <span className="text-xs text-zinc-400">{job.color}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">ลูกค้า</span>
                <span className="text-xs text-white font-medium truncate">{job.customer}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-white font-medium">{job.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">VIN</span>
                <span className="text-xs text-white font-mono truncate">{job.vin || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-white font-medium">{job.mileage} km</span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">SA</span>
                <span className="text-xs text-white font-medium truncate">{job.serviceAdvisor || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">หัวหน้าช่าง</span>
                <span className="text-xs text-white font-medium truncate">{job.workshopSupervisor || job.technician}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">รับรถ</span>
                <span className="text-xs text-white font-medium">{job.receivedDateTime || `${job.receivedTime} น.`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Status Workflow */}
        <div className="glass-card metallic-border rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">สถานะงาน</h3>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {WORKFLOW_STEPS.map((step, idx) => {
              const info = JOB_STATUSES[step];
              const isCurrent = job.status === step;
              const isPassed = idx < currentStepIndex;
              return (
                <button
                  key={step}
                  onClick={() => changeStatus(step)}
                  className="flex flex-col items-center gap-1.5 min-w-[68px] active:scale-95 transition-transform"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                      isCurrent
                        ? `${info.bgColor} ${info.color} border-current`
                        : isPassed
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-600'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium whitespace-nowrap ${
                      isCurrent ? info.color : isPassed ? 'text-blue-400' : 'text-zinc-600'
                    }`}
                  >
                    {info.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 text-center">แตะเพื่อเปลี่ยนสถานะ (ทดสอบระบบ)</p>
        </div>

        {/* Tabs */}
        <div>
          {/* Tab bar */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border whitespace-nowrap transition-all active:scale-95 ${
                    selected
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="pt-2">
            {activeTab === 'overview' && <OverviewTab job={job} onEditCustomer={() => setEditingCustomer(true)} />}
            {activeTab === 'inspection' && <InspectionTab job={job} router={router} />}
            {activeTab === 'quotation' && <QuotationTab />}
            {activeTab === 'repair' && <RepairTab />}
            {activeTab === 'parts' && <PartsTab job={job} />}
            {activeTab === 'requisition' && <RequisitionTab job={job} />}
            {activeTab === 'gallery' && <GalleryTab />}
            {activeTab === 'qc' && <QCTab />}
            {activeTab === 'history' && <HistoryTab />}
          </div>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 nav-blur border-t border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            onClick={() => router.push('/')}
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>

      {editingCustomer && job && (
        <EditCustomerModal
          job={job}
          onSave={handleSaveCustomer}
          onClose={() => setEditingCustomer(false)}
        />
      )}
    </div>
    </AppLayout>
    </AuthGuard>
  );
}
