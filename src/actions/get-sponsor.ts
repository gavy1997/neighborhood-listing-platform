'use server';

import { supabaseAdmin } from '../lib/supabase-server';

export interface Sponsor {
  id: string;
  company_name: string;
  priority: number;
  destination_url: string;
  impression_count: number;
  start_date: string;
  end_date: string;
}

export async function getActiveSponsorForProperty(propertyId: string, targetZip: string): Promise<Sponsor | null> {
  const { data, error } = await supabaseAdmin.rpc('get_active_sponsor', {
    p_property_id: propertyId,
    p_target_zip: targetZip,
  });

  if (error) {
    console.error('Supabase RPC Error Details:', JSON.stringify(error, null, 2));
    return null;
  }
console.log('RPC Returned Data:', data);
  return data && data.length > 0 ? data[0] : null;
}