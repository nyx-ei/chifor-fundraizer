import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env/server-env';
import { refreshRegistryVerifications } from '@/lib/registry/refresh';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  if (env.CRON_SECRET === undefined || env.CRON_SECRET.length === 0) {
    return false;
  }

  return request.headers.get('authorization') === `Bearer ${env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ code: 'KMG-AUTH-403' }, { status: 403 });
  }

  const result = await refreshRegistryVerifications();
  return NextResponse.json(result);
}
