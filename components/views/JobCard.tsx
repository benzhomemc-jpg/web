'use client';

import { Badge } from '@/components/ui/badge';
import { User, Gauge, Wrench, Calendar, ChevronRight } from 'lucide-react';
import { JOB_STATUSES, WORKFLOW_STEPS, STATUS_PROGRESS } from '@/lib/models/constants';
import type { Job, JobStatus } from '@/lib/models/types';

const STATUS_ORDER: JobStatus[] = WORKFLOW_STEPS;

export function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const statusInfo = JOB_STATUSES[job.status];
  const progress = STATUS_PROGRESS[job.status];
  const statusIndex = STATUS_ORDER.indexOf(job.status);

  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-card metallic-border rounded-2xl overflow-hidden transition-all hover:border-zinc-600 active:scale-[0.99]"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className="text-blue-400 font-bold text-sm tracking-wide">{job.jobNumber}</span>
          <Badge variant="outline" className={`${statusInfo.bgColor} ${statusInfo.color} border gap-1.5 px-2.5 py-1 text-xs font-semibold`}>
            <span className={`status-dot ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </Badge>
        </div>

        <h3 className="text-white font-semibold text-base mb-1">{job.vehicleModel}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center bg-zinc-800 text-zinc-200 font-mono font-semibold text-sm px-2.5 py-1 rounded-md border border-zinc-700">
            {job.licensePlate}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-400 truncate">{job.customer}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Gauge className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-400 truncate">{job.mileage} km</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Wrench className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-400 truncate">{job.workshopSupervisor || job.technician}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-400 truncate">{job.receivedDateTime || `รับ ${job.receivedTime} น.`}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          {STATUS_ORDER.map((s, i) => (
            <div key={s} className="h-1 flex-1 rounded-full transition-colors"
              style={{ backgroundColor: i <= statusIndex ? JOB_STATUSES[s].dotColor : 'hsl(0 0% 20%)' }} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-medium">ความคืบหน้า {progress}%</span>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>
      </div>
    </button>
  );
}
