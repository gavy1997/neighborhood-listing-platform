import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const PropertyIdSchema = z.string().uuid();
const ZipSchema = z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/);

export interface Sponsor {
  id: string;
  company_name: string;
  destination_url: string;
}

function createPublicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase public configuration is missing.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getActiveSponsorForProperty(propertyId: string, targetZip: string): Promise<Sponsor | null> {
  // Validate inputs with Zod schemas
  const validatedPropertyId = PropertyIdSchema.parse(propertyId);
  const validatedZip = ZipSchema.parse(targetZip);

  const supabase = createPublicClient();

const { data, error } = await supabase
    .from('sponsors')
    .select('id, company_name, destination_url')
    .eq('YOUR_CORRECT_COLUMN_NAME', validatedPropertyId) // Replace with actual column name
    .eq('target_zip', validatedZip)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching sponsor:', error.message);
    return null;
  }

  return data;
}
