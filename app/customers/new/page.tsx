'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { type CustomerAddress, EMPTY_ADDRESS, type BranchType } from '@/lib/jobs';
import { type Customer } from '@/lib/store';
import { insertCustomer } from '@/lib/models/queries';
import AuthGuard from '@/components/auth-guard';

const inputClass = 'h-12 bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm';

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [customerType, setCustomerType] = useState<'person' | 'company'>('person');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState<CustomerAddress>({ ...EMPTY_ADDRESS });
  const [taxId, setTaxId] = useState('');
  const [branch, setBranch] = useState<BranchType | ''>('');
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

  const handleSave = async () => {
    const e: Record<string, boolean> = {};
    if (!name.trim()) e.name = true;
    if (!phone.trim()) e.phone = true;
    setErrors(e);
    if (Object.keys(e).length > 0 || saving) {
      if (e.name) focusInvalidField('customer-name');
      else if (e.phone) focusInvalidField('customer-phone');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const c: Customer = {
        id: '',
        name: name.trim(),
        phone: phone.trim(),
        lineId: lineId.trim(),
        customerType,
        companyName: customerType === 'company' ? companyName.trim() : '',
        address,
        taxId: taxId.trim(),
        branch,
        createdAt: new Date().toISOString(),
      };
      const saved = await insertCustomer(c);
      if (!saved) throw new Error('MongoDB ไม่ได้คืนข้อมูลลูกค้าที่บันทึก');
      router.push(`/customers/${saved.id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'บันทึกลูกค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard permission="customers">
    <AppLayout showHeader={false} showBottomNav={false}>
    <div className="min-h-screen bg-background pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">เพิ่มลูกค้า</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">NEW CUSTOMER</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">ประเภทลูกค้า</label>
            <div className="grid grid-cols-2 gap-3">
              {(['person', 'company'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setCustomerType(t)}
                  className={`h-12 rounded-xl border text-sm font-medium active:scale-95 transition-all ${
                    customerType === t ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                  }`}>
                  {t === 'person' ? 'บุคคล' : 'บริษัท'}
                </button>
              ))}
            </div>
          </div>

          {customerType === 'company' && (
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">ชื่อบริษัท</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ชื่อบริษัท / ห้างหุ้นส่วน" className={inputClass} />
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">ชื่อลูกค้า <span className="text-red-400">*</span></label>
            <Input id="customer-name" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => ({ ...prev, name: false })); }} placeholder="ชื่อ-นามสกุล" className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">เบอร์โทร <span className="text-red-400">*</span></label>
              <Input id="customer-phone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((prev) => ({ ...prev, phone: false })); }} placeholder="08X-XXX-XXXX" className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">LINE</label>
              <Input value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder="LINE ID" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">เลขผู้เสียภาษี</label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="เลข 13 หลัก" maxLength={13} className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">สาขา</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setBranch(branch === 'headquarters' ? '' : 'headquarters')}
                  className={`h-12 rounded-xl border text-[10px] font-medium active:scale-95 transition-all ${
                    branch === 'headquarters' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                  }`}>สำนักงานใหญ่</button>
                <button type="button" onClick={() => setBranch(branch === 'branch' ? '' : 'branch')}
                  className={`h-12 rounded-xl border text-[10px] font-medium active:scale-95 transition-all ${
                    branch === 'branch' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
                  }`}>สาขาอื่น</button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">ที่อยู่</label>
            <div className="space-y-2">
              <Input value={address.addressLine} onChange={(e) => setAddress((a) => ({ ...a, addressLine: e.target.value }))} placeholder="บ้านเลขที่ / อาคาร / หมู่บ้าน" className={inputClass} />
              <div className="grid grid-cols-3 gap-2">
                <Input value={address.moo} onChange={(e) => setAddress((a) => ({ ...a, moo: e.target.value }))} placeholder="หมู่" className={inputClass} />
                <Input value={address.soi} onChange={(e) => setAddress((a) => ({ ...a, soi: e.target.value }))} placeholder="ซอย" className={inputClass} />
                <Input value={address.road} onChange={(e) => setAddress((a) => ({ ...a, road: e.target.value }))} placeholder="ถนน" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={address.subDistrict} onChange={(e) => setAddress((a) => ({ ...a, subDistrict: e.target.value }))} placeholder="แขวง / ตำบล" className={inputClass} />
                <Input value={address.district} onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))} placeholder="เขต / อำเภอ" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={address.province} onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))} placeholder="จังหวัด" className={inputClass} />
                <Input value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} placeholder="รหัสไปรษณีย์" maxLength={5} className={`${inputClass} font-mono`} />
              </div>
            </div>
          </div>
        </div>

        {saveError && <p className="text-sm text-red-400">{saveError}</p>}

        <div className="h-20 lg:hidden" aria-hidden="true" />
        <div className="fixed bottom-0 left-0 right-0 z-50 nav-blur border-t border-zinc-800 lg:static lg:border-0 lg:bg-transparent">
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:px-0 lg:py-0">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกลูกค้า'}
            </Button>
          </div>
        </div>
      </main>
    </div>
    </AppLayout>
    </AuthGuard>
  );
}
