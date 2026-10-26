<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-server';
=======
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const PropertyInsertSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
    street: z.string().trim().min(1),
    city: z.string().trim().min(1),
    state: z.string().regex(/^[A-Z]{2}$/),
    zip_code: z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/),
    price: z.number().finite().nonnegative(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().finite().nonnegative(),
    square_feet: z.number().int().nonnegative(),
    amenities: z.array(z.string().trim().min(1)).default([]),
    image_url: z.string().url().optional(),
  })
  .strict()

function createUserClient(authorization?: string) {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase server configuration is missing.')
  }

  return createClient(url, anonKey, {
    ...(authorization
      ? { global: { headers: { Authorization: authorization } } }
      : {}),
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
>>>>>>> origin/main

export async function GET() {
  try {
    const supabase = createUserClient()
    const { data, error } = await supabase
      .from('properties')
      .select(
        'id, title, description, street, city, state, zip_code, price, bedrooms, bathrooms, square_feet, amenities, image_url, approved, created_at',
      )
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Could not retrieve listings.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Server configuration or request error.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization')
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)

  if (!bearer) {
    return NextResponse.json({ error: 'Sign-in is required.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = PropertyInsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid listing data.', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const supabase = createUserClient(authorization!)
    const { data: authData, error: authError } = await supabase.auth.getUser(bearer[1])

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sign-in is required.' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...parsed.data,
        description: parsed.data.description ?? '',
        owner_id: authData.user.id,
        approved: false,
      })
      .select(
        'id, title, description, street, city, state, zip_code, price, bedrooms, bathrooms, square_feet, amenities, image_url, approved, created_at',
      )
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Could not create listing.' },
        { status: 403 },
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Server configuration or request error.' },
      { status: 500 },
    )
  }
}