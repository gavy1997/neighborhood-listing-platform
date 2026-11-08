import 'server-only';
<<<<<<< HEAD
import { PropertyIdSchema, ZipSchema } from '../schemas/validation';
=======
>>>>>>> 0abcb993f392925994c7ccf730835f74f9f8d5a0
import { createClient } from '@supabase/supabase-js';
import { PropertyIdSchema, ZipSchema } from '../schemas/validation';

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getActiveSponsorForProperty(propertyId: string, targetZip: string) {
  const propIdResult = PropertyIdSchema.safeParse(propertyId);
  const zipResult = ZipSchema.safeParse(targetZip);

  if (!propIdResult.success || !zipResult.success) {
    throw new Error('Invalid input parameters');
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

  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('property_id', propertyId)
    .eq('zip_code', targetZip)
    .eq('is_active', true)
    .single();

  if (error) {
    return null;
  }

<<<<<<< HEAD
  return data;
}
=======
  return link.sponsors[0] ?? null;
}
>>>>>>> 0abcb993f392925994c7ccf730835f74f9f8d5a0
