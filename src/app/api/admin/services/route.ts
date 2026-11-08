import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-server'

export async function PATCH(request: Request) {
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

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 },
      )
    }

    const serviceId =
      typeof body === 'object' && body !== null && 'service_id' in body
        ? (body as { service_id?: unknown }).service_id
        : undefined

    if (
      typeof serviceId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        serviceId,
      )
    ) {
      return NextResponse.json(
        { error: 'A valid service_id is required.' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ status: 'approved' })
      .eq('id', serviceId)
      .eq('status', 'draft')
      .select('id, status')
      .maybeSingle()

    if (error) {
      console.error('Admin service approval error:', error)
      return NextResponse.json(
        { error: 'Could not approve service.' },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Draft service not found.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Admin service approval route error:', error)
    return NextResponse.json(
      { error: 'Server configuration or request error.' },
      { status: 500 },
    )
  }
}