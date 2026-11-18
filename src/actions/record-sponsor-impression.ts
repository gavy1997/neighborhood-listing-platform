import 'server-only'

import { z } from 'zod'
import { supabaseAdmin } from '../lib/supabase-server'

const ImpressionSchema = z.object({
  sponsorId: z.string().uuid(),
  placement: z.string().trim().min(1).max(80),
  pageContext: z.enum(['home', 'property_detail', 'services']),
})

export async function recordSponsorImpression(input: unknown) {
  const parsed = ImpressionSchema.safeParse(input)
  if (!parsed.success) return

  const { error } = await supabaseAdmin.rpc('record_sponsor_impression', {
    p_sponsor_id: parsed.data.sponsorId,
    p_placement: parsed.data.placement,
    p_page_context: parsed.data.pageContext,
  })

  if (error) {
    console.error('Sponsor impression could not be recorded:', error)
  }
}