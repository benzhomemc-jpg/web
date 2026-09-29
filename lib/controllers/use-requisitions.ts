'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAllRequisitions, fetchRequisitionsForJob, fetchRequisitionById, insertRequisition, updateRequisitionStatusDb } from '../models/queries';
import { insertActivityLog } from '../models/queries';
import { useAuth } from './auth-context';
import type { PartsRequisition, RequisitionLineItem, RequisitionStatus } from '../models/types';
import { REQUISITION_STATUSES } from '../models/constants';

export function useRequisitions() {
  const [requisitions, setRequisitions] = useState<PartsRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRequisitions(await fetchAllRequisitions()); }
    catch (e) { setError(e instanceof Error ? e.message : 'โหลดใบเบิกไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { requisitions, loading, error, refresh };
}

export function useRequisitionsForJob(jobNumber: string | null) {
  const [requisitions, setRequisitions] = useState<PartsRequisition[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!jobNumber) { setRequisitions([]); setLoading(false); return; }
    setLoading(true);
    try { setRequisitions(await fetchRequisitionsForJob(jobNumber)); }
    catch { setRequisitions([]); }
    finally { setLoading(false); }
  }, [jobNumber]);

  useEffect(() => { refresh(); }, [refresh]);
  return { requisitions, loading, refresh };
}

export function useRequisition(id: string | null) {
  const [requisition, setRequisition] = useState<PartsRequisition | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) { setRequisition(null); setLoading(false); return; }
    setLoading(true);
    try { setRequisition(await fetchRequisitionById(id)); }
    catch { setRequisition(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { requisition, loading, refresh };
}

export function useCreateRequisition() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (
    requisitionNumber: string, jobNumber: string, vehicleModel: string, licensePlate: string,
    items: Omit<RequisitionLineItem, 'id'>[],
  ): Promise<PartsRequisition | null> => {
    setLoading(true); setError(null);
    try {
      const result = await insertRequisition(
        requisitionNumber, jobNumber, vehicleModel, licensePlate,
        user?.staffId ?? '', user?.nickname ?? '', items,
      );
      if (result) {
        await insertActivityLog({
          userId: user?.staffId ?? 'system', userName: user?.nickname ?? 'System',
          action: `สร้างใบเบิกอะไหล่ ${requisitionNumber}`,
          entityType: 'parts_requisition', entityId: result.id,
          description: `JOB ${jobNumber} — ${items.length} รายการ`,
        });
      }
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'สร้างใบเบิกไม่สำเร็จ');
      return null;
    } finally { setLoading(false); }
  }, [user]);

  return { create, loading, error };
}

export function useUpdateRequisitionStatus() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateStatus = useCallback(async (
    id: string, newStatus: RequisitionStatus, note = '',
  ): Promise<PartsRequisition | null> => {
    setLoading(true);
    try {
      const result = await updateRequisitionStatusDb(
        id, newStatus, user?.staffId ?? 'system', user?.nickname ?? 'System', note,
      );
      if (result) {
        await insertActivityLog({
          userId: user?.staffId ?? 'system', userName: user?.nickname ?? 'System',
          action: `เปลี่ยนสถานะใบเบิก ${result.requisitionNumber}`,
          entityType: 'parts_requisition', entityId: id,
          description: `${REQUISITION_STATUSES[result.status].label}${note ? ` (${note})` : ''}`,
        });
      }
      return result;
    } catch { return null; }
    finally { setLoading(false); }
  }, [user]);

  return { updateStatus, loading };
}
