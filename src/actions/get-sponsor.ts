import 'server-only';
import { PropertyIdSchema, ZipSchema } from '@/schemas/validation';
import { createClient } from '@supabase/supabase-js';

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getActiveSponsorForProperty(propertyId: string, targetZip: string) {
  // Use the imported schemas directly
  const propIdResult = PropertyIdSchema.safeParse(propertyId);
  const zipResult = ZipSchema.safeParse(targetZip);

  if (!propIdResult.success || !zipResult.success) {
    throw new Error('Invalid input parameters');
  }

  const supabase = createPublicClient();

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

  return data;
}