'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchStaffByUsername, insertStaff, fetchStaff } from '../models/queries';
import type { UserSession, Staff, StaffRole } from '../models/types';
import { ROLE_PERMISSIONS, SLUG_TO_PERMISSION, STAFF_ROLES, type PermissionArea } from '../models/constants';

interface AuthContextValue {
  user: UserSession | null;
  loading: boolean;
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (area: PermissionArea) => boolean;
  hasSlugPermission: (slug: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'mmb_session_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!username.trim() || !pin.trim()) return { success: false, error: 'กรุณากรอกข้อมูลให้ครบ' };
    try {
      const staff = await fetchStaffByUsername(username.trim());
      if (!staff) return { success: false, error: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' };
      if (staff.pin !== pin) return { success: false, error: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' };
      if (staff.status !== 'active') return { success: false, error: 'บัญชีนี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };

      const session: UserSession = {
        id: `sess-${Date.now()}`,
        staffId: staff.id,
        name: `${staff.firstName} ${staff.lastName}`.trim(),
        nickname: staff.nickname || staff.firstName,
        username: staff.username || '',
        role: staff.role,
        loginAt: new Date().toISOString(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { success: true };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const hasPermission = useCallback((area: PermissionArea): boolean => {
    const role = user?.role;
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.has(area) ?? false;
  }, [user]);

  const hasSlugPermission = useCallback((slug: string): boolean => {
    const area = SLUG_TO_PERMISSION[slug];
    if (!area) return false;
    return hasPermission(area);
  }, [hasPermission]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasSlugPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getRoleLabel(role: StaffRole): string {
  return STAFF_ROLES[role] || role;
}

export function getVisibleNavTabs(role: StaffRole): string[] {
  if (role === 'technician') return ['home', 'jobs', 'more'];
  return ['home', 'jobs', 'customers', 'cars', 'more'];
}

export function getVisibleMoreSlugs(role: StaffRole): Set<string> {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return new Set();
  const slugs = new Set<string>();
  for (const [slug, area] of Object.entries(SLUG_TO_PERMISSION)) {
    if (perms.has(area)) slugs.add(slug);
  }
  return slugs;
}

export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const staff = await fetchStaff();
    const hasAdmin = staff.some(s => s.role === 'admin' && s.username);
    if (!hasAdmin) {
      await insertStaff({
        id: '', code: 'ADM-0001', firstName: 'Admin', lastName: 'Prototype',
        nickname: 'Admin', phone: '', role: 'admin', status: 'active',
        startDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(), username: 'admin', pin: '1234',
      } as Staff);
    }
  } catch (e) {
    console.error('ensureDefaultAdmin:', e);
  }
}
