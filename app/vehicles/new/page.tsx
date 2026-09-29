'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import type { Vehicle } from '@/lib/models/types';
import { insertVehicle } from '@/lib/models/queries';
import { useCustomers } from '@/lib/controllers/use-customers';
import AuthGuard from '@/components/auth-guard';

const inputClass = 'h-12 bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm';

export default function NewVehiclePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, loading: customersLoading } = useCustomers();
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '');
  const [brand, setBrand] = useState('Mercedes-Benz');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [province, setProvince] = useState('');
  const [vin, setVin] = useState('');
  const [year, setYear] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const focusInvalidField = (id: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => el.focus({ preventScroll: true }), 250);
    });
  };

  useEffect(() => {
    const fromQuery = searchParams.get('customerId');
    if (fromQuery) setCustomerId(fromQuery);
  }, [searchParams]);

  const handleSave = async () => {
    const e: Record<string, boolean> = {};
    if (!licensePlate.trim()) e.licensePlate = true;
    setErrors(e);
    if (Object.keys(e).length > 0 || saving) {
      if (e.licensePlate) focusInvalidField('vehicle-license-plate');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const v: Vehicle = {
        id: '',
        customerId,
        brand: brand.trim() || model.split(' ')[0] || 'อื่นๆ',
        model: model.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        province: province.trim(),
        vin: vin.trim().toUpperCase(),
        chassisCode: vin.trim().toUpperCase(),
        year: year.trim(),
        engineNumber: engineNumber.trim(),
        color: color.trim(),
        mileage: mileage.trim(),
        createdAt: new Date().toISOString(),
      };
      const saved = await insertVehicle(v);
      if (!saved) throw new Error('MongoDB ไม่ได้คืนข้อมูลรถที่บันทึก');
      router.push(`/vehicles/${saved.id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'บันทึกรถไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard permission="vehicles"><AppLayout showHeader={false} showBottomNav={false}>
    <div className="min-h-screen bg-background pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden"><div className="max-w-2xl mx-auto px-4 pt-4 pb-3"><div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95"><ArrowLeft className="w-5 h-5 text-white" /></button>
        <div><h1 className="text-lg font-bold text-white leading-tight">เพิ่มรถ</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">NEW VEHICLE</p></div>
      </div></div></header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">เจ้าของรถ</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} disabled={customersLoading}
              className="w-full h-12 px-3 rounded-xl bg-zinc-900/80 border border-zinc-700 text-white text-sm">
              <option value="">-- ยังไม่ผูกกับลูกค้า --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-zinc-400 mb-1.5 block">ยี่ห้อ</label><Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Mercedes-Benz" className={inputClass} /></div>
            <div><label className="text-xs text-zinc-400 mb-1.5 block">รุ่น / Model</label><Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="C300 AMG" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-zinc-400 mb-1.5 block">ทะเบียนรถ <span className="text-red-400">*</span></label><Input id="vehicle-license-plate" value={licensePlate} onChange={(e) => { setLicensePlate(e.target.value); if (errors.licensePlate) setErrors((prev) => ({ ...prev, licensePlate: false })); }} placeholder="1กก-1234" className={`${inputClass} font-mono uppercase ${errors.licensePlate ? 'border-red-500' : ''}`} /></div>
            <div><label className="text-xs text-zinc-400 mb-1.5 block">จังหวัด</label><Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="กรุงเทพมหานคร" className={inputClass} /></div>
          </div>
          <div><label className="text-xs text-zinc-400 mb-1.5 block">VIN / Chassis Number</label><Input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="WDDXXXXXXX" className={`${inputClass} font-mono uppercase`} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-zinc-400 mb-1.5 block">ปีรถ</label><Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className={inputClass} /></div>
            <div><label className="text-xs text-zinc-400 mb-1.5 block">สีรถ</label><Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="ดำ" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-zinc-400 mb-1.5 block">เลขเครื่องยนต์</label><Input value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} placeholder="เลขเครื่องยนต์" className={`${inputClass} font-mono`} /></div>
            <div><label className="text-xs text-zinc-400 mb-1.5 block">เลขไมล์</label><Input value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="45,200" className={`${inputClass} font-mono`} /></div>
          </div>
        </div>
        {saveError && <p className="text-sm text-red-400">{saveError}</p>}
        <div className="h-20 lg:hidden" aria-hidden="true" />
        <div className="fixed bottom-0 left-0 right-0 z-50 nav-blur border-t border-zinc-800 lg:static lg:border-0 lg:bg-transparent">
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:px-0 lg:py-0">
            <Button onClick={handleSave} disabled={saving} className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"><Save className="w-5 h-5 mr-2" />{saving ? 'กำลังบันทึก...' : 'บันทึกรถ'}</Button>
          </div>
        </div>
      </main>
    </div>
    </AppLayout></AuthGuard>
  );
}
