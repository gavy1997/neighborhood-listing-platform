import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-server'
import { SponsorDestinationUrlSchema } from '@/lib/sponsorUrl'

const SponsorIdSchema = z.string().uuid()

export async function GET(request: Request) {
  const sponsorId = new URL(request.url).searchParams.get('sponsor_id')
  const parsedId = SponsorIdSchema.safeParse(sponsorId)

  if (!parsedId.success) {
    return NextResponse.json(
      { error: 'A valid sponsor_id is required.' },
      { status: 400 },
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  const { data: sponsor, error } = await supabaseAdmin
    .from('sponsors')
    .select('destination_url')
    .eq('id', parsedId.data)
    .eq('status', 'APPROVED')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .maybeSingle()

  if (error) {
    console.error('Sponsor redirect lookup failed:', error)
    return NextResponse.json(
      { error: 'Could not verify sponsor.' },
      { status: 500 },
    )
  }

  if (!sponsor) {
    return NextResponse.json(
      { error: 'Sponsor is not eligible for redirect.' },
      { status: 404 },
    )
  }

  const parsedUrl = SponsorDestinationUrlSchema.safeParse(
    sponsor.destination_url,
  )

  if (!parsedUrl.success) {
    return NextResponse.json(
      { error: 'Sponsor destination URL is unsafe.' },
      { status: 502 },
    )
  }

  return NextResponse.redirect(parsedUrl.data, 302)
}