
import 'server-only';
import { PropertyIdSchema, ZipSchema } from '../schemas/validation';
import { createClient } from '@supabase/supabase-js';

function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getActiveSponsorForProperty(
  propertyId: string,
  targetZip: string
) {
  const parsedId = PropertyIdSchema.safeParse(propertyId);
  const parsedZip = ZipSchema.safeParse(targetZip);

  if (!parsedId.success || !parsedZip.success) {
    return null;
  }

  const supabase = createPublicClient();

  const { data: link, error: linkError } = await supabase
    .from('property_sponsors')
    .select(`
      property_id,
      sponsors!inner (
        id,
        company_name,
        destination_url,
        is_active,
        approved
      )
    `)
    .eq('property_id', parsedId.data)
    .eq('sponsors.is_active', true)
    .eq('sponsors.approved', true)
    .limit(1)
    .maybeSingle();

  if (linkError) {
    console.error('Sponsor lookup failed:', linkError.message);
    return null;
  }

  if (!link?.sponsors) {
    return null;
  }

  return Array.isArray(link.sponsors)
    ? link.sponsors[0]
    : link.sponsors;
}
