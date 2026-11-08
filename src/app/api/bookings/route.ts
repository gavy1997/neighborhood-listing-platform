import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const BookingSchema = z
  .object({
    service_id: z.string().uuid(),
    client_email: z.string().trim().email().max(254),
    requested_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`)
        return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
      }),
    notes: z.string().trim().min(10).max(2000),
  })
  .strict()

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  const parsed = BookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid booking details.', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const url = process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return NextResponse.json(
      { error: 'Server configuration is missing.' },
      { status: 500 },
    )
  }

  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { error } = await supabase.from('bookings').insert({
      service_id: parsed.data.service_id,
      client_email: parsed.data.client_email,
      requested_date: parsed.data.requested_date,
      notes: parsed.data.notes,
    })

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json(
        { error: 'Could not submit booking request.' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { message: 'Booking request submitted.' },
      { status: 201 },
    )
  } catch (error) {
    console.error('Booking route error:', error)
    return NextResponse.json(
      { error: 'Server configuration or request error.' },
      { status: 500 },
    )
  }
}