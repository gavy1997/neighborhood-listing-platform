export const dynamic = "force-static";
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
  const anonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY

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
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  const parsed = PropertyInsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid listing data.', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const supabase = createUserClient(authorization)
    const { data: authData, error: authError } =
      await supabase.auth.getUser(bearer[1])

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Sign-in is required.' },
        { status: 401 },
      )
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
import { NextResponse } from 'next/server';
import { createServiceSchema } from '@/schemas/service';
import { createClient } from '@supabase/supabase-js';

// Client initialization using standard user authorization contexts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch approved services selecting public fields only
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, hourly_rate, duration_minutes, coverage_radius_miles')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: services }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
    }

    const body = await request.json();

    // 1. Runtime schema validation using strict Zod contract
    const validationResult = createServiceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Bad Request: Invalid or unexpected payload',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. Authenticated user Supabase instance
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized user session' }, { status: 401 });
    }

    // 3. Insertion with parameterization & status defaulting to draft
    const { data: newService, error: dbError } = await supabase
      .from('services')
      .insert([
        {
          provider_id: user.id,
          title: validationResult.data.title,
          hourly_rate: validationResult.data.hourly_rate,
          duration_minutes: validationResult.data.duration_minutes,
          coverage_radius_miles: validationResult.data.coverage_radius_miles,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ data: newService }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
