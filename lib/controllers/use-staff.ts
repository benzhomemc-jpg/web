'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchStaff, insertStaff, updateStaff, deleteStaff, fetchStaffByRole } from '../models/queries';
import type { Staff, StaffRole } from '../models/types';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setStaff(await fetchStaff()); }
    catch (e) { setError(e instanceof Error ? e.message : 'โหลดพนักงานไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (s: Staff): Promise<Staff | null> => {
    try { const result = await insertStaff(s); if (result) setStaff(prev => [result, ...prev]); return result; }
    catch (e) { setError(e instanceof Error ? e.message : 'สร้างพนักงานไม่สำเร็จ'); return null; }
  }, []);

  const edit = useCallback(async (id: string, updates: Partial<Staff>): Promise<Staff | null> => {
    try { const result = await updateStaff(id, updates); if (result) setStaff(prev => prev.map(s => s.id === id ? result : s)); return result; }
    catch (e) { setError(e instanceof Error ? e.message : 'แก้ไขพนักงานไม่สำเร็จ'); return null; }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    try { await deleteStaff(id); setStaff(prev => prev.filter(s => s.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'ลบพนักงานไม่สำเร็จ'); }
  }, []);

  return { staff, loading, error, refresh, create, edit, remove };
}

export function useStaffByRole(role: StaffRole) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setStaff(await fetchStaffByRole(role)); }
    catch { setStaff([]); }
    finally { setLoading(false); }
  }, [role]);

  useEffect(() => { refresh(); }, [refresh]);
  return { staff, loading, refresh };
}
