import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { serviceContractSchema } from '@/schemas/service';

// GET Handler: Retrieves approved public service listings
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('services')
      .select('id, title, hourly_rate, duration_minutes, coverage_radius_miles')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// POST Handler: Validates payload and creates service draft
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate payload against strict Zod schema contract
    const validationResult = serviceContractSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed: Invalid request body structure or types.',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validPayload = validationResult.data;

    // 2. Perform parameterized database insert via Supabase server client
    const { data, error } = await supabaseServer
      .from('services')
      .insert([validPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid JSON body in request.' }, { status: 400 });
  }
}