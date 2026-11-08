import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { PropertyIdSchema, ZipSchema } from '@/schemas/validation';

const PropertyIdSchema = z.string().uuid();
const ZipSchema = z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/);

export async function getActiveSponsorForProperty(propertyId: string, targetZip: string) {
  const parsedId = PropertyIdSchema.safeParse(propertyId);
  const parsedZip = ZipSchema.safeParse(targetZip);

  if (!parsedId.success || !parsedZip.success) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

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

  if (linkError || !link?.sponsors) {
    return null;
  }

  return link.sponsors[0] ?? null;
}
