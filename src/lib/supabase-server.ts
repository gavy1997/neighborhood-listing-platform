import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const url = (typeof rawUrl === 'string' && rawUrl.startsWith('http')) 
  ? rawUrl 
  : 'https://placeholder.supabase.co';

const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = (typeof rawKey === 'string' && rawKey.length > 5) 
  ? rawKey 
  : 'placeholder-key-for-build-phase';

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});