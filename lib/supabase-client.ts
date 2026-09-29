import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not found. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
  storageKey: 'mmb-supabase',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
