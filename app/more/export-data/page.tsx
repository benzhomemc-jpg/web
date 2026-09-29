'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileJson, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useCustomers } from '@/lib/controllers/use-customers';
import { useVehicles } from '@/lib/controllers/use-vehicles';
import { useJobs } from '@/lib/controllers/use-jobs';
import { useStaff } from '@/lib/controllers/use-staff';

type ExportType = 'customers' | 'vehicles' | 'jobs' | 'staff';
type ExportFormat = 'json' | 'csv';

const EXPORT_ITEMS: { key: ExportType; label: string }[] = [
  { key: 'customers', label: 'ลูกค้า' },
  { key: 'vehicles', label: 'รถ' },
  { key: 'jobs', label: 'JOB' },
  { key: 'staff', label: 'พนักงาน' },
];

function toCsv(headers: string[], rows: string[][]): string {
  const bom = '\uFEFF';
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))];
  return bom + lines.join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportDataPage() {
  const router = useRouter();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { jobs } = useJobs();
  const { staff } = useStaff();
  const counts = useMemo<Record<ExportType, number>>(() => ({ customers: customers.length, vehicles: vehicles.length, jobs: jobs.length, staff: staff.length }), [customers, vehicles, jobs, staff]);
  const [exported, setExported] = useState<string | null>(null);

  const doExport = (type: ExportType, format: ExportFormat) => {
    const date = new Date().toISOString().slice(0, 10);
    if (format === 'json') {
      let data: unknown;
      if (type === 'customers') data = customers;
      else if (type === 'vehicles') data = vehicles;
      else if (type === 'jobs') data = jobs;
      else data = staff;
      downloadFile(JSON.stringify(data, null, 2), `mmb-${type}-${date}.json`, 'application/json');
    } else {
      let csv = '';
      if (type === 'customers') {
        const items = customers;
        csv = toCsv(['ID', 'ชื่อ', 'โทร', 'LINE', 'ประเภท', 'Tax ID'], items.map(c => [c.id, c.name, c.phone, c.lineId, c.customerType, c.taxId]));
      } else if (type === 'vehicles') {
        const items = vehicles;
        csv = toCsv(['ID', 'ยี่ห้อ', 'รุ่น', 'ทะเบียน', 'จังหวัด', 'VIN', 'ปี', 'สี', 'เลขไมล์'], items.map(v => [v.id, v.brand, v.model, v.licensePlate, v.province, v.vin, v.year, v.color, v.mileage]));
      } else if (type === 'jobs') {
        const items = jobs;
        csv = toCsv(['JOB', 'รถ', 'ทะเบียน', 'ลูกค้า', 'เลขไมล์', 'สถานะ', 'SA', 'หัวหน้าช่าง'], items.map(j => [j.jobNumber, j.vehicleModel, j.licensePlate, j.customer, j.mileage, j.status, j.serviceAdvisor || '', j.workshopSupervisor || '']));
      } else {
        const items = staff;
        csv = toCsv(['รหัส', 'ชื่อ', 'นามสกุล', 'ชื่อเล่น', 'โทร', 'ตำแหน่ง', 'สถานะ'], items.map(s => [s.code, s.firstName, s.lastName, s.nickname, s.phone, s.role, s.status]));
      }
      downloadFile(csv, `mmb-${type}-${date}.csv`, 'text/csv;charset=utf-8');
    }
    setExported(type);
    setTimeout(() => setExported(null), 2000);
  };

  return (
    <AppLayout showHeader={false}><div className="min-h-screen lg:min-h-0 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-800 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button onClick={() => router.push('/more')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div><h1 className="text-lg font-bold text-white">Export Data</h1><p className="text-[10px] text-blue-400 font-medium tracking-widest">EXPORT</p></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {EXPORT_ITEMS.map(item => (
          <div key={item.key} className="glass-card metallic-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-white">{item.label}</span>
                <span className="text-xs text-zinc-500 ml-2">{counts[item.key]} รายการ</span>
              </div>
              {exported === item.key && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </div>
            <div className="flex gap-2">
              <button onClick={() => doExport(item.key, 'csv')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 active:scale-95 transition-transform">
                <FileSpreadsheet className="w-4 h-4 text-green-400" />
                <span className="text-xs text-zinc-300">CSV</span>
              </button>
              <button onClick={() => doExport(item.key, 'json')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 active:scale-95 transition-transform">
                <FileJson className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-zinc-300">JSON</span>
              </button>
            </div>
          </div>
        ))}

        <div className="glass-card metallic-border rounded-2xl p-4">
          <p className="text-xs text-zinc-500">CSV รองรับภาษาไทย UTF-8 เปิดได้ใน Excel ไม่มีการ Export รหัสผ่านหรือข้อมูลความปลอดภัย</p>
        </div>
      </main>
    </div></AppLayout>
  );
}
