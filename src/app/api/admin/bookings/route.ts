import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)

  if (!bearer || !authorization) {
    return NextResponse.json({ error: 'Sign-in is required.' }, { status: 401 })
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
    const userClient = createClient(url, key, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: authData, error: authError } =
      await userClient.auth.getUser(bearer[1])

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sign-in is required.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Administrator access required.' },
        { status: 403 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id, service_id, client_email, requested_date, notes, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin bookings query error:', error)
      return NextResponse.json(
        { error: 'Could not retrieve bookings.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Admin bookings route error:', error)
    return NextResponse.json(
      { error: 'Server configuration or request error.' },
      { status: 500 },
    )
  }
}