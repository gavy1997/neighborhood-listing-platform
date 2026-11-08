import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!url || !serviceRoleKey) {
  throw new Error('Supabase server configuration is missing.')
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export function getSupabaseServerClient() {
  return supabaseAdmin
}