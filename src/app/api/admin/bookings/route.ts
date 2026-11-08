// 1. Tell Next.js to render this route dynamically on request, preventing build-time static evaluation
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
// 2. Import using camelCase matching your actual file (src/lib/supabaseServer.ts)
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('bookings')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
