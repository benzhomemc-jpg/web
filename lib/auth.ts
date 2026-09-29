// Re-export shim — auth now lives in lib/controllers/auth-context.tsx
export type { UserSession, StaffRole } from './models/types';
export type { PermissionArea } from './models/constants';
export { STAFF_ROLES, ROLE_PERMISSIONS, SLUG_TO_PERMISSION } from './models/constants';
export {
  getRoleLabel, getVisibleNavTabs, getVisibleMoreSlugs, ensureDefaultAdmin,
} from './controllers/auth-context';

// These functions are now stubs — use useAuth() hook instead
// They exist only for backward compatibility with components not yet migrated

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try { return !!sessionStorage.getItem('mmb_session_v2'); } catch { return false; }
}

export function getCurrentUser(): import('./models/types').UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('mmb_session_v2');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function hasPermission(area: import('./models/constants').PermissionArea): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  const { ROLE_PERMISSIONS } = require('./models/constants');
  return ROLE_PERMISSIONS[user.role]?.has(area) ?? false;
}

export function hasSlugPermission(slug: string): boolean {
  const { SLUG_TO_PERMISSION } = require('./models/constants');
  const area = SLUG_TO_PERMISSION[slug];
  if (!area) return false;
  return hasPermission(area);
}

export function login(_username: string, _pin: string): { success: boolean; error?: string } {
  return { success: false, error: 'Use useAuth() hook instead' };
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('mmb_session_v2');
}

export type StaffWithAuth = import('./models/types').Staff;
