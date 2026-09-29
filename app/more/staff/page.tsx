'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Pencil, UserCheck, UserX, Phone } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import {
  type Staff, type StaffRole, type StaffStatus,
  STAFF_ROLES, STAFF_STATUSES, TECHNICIAN_SPECIALTIES,
} from '@/lib/store';
import { useStaff } from '@/lib/controllers/use-staff';
import { insertActivityLog } from '@/lib/models/queries';
import AuthGuard from '@/components/auth-guard';

function genId() {
  return `staff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function genCode(role: StaffRole) {
  const prefixes: Record<StaffRole, string> = { admin: 'ADM', service_advisor: 'SA', workshop_supervisor: 'WS', technician: 'TEC' };
  return `${prefixes[role]}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

interface StaffFormProps {
  initial?: Staff;
  onSave: (s: Staff) => void;
  onCancel: () => void;
}

function StaffForm({ initial, onSave, onCancel }: StaffFormProps) {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const [firstNameError, setFirstNameError] = useState(false);
  const [form, setForm] = useState<Staff>(initial || {
    id: genId(), code: '', firstName: '', lastName: '', nickname: '', phone: '',
    role: 'technician', status: 'active', startDate: '', specialties: [], createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (!form.code) setForm(f => ({ ...f, code: genCode(f.role) }));
  }, []);

  const set = (k: keyof Staff, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleSpecialty = (sp: string) => {
    const cur = form.specialties || [];
    setForm(f => ({ ...f, specialties: cur.includes(sp) ? cur.filter(s => s !== sp) : [...cur, sp] }));
  };

  const handleSubmit = () => {
    if (!form.firstName.trim()) {
      setFirstNameError(true);
      requestAnimationFrame(() => {
        firstNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => firstNameRef.current?.focus({ preventScroll: true }), 250);
      });
      return;
    }
    setFirstNameError(false);
    onSave(form);
  };

  return (
    <div className="space-y-4 pb-28 lg:pb-0">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">ชื่อ *</label>
          <input ref={firstNameRef} className={`w-full bg-zinc-800/60 border rounded-xl px-3 py-2.5 text-sm text-white ${firstNameError ? 'border-red-500 ring-1 ring-red-500/30' : 'border-zinc-700'}`} value={form.firstName} onChange={e => { set('firstName', e.target.value); if (firstNameError) setFirstNameError(false); }} />
          {firstNameError && <p className="mt-1 text-[11px] text-red-400">กรุณากรอกชื่อพนักงาน</p>}
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">นามสกุล</label>
          <input className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">ชื่อเล่น</label>
          <input className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white" value={form.nickname} onChange={e => set('nickname', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">เบอร์โทร</label>
          <input className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">รหัสพนักงาน</label>
        <input className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white" value={form.code} onChange={e => set('code', e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-2 block">ตำแหน่ง *</label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(STAFF_ROLES) as [StaffRole, string][]).map(([key, label]) => (
            <button key={key} onClick={() => set('role', key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.role === key ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-2 block">สถานะ</label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(STAFF_STATUSES) as [StaffStatus, { label: string; color: string }][]).map(([key, info]) => (
            <button key={key} onClick={() => set('status', key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.status === key ? `${info.color} bg-opacity-20 border-current` : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
              {info.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">วันที่เริ่มงาน</label>
        <input type="date" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
      </div>
      {form.role === 'technician' && (
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">ความเชี่ยวชาญ</label>
          <div className="flex flex-wrap gap-2">
            {TECHNICIAN_SPECIALTIES.map(sp => (
              <button key={sp} onClick={() => toggleSpecialty(sp)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${(form.specialties || []).includes(sp) ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
                {sp}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="border-t border-zinc-700 pt-4 mt-2">
        <p className="text-xs text-zinc-400 mb-3 font-medium">ข้อมูลเข้าสู่ระบบ (Login)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Username</label>
            <input className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white" value={form.username || ''} onChange={e => set('username', e.target.value)} placeholder="ชื่อผู้ใช้" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">PIN</label>
            <input type="password" maxLength={6} className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white tracking-widest" value={form.pin || ''} onChange={e => set('pin', e.target.value)} placeholder="1234" />
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1.5">กำหนด username และ PIN เพื่อให้พนักงานเข้าสู่ระบบได้</p>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-[70] border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl gap-3 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:px-0 lg:py-0">
          <button type="button" onClick={onCancel} className="h-14 flex-1 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 active:scale-95 transition-transform">ยกเลิก</button>
          <button type="button" onClick={handleSubmit} className="h-14 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm text-white font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">บันทึก</button>
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const router = useRouter();
  const { staff, loading, error, create, edit } = useStaff();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<StaffRole | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Staff | undefined>();


  const handleSave = async (s: Staff) => {
    const saved = editing ? await edit(s.id, s) : await create(s);
    if (!saved) return;
    await insertActivityLog({ userId: 'system', userName: 'System', action: editing ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน', entityType: 'staff', entityId: saved.id, description: `${saved.firstName} ${saved.lastName} (${STAFF_ROLES[saved.role]})` });
    setShowForm(false);
    setEditing(undefined);
  };

  const toggleStatus = async (s: Staff) => {
    const next: StaffStatus = s.status === 'active' ? 'inactive' : 'active';
    const saved = await edit(s.id, { status: next });
    if (!saved) return;
    await insertActivityLog({ userId: 'system', userName: 'System', action: 'เปลี่ยนสถานะพนักงาน', entityType: 'staff', entityId: s.id, description: `${s.firstName} → ${STAFF_STATUSES[next].label}` });
  };

  const q = search.toLowerCase();
  const filtered = staff.filter(s => {
    if (filterRole && s.role !== filterRole) return false;
    if (!q) return true;
    return `${s.firstName} ${s.lastName} ${s.nickname} ${s.code} ${s.phone}`.toLowerCase().includes(q);
  });

  return (
    <AuthGuard permission="staff"><AppLayout showHeader={false} showBottomNav={!showForm}>
    <div className={`min-h-screen bg-background ${showForm ? 'pb-28' : 'pb-24'} lg:pb-0`}>
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">ผู้ใช้งาน / Staff</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">STAFF MANAGEMENT</p>
            </div>
            <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 active:scale-95 transition-transform">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-xs text-white font-medium">เพิ่ม</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input placeholder="ค้นหาพนักงาน..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500" />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button onClick={() => setFilterRole('')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!filterRole ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>ทั้งหมด</button>
          {(Object.entries(STAFF_ROLES) as [StaffRole, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setFilterRole(key)} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterRole === key ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-xs text-zinc-500">กำลังโหลดพนักงานจาก MongoDB...</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}

        {showForm && (
          <div className="glass-card metallic-border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">{editing ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}</h3>
            <StaffForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(undefined); }} />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="glass-card metallic-border rounded-2xl p-8 text-center">
            <p className="text-zinc-400 text-sm">ยังไม่มีพนักงาน</p>
            <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-sm text-white font-medium active:scale-95 transition-transform">
              <Plus className="w-4 h-4 inline mr-1" />เพิ่มพนักงาน
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => {
              const statusInfo = STAFF_STATUSES[s.status];
              return (
                <div key={s.id} className="glass-card metallic-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-blue-400">{(s.nickname || s.firstName)[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{s.firstName} {s.lastName}</span>
                        {s.nickname && <span className="text-xs text-zinc-500">({s.nickname})</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500">{s.code}</span>
                        <span className="text-xs text-blue-400">{STAFF_ROLES[s.role]}</span>
                      </div>
                      {s.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs text-zinc-400">{s.phone}</span>
                        </div>
                      )}
                      {s.specialties && s.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.specialties.map(sp => (
                            <span key={sp} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">{sp}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${statusInfo.bgColor} ${statusInfo.color}`}>{statusInfo.label}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 active:scale-95">
                          <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button onClick={() => void toggleStatus(s)} className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 active:scale-95">
                          {s.status === 'active' ? <UserX className="w-3.5 h-3.5 text-zinc-400" /> : <UserCheck className="w-3.5 h-3.5 text-green-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-zinc-600 text-center pt-2">{filtered.length} พนักงาน</p>
      </main>
    </div>
    </AppLayout></AuthGuard>
  );
}
