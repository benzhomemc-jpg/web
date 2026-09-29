'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchVehicles, fetchVehicleById, fetchVehiclesByCustomer, insertVehicle, updateVehicle, deleteVehicle } from '../models/queries';
import type { Vehicle } from '../models/types';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setVehicles(await fetchVehicles()); }
    catch (e) { setError(e instanceof Error ? e.message : 'โหลดรถไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (v: Vehicle): Promise<Vehicle | null> => {
    try { const result = await insertVehicle(v); if (result) setVehicles(prev => [result, ...prev]); return result; }
    catch (e) { setError(e instanceof Error ? e.message : 'สร้างรถไม่สำเร็จ'); return null; }
  }, []);

  const edit = useCallback(async (id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> => {
    try { const result = await updateVehicle(id, updates); if (result) setVehicles(prev => prev.map(v => v.id === id ? result : v)); return result; }
    catch (e) { setError(e instanceof Error ? e.message : 'แก้ไขรถไม่สำเร็จ'); return null; }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    try { await deleteVehicle(id); setVehicles(prev => prev.filter(v => v.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'ลบรถไม่สำเร็จ'); }
  }, []);

  return { vehicles, loading, error, refresh, create, edit, remove };
}

export function useVehicle(id: string | null) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) { setVehicle(null); setLoading(false); return; }
    setLoading(true);
    try { setVehicle(await fetchVehicleById(id)); }
    catch { setVehicle(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { vehicle, loading, refresh };
}

export function useCustomerVehicles(customerId: string | null) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!customerId) { setVehicles([]); setLoading(false); return; }
    setLoading(true);
    try { setVehicles(await fetchVehiclesByCustomer(customerId)); }
    catch { setVehicles([]); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { refresh(); }, [refresh]);
  return { vehicles, loading, refresh };
}
