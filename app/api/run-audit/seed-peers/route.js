import { setCachedPeerInstitution } from '@/lib/cache';
import { NextResponse } from 'next/server';

// One-time manual seed for the peer cache, given free-tier quota pressure
// ahead of a live demo. Only include metrics you've personally verified
// against a real public source — leave verified_metrics empty rather than
// guessing, same rule your Peer Research agent follows.
const SEED_DATA = [
  {
    institution: 'Vellore Institute of Technology (VIT)',
    type: 'comparable',
    summary: 'VIT operates a documented sustainability program including rooftop solar generation and hazardous waste management compliant with CPCB guidelines, per its official Environmental Audit 2024.',
    programs: [
      { name: 'Rooftop Solar + Water Heating', description: '2,813.3 kWp installed solar capacity across building rooftops, generating an average of ~420,000 units/month, supplemented by wind energy procurement agreements.' },
    ],
    source_urls: ['https://vit.ac.in/files/sustainability-initiatives/Environmental-Audit-2024.pdf'],
    verified_metrics: [
      { metric: 'Solar generation (monthly average)', value: 420000, unit: 'kWh/month', source_url: 'https://vit.ac.in/files/sustainability-initiatives/Environmental-Audit-2024.pdf' },
    ],
  },
  {
    institution: 'Manipal Academy of Higher Education (MAHE)',
    type: 'comparable',
    summary: '',
    programs: [],
    source_urls: [],
    verified_metrics: [],
  },
  {
    institution: 'Amrita Vishwa Vidyapeetham',
    type: 'comparable',
    summary: '',
    programs: [],
    source_urls: [],
    verified_metrics: [],
  },
  {
    institution: 'Shoolini University',
    type: 'comparable',
    summary: '',
    programs: [],
    source_urls: [],
    verified_metrics: [],
  },
  {
    institution: 'SRM Institute of Science and Technology',
    type: 'comparable',
    summary: '',
    programs: [],
    source_urls: [],
    verified_metrics: [],
  },
  {
    institution: 'Chandigarh University',
    type: 'comparable',
    summary: '',
    programs: [],
    source_urls: [],
    verified_metrics: [],
  },
  {
    institution: 'KIIT (Kalinga Institute of Industrial Technology)',
    type: 'comparable',
    summary: '',
    programs: [],
    source_urls: [],
    verified_metrics: [],
  },
  {
    institution: 'BITS Pilani',
    type: 'comparable',
    summary: '',
    programs: [],
    source_urls: [],
    verified_metrics: [],
  },
];

export async function GET() {
  const results = [];
  for (const entry of SEED_DATA) {
    if (!entry.summary) {
      results.push({ institution: entry.institution, skipped: true, reason: 'no verified data yet' });
      continue;
    }
    await setCachedPeerInstitution(entry.institution, entry);
    results.push({ institution: entry.institution, seeded: true });
  }
  return NextResponse.json({ results });
}
