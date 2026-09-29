'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, Upload } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import MobileSaveBar from '@/components/layout/MobileSaveBar';
import { type WorkshopInfo } from '@/lib/store';
import { DEFAULT_WORKSHOP_INFO } from '@/lib/models/constants';
import { fetchSetting, saveSetting, insertActivityLog } from '@/lib/models/queries';

export default function WorkshopInfoPage() {
  const router = useRouter();
  const [form, setForm] = useState<WorkshopInfo | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSetting<WorkshopInfo>('workshopInfo', DEFAULT_WORKSHOP_INFO).then(setForm).catch(() => setForm(DEFAULT_WORKSHOP_INFO)); }, []);

  if (!form) return null;

  const set = (k: keyof WorkshopInfo, v: string) => setForm(f => f ? { ...f, [k]: v } : f);

  const handleSave = async () => {
    await saveSetting('workshopInfo', form);
    await insertActivityLog({ userId: 'system', userName: 'System', action: 'แก้ไขข้อมูลอู่', entityType: 'settings', entityId: 'workshop', description: form.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => f ? { ...f, logo: reader.result as string } : f);
    reader.readAsDataURL(file);
  };

  const Field = ({ label, k, placeholder }: { label: string; k: keyof WorkshopInfo; placeholder?: string }) => (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
      <input className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <AppLayout showHeader={false} showBottomNav={false}><div className="min-h-screen lg:min-h-0 pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">ข้อมูลอู่</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">WORKSHOP INFO</p>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-all ${saved ? 'bg-green-600' : 'bg-blue-600'}`}>
              {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span className="text-xs text-white font-medium">{saved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">โลโก้</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-zinc-500">No Logo</span>
              )}
            </div>
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 cursor-pointer active:scale-95 transition-transform">
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-300">อัปโหลด</span>
              <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </label>
          </div>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">ข้อมูลอู่</h3>
          <Field label="ชื่ออู่" k="name" placeholder="MMB WORKSHOP" />
          <Field label="ชื่อภาษาอังกฤษ" k="nameEn" placeholder="MMB WORKSHOP SERVICE MANAGEMENT" />
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">ที่อยู่</h3>
          <Field label="ที่อยู่" k="address" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="ตำบล/แขวง" k="subDistrict" />
            <Field label="อำเภอ/เขต" k="district" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="จังหวัด" k="province" />
            <Field label="รหัสไปรษณีย์" k="postalCode" />
          </div>
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">ข้อมูลติดต่อ</h3>
          <Field label="เบอร์โทร" k="phone" />
          <Field label="LINE" k="line" />
          <Field label="Email" k="email" />
          <Field label="Website" k="website" />
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4 space-y-3">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">ข้อมูลภาษี</h3>
          <Field label="เลขประจำตัวผู้เสียภาษี" k="taxId" />
          <Field label="เลขที่สาขา" k="branchNumber" />
        </div>
      </main>
      <MobileSaveBar onSave={handleSave} saved={saved} />
    </div></AppLayout>
  );
}
