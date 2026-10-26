import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-server';

// GET: Retrieve approved listings securely
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('id, title, description, approved, created_at')
      .eq('approved', true);

    if (error) {
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new listing securely with validation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, owner_id } = body;

    if (!title || !owner_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title and owner_id are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert([
        {
          title,
          description: description || '',
          owner_id,
          approved: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}