'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchJobs, fetchJobByNumber, insertJob, updateJob } from '../models/queries';
import { insertActivityLog } from '../models/queries';
import type { Job } from '../models/types';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดงานไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createJob = useCallback(async (job: Job): Promise<Job | null> => {
    try {
      const result = await insertJob(job);
      if (result) {
        setJobs(prev => [result, ...prev]);
        await insertActivityLog({
          userId: '', userName: '', action: `สร้างงาน ${job.jobNumber}`,
          entityType: 'job', entityId: result.id, description: `${job.vehicleModel} ${job.licensePlate}`,
        });
      }
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'สร้างงานไม่สำเร็จ');
      return null;
    }
  }, []);

  const editJob = useCallback(async (jobNumber: string, updates: Partial<Job>): Promise<Job | null> => {
    try {
      const result = await updateJob(jobNumber, updates);
      if (result) {
        setJobs(prev => prev.map(j => j.jobNumber === jobNumber ? result : j));
      }
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'แก้ไขงานไม่สำเร็จ');
      return null;
    }
  }, []);

  return { jobs, loading, error, refresh, createJob, editJob };
}

export function useJob(jobNumber: string | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!jobNumber) { setJob(null); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobByNumber(jobNumber);
      setJob(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดงานไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [jobNumber]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback(async (updates: Partial<Job>): Promise<Job | null> => {
    if (!jobNumber) return null;
    try {
      const result = await updateJob(jobNumber, updates);
      if (result) setJob(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'แก้ไขงานไม่สำเร็จ');
      return null;
    }
  }, [jobNumber]);

  return { job, loading, error, refresh, update };
}
