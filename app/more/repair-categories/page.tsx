'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, Plus, Pencil, Eye, EyeOff, GripVertical } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import MobileSaveBar from '@/components/layout/MobileSaveBar';
import { type RepairCategory } from '@/lib/store';
import { DEFAULT_REPAIR_CATEGORIES } from '@/lib/models/constants';
import { fetchSetting, saveSetting, insertActivityLog } from '@/lib/models/queries';

function genId() {
  return `rc-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`;
}

export default function RepairCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<RepairCategory[]>([]);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => { fetchSetting<RepairCategory[]>('repairCategories', DEFAULT_REPAIR_CATEGORIES).then(setCategories).catch(() => setCategories(DEFAULT_REPAIR_CATEGORIES)); }, []);

  const handleSave = async () => {
    await saveSetting('repairCategories', categories);
    await insertActivityLog({ userId: 'system', userName: 'System', action: 'แก้ไขหมวดหมู่งานซ่อม', entityType: 'settings', entityId: 'repair-categories', description: `${categories.length} categories` });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = (c: RepairCategory) => { setEditingId(c.id); setEditLabel(c.label); };
  const confirmEdit = () => {
    if (editingId && editLabel.trim()) setCategories(prev => prev.map(c => c.id === editingId ? { ...c, label: editLabel.trim() } : c));
    setEditingId(null);
  };

  const toggleEnabled = (id: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));

  const addCategory = () => {
    if (!newLabel.trim()) return;
    setCategories(prev => [...prev, { id: genId(), label: newLabel.trim(), enabled: true, order: prev.length }]);
    setNewLabel('');
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setCategories(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((c, i) => ({ ...c, order: i }));
    });
  };

  return (
    <AppLayout showHeader={false} showBottomNav={false}><div className="min-h-screen lg:min-h-0 pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">หมวดหมู่งานซ่อม</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-widest">REPAIR CATEGORIES</p>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-all ${saved ? 'bg-green-600' : 'bg-blue-600'}`}>
              {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
              <span className="text-xs text-white font-medium">{saved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <div className="glass-card metallic-border rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
          {categories.map((c, idx) => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-3">
              <button onClick={() => moveUp(idx)} className="shrink-0"><GripVertical className="w-4 h-4 text-zinc-600" /></button>
              <span className="w-6 text-center text-xs text-zinc-600">{idx + 1}</span>
              {editingId === c.id ? (
                <input autoFocus className="flex-1 bg-zinc-800/60 border border-blue-500/50 rounded-lg px-2 py-1.5 text-sm text-white" value={editLabel} onChange={e => setEditLabel(e.target.value)} onBlur={confirmEdit} onKeyDown={e => e.key === 'Enter' && confirmEdit()} />
              ) : (
                <span className={`flex-1 text-sm ${c.enabled ? 'text-white' : 'text-zinc-600 line-through'}`}>{c.label}</span>
              )}
              <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg active:scale-90"><Pencil className="w-3.5 h-3.5 text-zinc-500" /></button>
              <button onClick={() => toggleEnabled(c.id)} className="p-1.5 rounded-lg active:scale-90">
                {c.enabled ? <Eye className="w-3.5 h-3.5 text-green-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
              </button>
            </div>
          ))}
        </div>

        <div className="glass-card metallic-border rounded-2xl p-4">
          <div className="flex gap-2">
            <input placeholder="เพิ่มหมวดหมู่ใหม่" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600" onKeyDown={e => e.key === 'Enter' && addCategory()} />
            <button onClick={addCategory} className="px-4 py-2 rounded-xl bg-blue-600 active:scale-95 transition-transform"><Plus className="w-4 h-4 text-white" /></button>
          </div>
        </div>
      </main>
      <MobileSaveBar onSave={handleSave} saved={saved} />
    </div></AppLayout>
  );
}
