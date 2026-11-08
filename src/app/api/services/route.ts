import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { ServiceCreateSchema } from '../../../schemas/service'

function createUserClient(authorization?: string) {
  const url = process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error('Supabase server configuration is missing.')
  }

  return createClient(url, key, {
    ...(authorization
      ? { global: { headers: { Authorization: authorization } } }
      : {}),
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function GET() {
  try {
    const supabase = createUserClient()
    const { data, error } = await supabase
      .from('services')
      .select(
        'id, provider_id, title, description, neighborhood, coverage_radius_miles, price, status, created_at',
      )
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Could not retrieve services.' },
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
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  const parsed = ServiceCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid service data.', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const supabase = createUserClient(authorization ?? undefined)
    const { data: authData, error: authError } =
      await supabase.auth.getUser(bearer[1])

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sign-in is required.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'provider') {
      return NextResponse.json(
        { error: 'A provider account is required to create a service.' },
        { status: 403 },
      )
    }

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        provider_id: authData.user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        neighborhood: parsed.data.neighborhood,
        coverage_radius_miles: parsed.data.coverage_radius_miles,
        price: parsed.data.price,
        status: 'draft',
      })
      .select(
        'id, provider_id, title, description, neighborhood, coverage_radius_miles, price, status, created_at',
      )
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Could not create service.' },
        { status: 403 },
      )
    }

    const mappings = parsed.data.category_ids.map((category_id) => ({
      service_id: service.id,
      category_id,
    }))

    const { error: mappingError } = await supabase
      .from('service_category_mappings')
      .insert(mappings)

    if (mappingError) {
      await supabase
        .from('services')
        .delete()
        .eq('id', service.id)

      return NextResponse.json(
        { error: 'Could not assign the service categories.' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { data: { ...service, category_ids: parsed.data.category_ids } },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Server configuration or request error.' },
      { status: 500 },
    )
  }
}