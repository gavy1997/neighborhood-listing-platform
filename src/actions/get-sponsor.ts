import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { selectSponsor } from '../lib/sponsorMatcher'

const PropertyIdSchema = z.string().uuid()
const ZipSchema = z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/)

export async function getActiveSponsorForProperty(
  propertyId: string,
  targetZip: string,
  placement = 'sidebar',
) {
  const parsedId = PropertyIdSchema.safeParse(propertyId)
  const parsedZip = ZipSchema.safeParse(targetZip)

  if (!parsedId.success || !parsedZip.success) return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY

  if (!url || !key) return null

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('sponsors')
    .select(`
      id,
      business_name,
      destination_url,
      status,
      is_active,
      placement,
      start_date,
      end_date,
      target_zip_codes,
      coverage_radius_miles,
      tier,
      impression_count,
      property_sponsors!inner(property_id, distance_miles)
    `)
    .eq('property_sponsors.property_id', parsedId.data)
    .eq('status', 'APPROVED')
    .eq('is_active', true)
    .eq('placement', placement)
    .lte('start_date', today)
    .gte('end_date', today)

  if (error) {
    console.error('Sponsor eligibility query failed:', error)
    return null
  }

  const candidates = (data ?? []).map((row: any) => {
    const links = Array.isArray(row.property_sponsors)
      ? row.property_sponsors
      : [row.property_sponsors]
    const link = links[0]

    return {
      id: row.id,
      name: row.business_name,
      approved: row.status === 'APPROVED',
      active: row.is_active,
      placement: row.placement,
      startDate: row.start_date,
      endDate: row.end_date,
      zipCodes: row.target_zip_codes ?? [],
      coverageRadiusMiles: Number(row.coverage_radius_miles),
      tier: row.tier,
      distanceMiles:
        link?.distance_miles == null
          ? Number.MAX_SAFE_INTEGER
          : Number(link.distance_miles),
      impressions: Number(row.impression_count ?? 0),
      destinationUrl: row.destination_url ?? '',
    }
  })

  const selected = selectSponsor(
    {
      placement,
      zipCode: parsedZip.data,
      currentDate: today,
    },
    candidates,
  )

  if (!selected) return null

  return {
    id: selected.id,
    business_name: selected.name,
    destination_url: selected.destinationUrl,
  }
}