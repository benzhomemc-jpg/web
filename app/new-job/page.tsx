'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  ScanLine,
  Camera,
  X,
  Check,
  Save,
  FileText,
  User,
  Car,
  Fuel,
  ClipboardCheck,
  Plus,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Play,
  Trash2,
  Undo2,
  RefreshCw,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  QUICK_ITEMS,
  PHOTO_SLOTS,
  FUEL_LEVELS,
  PROVINCES,
  generateJobNumber,
  type Job,
  type MediaItem,
  type CustomerAddress,
  type BranchType,
  EMPTY_ADDRESS,
} from '@/lib/jobs';
import AuthGuard from '@/components/auth-guard';
import AppLayout from '@/components/layout/AppLayout';
import { fetchCustomers, fetchVehicles, insertCustomer, insertVehicle, insertJob } from '@/lib/models/queries';
import type { Customer, Vehicle } from '@/lib/models/types';

function SectionHeader({
  icon: Icon,
  title,
  number,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  number: number;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 shrink-0">
        <Icon className="w-4.5 h-4.5 text-blue-400" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-blue-400 font-bold text-sm">{number}.</span>
        <h2 className="text-white font-semibold text-base">{title}</h2>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label className="text-xs text-zinc-400 font-medium mb-1.5 block">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </Label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-400 mt-1 flex items-center gap-1">{children}</p>;
}

const inputClass =
  'h-12 bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm';
const textareaClass =
  'min-h-[120px] bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm resize-none';

const STAFF_LIST = [
  'คุณเอ',
  'คุณบี',
  'หัวหน้าช่างวิชัย',
  'ช่างประเสริฐ',
  'ช่างอนุชา',
];

function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef<ImageData[]>([]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (e.currentTarget.width / rect.width),
      y: (e.clientY - rect.top) * (e.currentTarget.height / rect.height),
    };
  };

  const saveSnapshot = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    strokes.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPoint.current = getPoint(e);
    saveSnapshot();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPoint.current = pt;
  };

  const onPointerUp = () => {
    isDrawing.current = false;
    lastPoint.current = null;
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.current = [];
    onChange('');
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (strokes.current.length > 0) {
      const prev = strokes.current.pop()!;
      ctx.putImageData(prev, 0, 0);
      onChange(canvas.toDataURL('image/png'));
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange('');
    }
  };

  useEffect(() => {
    if (value || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [value]);

  const hasSignature = value.length > 0;

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border border-zinc-700 bg-zinc-950/80 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-40 touch-none cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-zinc-600">เซ็นด้วยนิ้ว</span>
          </div>
        )}
        <div className="absolute bottom-2 left-3 right-3 border-b border-dashed border-zinc-700 pointer-events-none" />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasSignature}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs text-red-400 active:scale-95 transition-all disabled:opacity-30"
        >
          <Trash2 className="w-3.5 h-3.5" />
          ล้างลายเซ็น
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasSignature}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-xs text-zinc-400 active:scale-95 transition-all disabled:opacity-30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          เซ็นใหม่
        </button>
      </div>
    </div>
  );
}

interface SlotMedia {
  id: string;
  mediaType: 'photo' | 'video';
  localUrl: string;
  fileName: string;
}

