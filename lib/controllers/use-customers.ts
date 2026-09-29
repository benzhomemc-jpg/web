'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchCustomers, fetchCustomerById, insertCustomer, updateCustomer, deleteCustomer } from '../models/queries';
import type { Customer } from '../models/types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setCustomers(await fetchCustomers()); }
    catch (e) { setError(e instanceof Error ? e.message : 'โหลดลูกค้าไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (c: Customer): Promise<Customer | null> => {
    try { const result = await insertCustomer(c); if (result) setCustomers(prev => [result, ...prev]); return result; }
    catch (e) { setError(e instanceof Error ? e.message : 'สร้างลูกค้าไม่สำเร็จ'); return null; }
  }, []);

  const edit = useCallback(async (id: string, updates: Partial<Customer>): Promise<Customer | null> => {
    try { const result = await updateCustomer(id, updates); if (result) setCustomers(prev => prev.map(c => c.id === id ? result : c)); return result; }
    catch (e) { setError(e instanceof Error ? e.message : 'แก้ไขลูกค้าไม่สำเร็จ'); return null; }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    try { await deleteCustomer(id); setCustomers(prev => prev.filter(c => c.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'ลบลูกค้าไม่สำเร็จ'); }
  }, []);

  return { customers, loading, error, refresh, create, edit, remove };
}

export function useCustomer(id: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) { setCustomer(null); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setCustomer(await fetchCustomerById(id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'โหลดลูกค้าไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { customer, loading, error, refresh };
}
