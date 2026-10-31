'use server'

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const PropertyIdSchema = z.string().uuid()
const ZipSchema = z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/)

export interface Sponsor {
  id: string
  company_name: string
  destination_url: string
}

function createPublicClient() {
  const url = process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase public configuration is missing.')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function getActiveSponsorForProperty(
  propertyId: string,
  targetZip: string,
): Promise<Sponsor | null> {
  const parsedId = PropertyIdSchema.safeParse(propertyId)
  const parsedZip = ZipSchema.safeParse(targetZip)

  if (!parsedId.success || !parsedZip.success) return null

  try {
    const supabase = createPublicClient()

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, zip_code')
      .eq('id', parsedId.data)
      .eq('zip_code', parsedZip.data)
      .eq('approved', true)
      .maybeSingle()

    if (propertyError || !property) return null

    const { data: link, error: linkError } = await supabase
      .from('property_sponsors')
      .select('sponsors!inner(id, business_name, website_url)')
      .eq('property_id', parsedId.data)
      .eq('sponsors.active', true)
      .eq('sponsors.approved', true)
      .limit(1)
      .maybeSingle()

    if (linkError || !link?.sponsors) return null

const sponsor = link.sponsors[0]
if (!sponsor) return null

    return {
      id: sponsor.id,
      company_name: sponsor.business_name,
      destination_url: sponsor.website_url,
    }
  } catch {
    return null
  }
}