function MediaSlot({
  slot,
  items,
  onAdd,
  onRemove,
}: {
  slot: { key: string; label: string };
  items: SlotMedia[];
  onAdd: (key: string, files: FileList, mediaType: 'photo' | 'video') => void;
  onRemove: (key: string, id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const galleryPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);
  const galleryVideoRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null, mediaType: 'photo' | 'video') => {
    if (!files || files.length === 0) return;
    onAdd(slot.key, files, mediaType);
    setShowMenu(false);
  };

  return (
    <div>
      {/* Hidden inputs */}
      <input
        ref={cameraPhotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'photo')}
      />
      <input
        ref={galleryPhotoRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'photo')}
      />
      <input
        ref={cameraVideoRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'video')}
      />
      <input
        ref={galleryVideoRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'video')}
      />

      {/* Thumbnails */}
      {items.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((item) => (
              <div key={item.id} className="relative rounded-xl overflow-hidden border border-zinc-700 aspect-[4/3] group">
                {item.mediaType === 'photo' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.localUrl} alt={slot.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center relative">
                    <video src={item.localUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(slot.key, item.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center active:scale-90 z-10"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/60 px-1.5 py-0.5 rounded font-medium">
                  {item.mediaType === 'video' ? 'VDO' : 'IMG'}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="w-full h-10 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-400">เพิ่มอีก</span>
          </button>
          <span className="text-[10px] text-zinc-500 block text-center">{slot.label}</span>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="w-full aspect-[4/3] rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6 text-zinc-500" />
            <span className="text-xs text-zinc-400 font-medium">{slot.label}</span>
          </button>
        </div>
      )}

      {/* Action menu */}
      {showMenu && (
        <div className="mt-2 rounded-xl border border-zinc-700 bg-zinc-900/95 overflow-hidden divide-y divide-zinc-800">
          <button
            type="button"
            onClick={() => { cameraPhotoRef.current?.click(); }}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-zinc-800 transition-colors"
          >
            <Camera className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white">ถ่ายรูป</span>
          </button>
          <button
            type="button"
            onClick={() => { galleryPhotoRef.current?.click(); }}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-zinc-800 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white">เลือกรูปจากอัลบั้ม</span>
          </button>
          <button
            type="button"
            onClick={() => { cameraVideoRef.current?.click(); }}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-zinc-800 transition-colors"
          >
            <Video className="w-4 h-4 text-red-400" />
            <span className="text-sm text-white">ถ่ายวิดีโอ</span>
          </button>
          <button
            type="button"
            onClick={() => { galleryVideoRef.current?.click(); }}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-zinc-800 transition-colors"
          >
            <Video className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white">เลือกวิดีโอจากอัลบั้ม</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMenu(false)}
            className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-zinc-400 active:bg-zinc-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-xs">ปิด</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function NewJobPage() {
  const router = useRouter();

  // Section 1: Customer
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineContact, setLineContact] = useState('');
  const [customerType, setCustomerType] = useState<'person' | 'company'>('person');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState<CustomerAddress>({ ...EMPTY_ADDRESS });
  const [taxId, setTaxId] = useState('');
  const [branch, setBranch] = useState<BranchType | ''>('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // Section 2: Vehicle
  const [licensePlate, setLicensePlate] = useState('');
  const [province, setProvince] = useState('');
  const [vin, setVin] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');

  // Section 3: Complaint
  const [complaint, setComplaint] = useState('');
  const [selectedQuickItems, setSelectedQuickItems] = useState<string[]>([]);

  // Section 4: Media (multi-file per slot)
  const [slotMedia, setSlotMedia] = useState<Record<string, SlotMedia[]>>({});

  // Section 5: Condition
  const [fuelLevel, setFuelLevel] = useState('');
  const [valuables, setValuables] = useState('');
  const [conditionNote, setConditionNote] = useState('');

  // Section 6: Responsibility
  const [serviceAdvisor, setServiceAdvisor] = useState('');
  const [workshopSupervisor, setWorkshopSupervisor] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');
  const [customerAcknowledged, setCustomerAcknowledged] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const now = new Date();
  const receivedDateTime = now.toLocaleString('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      setSearchResult(null);
      return;
    }
    try {
      const normalizePhone = (value: string) => value.replace(/\D/g, '');
      const customers = await fetchCustomers();
      const found = customers.find((c) => normalizePhone(c.phone) === normalizePhone(phoneSearch));
      if (!found) {
        setSearchResult('ไม่พบลูกค้าเดิม — สามารถกรอกข้อมูลเพื่อเปิดลูกค้าใหม่ได้');
        setPhone(phoneSearch);
        return;
      }
      setSearchResult(`พบลูกค้า: ${found.name} (${found.phone})`);
      setCustomerName(found.name);
      setPhone(found.phone);
      setLineContact(found.lineId || '');
      setCustomerType(found.customerType);
      setCompanyName(found.companyName || '');
      setAddress(found.address || { ...EMPTY_ADDRESS });
      setTaxId(found.taxId || '');
      setBranch(found.branch || '');
    } catch (error) {
      setSearchResult(error instanceof Error ? error.message : 'ค้นหาลูกค้าไม่สำเร็จ');
    }
  };

  const toggleQuickItem = (item: string) => {
    setSelectedQuickItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddMedia = (slotKey: string, files: FileList, mediaType: 'photo' | 'video') => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: SlotMedia = {
          id: `${slotKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          mediaType,
          localUrl: reader.result as string,
          fileName: file.name,
        };
        setSlotMedia((prev) => ({
          ...prev,
          [slotKey]: [...(prev[slotKey] || []), newItem],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMedia = (slotKey: string, id: string) => {
    setSlotMedia((prev) => ({
      ...prev,
      [slotKey]: (prev[slotKey] || []).filter((m) => m.id !== id),
    }));
  };

  const focusInvalidField = (field: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`job-${field}`) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => el.focus({ preventScroll: true }), 250);
    });
  };

  const clearFieldError = (field: string) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = 'กรุณากรอกชื่อลูกค้า';
    if (!phone.trim()) e.phone = 'กรุณากรอกเบอร์โทร';
    if (!licensePlate.trim()) e.licensePlate = 'กรุณากรอกทะเบียนรถ';
    if (!vin.trim()) e.vin = 'กรุณากรอก VIN / เลขตัวถัง';
    if (!mileage.trim()) e.mileage = 'กรุณากรอกเลขไมล์';
    if (!complaint.trim()) e.complaint = 'กรุณากรอกอาการที่ลูกค้าแจ้ง';
    setErrors(e);

    const firstInvalid = ['customerName', 'phone', 'licensePlate', 'vin', 'mileage', 'complaint'].find((field) => e[field]);
    if (firstInvalid) focusInvalidField(firstInvalid);

    return Object.keys(e).length === 0;
  };

  const buildJob = (status: Job['status']): Job => {
    const jobNumber = generateJobNumber();
    const createdAt = new Date().toISOString();

    // Build photos record from first photo of each slot for backward compat
    const photos: Record<string, string> = {};
    for (const [key, items] of Object.entries(slotMedia)) {
      const firstPhoto = items.find((m) => m.mediaType === 'photo');
      if (firstPhoto) photos[key] = firstPhoto.localUrl;
    }

    // Build full media array
    const media: MediaItem[] = [];
    for (const [category, items] of Object.entries(slotMedia)) {
      items.forEach((item) => {
        media.push({
          id: item.id,
          jobId: jobNumber,
          category,
          mediaType: item.mediaType,
          fileName: item.fileName,
          createdAt,
          createdBy: serviceAdvisor || 'system',
          localUrl: item.localUrl,
        });
      });
    }

    return {
      id: jobNumber,
      jobNumber,
      vehicleModel: vehicleModel || 'รอระบุรุ่น',
      licensePlate: licensePlate.toUpperCase(),
      customer: customerName,
      mileage,
      technician: workshopSupervisor || 'รอมอบหมาย',
      status,
      receivedTime: now.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      phone,
      lineContact,
      customerType,
      companyName: customerType === 'company' ? companyName : undefined,
      address,
      taxId: taxId || undefined,
      branch: branch || undefined,
      province,
      vin: vin.toUpperCase(),
      modelYear,
      engineNumber,
      color,
      complaint,
      quickItems: selectedQuickItems,
      fuelLevel,
      valuables,
      conditionNote,
      serviceAdvisor,
      workshopSupervisor,
      receivedDateTime,
      photos,
      media,
      customerSignature: customerSignature || undefined,
    };
  };

  const persistJob = async (validateRequired: boolean) => {
    if (saving) return;
    if (validateRequired) {
      setShowErrors(true);
      if (!validate()) return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const job = buildJob('received');
      const normalizePhone = (value: string) => value.replace(/\D/g, '');
      const normalizePlate = (value: string) => value.toUpperCase().replace(/[\s-]/g, '');

      let customerId = '';
      if (job.customer || job.phone) {
        const customers = await fetchCustomers();
        let customer = customers.find((c) => job.phone && normalizePhone(c.phone) === normalizePhone(job.phone));
        if (!customer && job.customer) {
          const newCustomer: Customer = {
            id: '', name: job.customer, phone: job.phone || '', lineId: job.lineContact || '',
            customerType: job.customerType || 'person', companyName: job.companyName || '',
            address: job.address || { ...EMPTY_ADDRESS }, taxId: job.taxId || '', branch: job.branch || '',
            createdAt: new Date().toISOString(),
          };
          customer = await insertCustomer(newCustomer) || undefined;
        }
        customerId = customer?.id || '';
      }

      if (job.licensePlate) {
        const vehicles = await fetchVehicles();
        const exists = vehicles.some((v) => normalizePlate(v.licensePlate) === normalizePlate(job.licensePlate));
        if (!exists) {
          const vehicle: Vehicle = {
            id: '', customerId, brand: 'Mercedes-Benz', model: job.vehicleModel || '',
            licensePlate: job.licensePlate, province: job.province || '', vin: job.vin || '',
            chassisCode: job.vin || '', year: job.modelYear || '', engineNumber: job.engineNumber || '',
            color: job.color || '', mileage: job.mileage || '', createdAt: new Date().toISOString(),
          };
          await insertVehicle(vehicle);
        }
      }

      const saved = await insertJob(job);
      if (!saved) throw new Error('MongoDB ไม่ได้คืนข้อมูล JOB ที่บันทึก');
      router.push(`/job/${saved.jobNumber}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'บันทึก JOB ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => { void persistJob(false); };
  const handleOpenJob = () => { void persistJob(true); };

  return (
    <AuthGuard permission="new_job">
    <AppLayout showHeader={false} showBottomNav={false}>
    <div className="min-h-screen bg-background pb-32 lg:pb-0">
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
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{saving ? 'กำลังบันทึก...' : 'เปิด JOB'} ใหม่</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest leading-tight">
                NEW JOB FORM
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-6">
        {/* SECTION 1: Customer Info */}
        <section className="glass-card metallic-border rounded-2xl p-5">
          <SectionHeader icon={User} title="ข้อมูลลูกค้า" number={1} />

          {/* Phone search */}
          <div className="mb-4">
            <FieldLabel>ค้นหาลูกค้าเดิม (เบอร์โทร)</FieldLabel>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <Input
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <Button
                type="button"
                onClick={handlePhoneSearch}
                variant="outline"
                className="h-12 px-4 bg-zinc-900/80 border-zinc-700 text-zinc-200 rounded-xl active:scale-95"
              >
                ค้นหา
              </Button>
            </div>
            {searchResult && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <Check className="w-3.5 h-3.5" />
                {searchResult}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel required>ชื่อลูกค้า</FieldLabel>
              <Input
                id="job-customerName"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); clearFieldError('customerName'); }}
                placeholder="ชื่อ-นามสกุล / ชื่อบริษัท"
                className={`${inputClass} ${showErrors && errors.customerName ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
              />
              {showErrors && errors.customerName && (
                <ErrorText><AlertCircle className="w-3 h-3" />{errors.customerName}</ErrorText>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>เบอร์โทร</FieldLabel>
                <Input
                  id="job-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }}
                  placeholder="08X-XXX-XXXX"
                  className={`${inputClass} ${showErrors && errors.phone ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
                />
                {showErrors && errors.phone && (
                  <ErrorText><AlertCircle className="w-3 h-3" />{errors.phone}</ErrorText>
                )}
              </div>
              <div>
                <FieldLabel>LINE / ช่องทางติดต่อ</FieldLabel>
                <Input
                  value={lineContact}
                  onChange={(e) => setLineContact(e.target.value)}
                  placeholder="LINE ID"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <FieldLabel>ประเภทลูกค้า</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerType('person')}
                  className={`h-12 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                    customerType === 'person'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                  }`}
                >
                  บุคคล
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType('company')}
                  className={`h-12 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                    customerType === 'company'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                  }`}
                >
                  บริษัท
                </button>
              </div>
            </div>

            {customerType === 'company' && (
              <div>
                <FieldLabel>ชื่อบริษัท</FieldLabel>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ชื่อบริษัท / ห้างหุ้นส่วน"
                  className={inputClass}
                />
              </div>
            )}

            {/* Tax ID + Branch */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>เลขประจำตัวผู้เสียภาษี</FieldLabel>
                <Input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="เลข 13 หลัก"
                  maxLength={13}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <FieldLabel>สาขา</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBranch(branch === 'headquarters' ? '' : 'headquarters')}
                    className={`h-12 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                      branch === 'headquarters'
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                        : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    สำนักงานใหญ่
                  </button>
                  <button
                    type="button"
                    onClick={() => setBranch(branch === 'branch' ? '' : 'branch')}
                    className={`h-12 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                      branch === 'branch'
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                        : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    สาขาอื่น
                  </button>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="pt-2">
              <FieldLabel>{customerType === 'company' ? 'ที่อยู่บริษัท' : 'ที่อยู่ลูกค้า'}</FieldLabel>
              <p className="text-[10px] text-zinc-500 mb-3">ไม่จำเป็นต้องกรอก สามารถเพิ่มภายหลังได้</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block">บ้านเลขที่ / อาคาร / หมู่บ้าน</label>
                  <Input
                    value={address.addressLine}
                    onChange={(e) => setAddress((a) => ({ ...a, addressLine: e.target.value }))}
                    placeholder="เช่น 123/45 อาคาร ABC หมู่บ้าน XYZ"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">หมู่</label>
                    <Input
                      value={address.moo}
                      onChange={(e) => setAddress((a) => ({ ...a, moo: e.target.value }))}
                      placeholder="-"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">ซอย</label>
                    <Input
                      value={address.soi}
                      onChange={(e) => setAddress((a) => ({ ...a, soi: e.target.value }))}
                      placeholder="-"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">ถนน</label>
                    <Input
                      value={address.road}
                      onChange={(e) => setAddress((a) => ({ ...a, road: e.target.value }))}
                      placeholder="-"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">แขวง / ตำบล</label>
                    <Input
                      value={address.subDistrict}
                      onChange={(e) => setAddress((a) => ({ ...a, subDistrict: e.target.value }))}
                      placeholder="แขวง / ตำบล"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">เขต / อำเภอ</label>
                    <Input
                      value={address.district}
                      onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))}
                      placeholder="เขต / อำเภอ"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">จังหวัด</label>
                    <Input
                      value={address.province}
                      onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                      placeholder="จังหวัด"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">รหัสไปรษณีย์</label>
                    <Input
                      value={address.postalCode}
                      onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                      placeholder="10XXX"
                      maxLength={5}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Vehicle Info */}
        <section className="glass-card metallic-border rounded-2xl p-5">
          <SectionHeader icon={Car} title="ข้อมูลรถ" number={2} />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel required>ทะเบียนรถ</FieldLabel>
                <Input
                  id="job-licensePlate"
                  value={licensePlate}
                  onChange={(e) => { setLicensePlate(e.target.value); clearFieldError('licensePlate'); }}
                  placeholder="1กก-1234"
                  className={`${inputClass} font-mono uppercase ${showErrors && errors.licensePlate ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
                />
                {showErrors && errors.licensePlate && (
                  <ErrorText><AlertCircle className="w-3 h-3" />{errors.licensePlate}</ErrorText>
                )}
              </div>
              <div>
                <FieldLabel>จังหวัด</FieldLabel>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className={`${inputClass} bg-zinc-900/80`}>
                    <SelectValue placeholder="เลือกจังหวัด" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p} className="text-white">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <FieldLabel required>VIN / Chassis Number</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="job-vin"
                  value={vin}
                  onChange={(e) => { setVin(e.target.value); clearFieldError('vin'); }}
                  placeholder="WDDXXXXXXX"
                  className={`${inputClass} font-mono uppercase ${showErrors && errors.vin ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-3 bg-zinc-900/80 border-zinc-700 text-blue-400 rounded-xl active:scale-95 shrink-0"
                >
                  <ScanLine className="w-5 h-5" />
                </Button>
              </div>
              {showErrors && errors.vin && (
                <ErrorText><AlertCircle className="w-3 h-3" />{errors.vin}</ErrorText>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>รุ่นรถ / Model</FieldLabel>
                <Input
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="เช่น C220d, C300 AMG, E300e, GLC 220d"
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel>ปีรถ</FieldLabel>
                <Input
                  type="number"
                  value={modelYear}
                  onChange={(e) => setModelYear(e.target.value)}
                  placeholder="2567"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>เลขเครื่องยนต์</FieldLabel>
                <Input
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  placeholder="เลขเครื่องยนต์"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <FieldLabel>สีรถ</FieldLabel>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="สีดำ"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <FieldLabel required>เลขไมล์</FieldLabel>
              <Input
                id="job-mileage"
                type="text"
                value={mileage}
                onChange={(e) => { setMileage(e.target.value); clearFieldError('mileage'); }}
                placeholder="45,200"
                className={`${inputClass} font-mono ${showErrors && errors.mileage ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
              />
              {showErrors && errors.mileage && (
                <ErrorText><AlertCircle className="w-3 h-3" />{errors.mileage}</ErrorText>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: Complaint */}
        <section className="glass-card metallic-border rounded-2xl p-5">
          <SectionHeader icon={FileText} title="อาการที่ลูกค้าแจ้ง" number={3} />

          <div className="space-y-4">
            <div>
              <FieldLabel required>รายละเอียดอาการ / งานที่ลูกค้าต้องการ</FieldLabel>
              <Textarea
                id="job-complaint"
                value={complaint}
                onChange={(e) => { setComplaint(e.target.value); clearFieldError('complaint'); }}
                placeholder="ระบุอาการหรืองานที่ลูกค้าต้องการ..."
                className={`${textareaClass} ${showErrors && errors.complaint ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
              />
              {showErrors && errors.complaint && (
                <ErrorText><AlertCircle className="w-3 h-3" />{errors.complaint}</ErrorText>
              )}
            </div>

            <div>
              <FieldLabel>เลือกงานด่วน</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {QUICK_ITEMS.map((item) => {
                  const selected = selectedQuickItems.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleQuickItem(item)}
                      className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                        selected
                          ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                          : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Photos & Video */}
        <section className="glass-card metallic-border rounded-2xl p-5">
          <SectionHeader icon={Camera} title="รูปภาพและวิดีโอตรวจรับรถ" number={4} />

          <div className="grid grid-cols-2 gap-3">
            {PHOTO_SLOTS.map((slot) => (
              <MediaSlot
                key={slot.key}
                slot={slot}
                items={slotMedia[slot.key] || []}
                onAdd={handleAddMedia}
                onRemove={handleRemoveMedia}
              />
            ))}
          </div>
        </section>

        {/* SECTION 5: Condition */}
        <section className="glass-card metallic-border rounded-2xl p-5">
          <SectionHeader icon={Fuel} title="สภาพรถ" number={5} />

          <div className="space-y-4">
            <div>
              <FieldLabel>ระดับน้ำมัน</FieldLabel>
              <div className="flex gap-2">
                {FUEL_LEVELS.map((level) => {
                  const selected = fuelLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFuelLevel(level)}
                      className={`flex-1 h-11 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
                        selected
                          ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                          : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel>ของมีค่าในรถ</FieldLabel>
              <Input
                value={valuables}
                onChange={(e) => setValuables(e.target.value)}
                placeholder="เช่น แว่นตา คีย์รถสำรอง ฯลฯ"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel>หมายเหตุสภาพรถ</FieldLabel>
              <Textarea
                value={conditionNote}
                onChange={(e) => setConditionNote(e.target.value)}
                placeholder="ระบุสภาพรถ รอยขีดข่วน ฯลฯ"
                className={`${textareaClass} min-h-[80px]`}
              />
            </div>
          </div>
        </section>

        {/* SECTION 6: Responsibility */}
        <section className="glass-card metallic-border rounded-2xl p-5">
          <SectionHeader icon={ClipboardCheck} title="ผู้รับผิดชอบ JOB" number={6} />

          <div className="space-y-4">
            <div>
              <FieldLabel>SA / ที่ปรึกษางานบริการ</FieldLabel>
              <Input
                value={serviceAdvisor}
                onChange={(e) => setServiceAdvisor(e.target.value)}
                placeholder="พิมพ์ชื่อ หรือเลือกจากรายชื่อด้านล่าง"
                className={inputClass}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {STAFF_LIST.map((name) => (
                  <button
                    key={`sa-${name}`}
                    type="button"
                    onClick={() => setServiceAdvisor(name)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95 ${
                      serviceAdvisor === name
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                        : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>หัวหน้าช่างผู้รับผิดชอบ</FieldLabel>
              <Input
                value={workshopSupervisor}
                onChange={(e) => setWorkshopSupervisor(e.target.value)}
                placeholder="พิมพ์ชื่อ หรือเลือกจากรายชื่อด้านล่าง"
                className={inputClass}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {STAFF_LIST.map((name) => (
                  <button
                    key={`ws-${name}`}
                    type="button"
                    onClick={() => setWorkshopSupervisor(name)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95 ${
                      workshopSupervisor === name
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                        : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>วันที่และเวลา</FieldLabel>
              <div className="h-12 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center px-4">
                <span className="text-sm text-zinc-300">{receivedDateTime} น.</span>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>ลายเซ็นลูกค้า</FieldLabel>
              <p className="text-xs text-zinc-400 -mt-1">กรุณาเซ็นชื่อในกรอบด้านล่าง</p>
              <SignaturePad value={customerSignature} onChange={(v) => { setCustomerSignature(v); if (!v) setCustomerAcknowledged(false); }} />

              <button
                type="button"
                onClick={() => setCustomerAcknowledged(!customerAcknowledged)}
                disabled={!customerSignature}
                className="flex items-start gap-3 w-full text-left px-1 py-1 disabled:opacity-40 transition-opacity"
              >
                {customerAcknowledged ? (
                  <CheckSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                )}
                <span className="text-sm text-zinc-300 leading-snug">
                  ลูกค้าตรวจสอบและรับทราบ<br />ข้อมูลการรับรถและสภาพรถ
                </span>
              </button>

              {customerSignature && customerAcknowledged && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="font-medium">ลูกค้าเซ็นรับทราบแล้ว</span>
                </div>
              )}
            </div>
          </div>
        </section>
        {saveError && <p className="text-sm text-red-400 px-1">{saveError}</p>}
      </main>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 nav-blur border-t border-zinc-800 lg:static lg:border-0 lg:bg-transparent">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-3 lg:px-0 lg:py-0">
          <Button
            type="button"
            onClick={handleSaveDraft} disabled={saving}
            variant="outline"
            className="h-14 flex-1 text-base font-semibold rounded-xl bg-zinc-800/80 border-zinc-700 text-zinc-200 active:scale-95"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกร่าง'}
          </Button>
          <Button
            type="button"
            onClick={handleOpenJob} disabled={saving}
            className="h-14 flex-1 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            {saving ? 'กำลังบันทึก...' : 'เปิด JOB'}
          </Button>
        </div>
      </div>
    </div>
    </AppLayout>
    </AuthGuard>
  );
}