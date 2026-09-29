'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchActivityLogs, insertActivityLog } from '../models/queries';
import type { ActivityLog } from '../models/types';

export function useActivityLogs(limit = 100) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setLogs(await fetchActivityLogs(limit)); }
    catch (e) { setError(e instanceof Error ? e.message : 'โหลดประวัติไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, [limit]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> => {
    try { await insertActivityLog(log); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'บันทึกประวัติไม่สำเร็จ'); }
  }, [refresh]);

  return { logs, loading, error, refresh, add };
}
