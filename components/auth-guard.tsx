'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/controllers/auth-context';
import type { PermissionArea } from '@/lib/models/constants';
import { ShieldAlert } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  permission?: PermissionArea;
  slug?: string;
}

export default function AuthGuard({ children, permission, slug }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading, hasPermission, hasSlugPermission } = useAuth();
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }

    if (permission && !hasPermission(permission)) { setState('denied'); return; }
    if (slug && !hasSlugPermission(slug)) { setState('denied'); return; }
    setState('ok');
  }, [router, user, loading, permission, slug, hasPermission, hasSlugPermission]);

  if (state === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="glass-card metallic-border rounded-2xl p-8 text-center max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-white font-semibold text-lg">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-zinc-400 text-sm">คุณไม่มีสิทธิ์เข้าถึงส่วนนี้</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-sm text-white font-medium active:scale-95 transition-transform"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}
