import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceKey) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});
import { createClient } from '@supabase/supabase-js';

// Enforce that environment variables are strictly loaded on the server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server configuration environment variables.');
}

// Service role client bypasses RLS for administrative backend routines
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});