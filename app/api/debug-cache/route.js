import { getCachedPeerInstitution } from '@/lib/cache';
import { PEER_CANDIDATES } from '@/lib/peer-candidates';
import { NextResponse } from 'next/server';

export async function GET() {
  const results = [];
  for (const c of PEER_CANDIDATES) {
    const cached = await getCachedPeerInstitution(c.name);
    results.push({ institution: c.name, cached: !!cached });
  }
  return NextResponse.json({ results });
}
