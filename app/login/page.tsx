'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { useAuth, ensureDefaultAdmin } from '@/lib/controllers/auth-context';
import MMBBrandLogo from '@/components/branding/MMBBrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ensureDefaultAdmin();
    if (user) { router.replace('/'); return; }
    setMounted(true);
  }, [router, user]);

  if (!mounted) return null;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login(username, pin);
    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: `linear-gradient(rgba(2, 5, 9, 0.22), rgba(2, 5, 9, 0.28)), url('/branding/mmb-background.webp')`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#05080C',
      }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <MMBBrandLogo className="justify-center" />
          <p className="text-xs text-zinc-400 tracking-wide">ระบบบริหารจัดการศูนย์บริการ</p>
        </div>

        <div
          className="rounded-3xl p-6 space-y-5"
          style={{
            background: 'rgba(5, 9, 14, 0.30)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.20)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          }}
        >
          <h2 className="text-sm font-semibold text-white text-center">เข้าสู่ระบบ</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">รหัสพนักงาน / Username</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)} placeholder="username" autoComplete="username"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
              style={{ background: 'rgba(5, 9, 14, 0.40)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'} value={pin} onChange={e => setPin(e.target.value)} placeholder="****" autoComplete="current-password"
                className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                style={{ background: 'rgba(5, 9, 14, 0.40)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                {showPin ? <EyeOff className="w-4 h-4 text-zinc-500" /> : <Eye className="w-4 h-4 text-zinc-500" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin} disabled={loading || !username.trim() || !pin.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium text-sm active:scale-[0.98] transition-all disabled:opacity-40"
            style={{ background: '#0A84FF' }}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
          </button>
        </div>

        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(5, 9, 14, 0.25)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <p className="text-[10px] text-amber-400/70">บัญชีทดสอบสำหรับ Prototype เท่านั้น</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">admin / 1234</p>
        </div>
      </div>
    </div>
  );
}
