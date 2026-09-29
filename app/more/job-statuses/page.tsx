'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, Plus, GripVertical, Pencil, Eye, EyeOff } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import MobileSaveBar from '@/components/layout/MobileSaveBar';
import { type JobStatusConfig } from '@/lib/store';
import { DEFAULT_JOB_STATUSES } from '@/lib/models/constants';
import { fetchSetting, saveSetting, insertActivityLog } from '@/lib/models/queries';

function genId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`;
}

export default function JobStatusesPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<JobStatusConfig[]>([]);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => { fetchSetting<JobStatusConfig[]>('jobStatuses', DEFAULT_JOB_STATUSES).then(setStatuses).catch(() => setStatuses(DEFAULT_JOB_STATUSES)); }, []);

  const handleSave = async () => {
    await saveSetting('jobStatuses', statuses);
    await insertActivityLog({ userId: 'system', userName: 'System', action: 'แก้ไขสถานะงาน', entityType: 'settings', entityId: 'job-statuses', description: `${statuses.length} statuses` });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = (s: JobStatusConfig) => { setEditingId(s.id); setEditLabel(s.label); };

  const confirmEdit = () => {
    if (editingId && editLabel.trim()) {
      setStatuses(prev => prev.map(s => s.id === editingId ? { ...s, label: editLabel.trim() } : s));
    }
    setEditingId(null);
    setEditLabel('');
  };

  const toggleEnabled = (id: string) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const addStatus = () => {
    if (!newLabel.trim()) return;
    const internalId = newLabel.trim().toUpperCase().replace(/\s+/g, '_');
    setStatuses(prev => [...prev, { id: genId(), internalId, label: newLabel.trim(), enabled: true, order: prev.length }]);
    setNewLabel('');
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setStatuses(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const moveDown = (idx: number) => {
    if (idx >= statuses.length - 1) return;
    setStatuses(prev => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  return (
    <AppLayout showHeader={false} showBottomNav={false}><div className="min-h-screen lg:min-h-0 pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">สถานะงาน</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">JOB STATUSES</p>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-all ${saved ? 'bg-green-600' : 'bg-blue-600'}`}>
              {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span className="text-xs text-white font-medium">{saved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl p-4">
          <p className="text-xs text-zinc-500">การเปลี่ยนชื่อแสดงผลจะไม่กระทบ Internal ID ของ JOB ที่เปิดแล้ว เรียงลำดับสถานะตามขั้นตอนการทำงาน</p>
        </div>

        <div className="glass-card metallic-border rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
          {statuses.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2 px-3 py-3">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveUp(idx)} className="text-zinc-600 hover:text-zinc-400 active:scale-90"><GripVertical className="w-4 h-4" /></button>
              </div>
              <span className="w-6 text-center text-xs text-zinc-600">{idx + 1}</span>
              {editingId === s.id ? (
                <input autoFocus className="flex-1 bg-zinc-800/60 border border-blue-500/50 rounded-lg px-2 py-1.5 text-sm text-white" value={editLabel} onChange={e => setEditLabel(e.target.value)} onBlur={confirmEdit} onKeyDown={e => e.key === 'Enter' && confirmEdit()} />
              ) : (
                <span className={`flex-1 text-sm ${s.enabled ? 'text-white' : 'text-zinc-600 line-through'}`}>{s.label}</span>
              )}
              <span className="text-[10px] text-zinc-600 font-mono shrink-0">{s.internalId}</span>
              <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg active:scale-90"><Pencil className="w-3.5 h-3.5 text-zinc-500" /></button>
              <button onClick={() => toggleEnabled(s.id)} className="p-1.5 rounded-lg active:scale-90">
                {s.enabled ? <Eye className="w-3.5 h-3.5 text-green-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
              </button>
            </div>
          ))}
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4">
          <h3 className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3">เพิ่มสถานะใหม่</h3>
          <div className="flex gap-2">
            <input placeholder="ชื่อสถานะ" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600" onKeyDown={e => e.key === 'Enter' && addStatus()} />
            <button onClick={addStatus} className="px-4 py-2 rounded-xl bg-blue-600 active:scale-95 transition-transform">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </main>
      <MobileSaveBar onSave={handleSave} saved={saved} />
    </div></AppLayout>
  );
}
