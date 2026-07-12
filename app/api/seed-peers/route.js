import { setCachedPeerInstitution } from '@/lib/cache';
import { NextResponse } from 'next/server';

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
    summary: 'MAHE is ISO 14001/50001 certified and publishes an annual sustainability report tracking Scope 1 and 2 carbon emissions. It is ranked No. 1 in India (117th globally) on the UI GreenMetric World University Ranking 2025, and has committed to Net Zero by 2040.',
    programs: [
      { name: 'Wastewater recycling', description: 'Seven sewage treatment plants with a combined capacity of 7,405 cubic meters/day; treated water is fully reused for gardening and arboriculture.' },
      { name: 'Solar water heating', description: 'Total installed solar water heater capacity of 4 lakh (400,000) litres/day.' },
    ],
    source_urls: [
      'https://www.manipal.edu/mu/important-links/green-manipal.html',
      'https://www.manipal.edu/content/dam/manipal/mu/documents/mahe/green-manipal/MAHE%20Sustainability%20Report%202024-25.pdf',
    ],
    verified_metrics: [
      { metric: 'Total campus electricity consumption (annual, FY2024-25)', value: 84136221, unit: 'kWh/year', source_url: 'https://www.manipal.edu/mu/important-links/green-manipal.html' },
      { metric: 'Sewage treatment capacity', value: 7405, unit: 'cubic meters/day', source_url: 'https://www.manipal.edu/mu/important-links/green-manipal.html' },
    ],
  },
  {
    institution: 'Amrita Vishwa Vidyapeetham',
    type: 'comparable',
    summary: 'Amrita received IGBC Platinum certification (November 2023) under the Green Campus Rating System and operates a real-time building energy monitoring and carbon monitoring system, per its official SDG-7 energy disclosures.',
    programs: [
      { name: 'Smart building energy monitoring', description: 'Real-time dashboard tracking Energy Use Intensity (EUI), Power Usage Effectiveness (PUE), and building-level carbon footprint, enabling remote optimization of consumption.' },
    ],
    source_urls: ['https://www.amrita.edu/unsdg-25/sdg7/energy-wastage-identification/'],
    verified_metrics: [
      { metric: 'Annual energy savings from monitoring system', value: 379200, unit: 'kWh/year', source_url: 'https://www.amrita.edu/unsdg-25/sdg7/energy-wastage-identification/' },
    ],
  },
  {
    institution: 'Shoolini University',
    type: 'comparable',
    summary: 'Shoolini University has set a target of full carbon neutrality by 2025 under its 2019 Energy and Environment Policy, and publishes UN SDG status reports documenting its solar generation and campus emissions, verified by a dedicated Centre of Excellence in Energy Science and Technology.',
    programs: [
      { name: 'Rooftop solar PV', description: '400 kWp rooftop photovoltaic power plant; in 2022 the campus used 6,422 GJ of electrical energy and generated 1,476.4 GJ from solar, offsetting roughly 334,237 kg of CO2.' },
      { name: 'Wastewater treatment + reuse', description: 'Sewage Treatment Plant of 350,000 lpd capacity and Effluent Treatment Plant of 50,000 lpd capacity; recycled water is used for garden and field irrigation.' },
    ],
    source_urls: ['https://shooliniuniversity.com/media/pdf/iqac2024/SDG-13-Status-Report-2023-.pdf'],
    verified_metrics: [
      { metric: 'Rooftop solar capacity', value: 400, unit: 'kWp', source_url: 'https://shooliniuniversity.com/media/pdf/iqac2024/SDG-13-Status-Report-2023-.pdf' },
      { metric: 'Solar generation (2022)', value: 410111, unit: 'kWh/year', source_url: 'https://shooliniuniversity.com/media/pdf/iqac2024/SDG-13-Status-Report-2023-.pdf' },
    ],
  },
  {
    institution: 'SRM Institute of Science and Technology',
    type: 'comparable',
    summary: "A third-party Green (Environmental) and Energy Audit for SRM University's Delhi-NCR (Sonepat) campus — one of SRM's constituent campuses — documents 100% LED lighting, rooftop solar generation, and STP-based wastewater reuse. Figures below are specific to the Delhi-NCR campus rather than the flagship Kattankulathur campus.",
    programs: [
      { name: 'Rooftop solar + LED lighting', description: '100 kW of renewable rooftop solar capacity supplementing grid electricity, alongside 100% LED lighting campus-wide.' },
      { name: 'Wastewater treatment + biogas', description: 'Sewage Treatment Plants recycle wastewater for campus reuse; biodegradable canteen/mess waste is processed via an on-site biogas plant.' },
    ],
    source_urls: ['https://srmuniversity.ac.in/iqac/DOC/NAAC%20Criterion-7/7.1.6_A/7.1.6_2.%20SRM%20ECO%20AUDIT%20Report.pdf'],
    verified_metrics: [
      { metric: 'Rooftop solar capacity (Delhi-NCR campus)', value: 100, unit: 'kW', source_url: 'https://srmuniversity.ac.in/iqac/DOC/NAAC%20Criterion-7/7.1.6_A/7.1.6_2.%20SRM%20ECO%20AUDIT%20Report.pdf' },
    ],
  },
  {
    institution: 'Chandigarh University',
    type: 'comparable',
    summary: "Chandigarh University's official PPCB environmental compliance filing documents its water, wastewater, and solid waste handling systems, along with an approved 1,800 KW solar power plant expansion aimed at making the campus fully solar-powered.",
    programs: [
      { name: 'Wastewater treatment + reuse', description: 'STP of 1,500 KLD capacity treats 1,224 KLD of wastewater generated; 400 KLD of total water demand is met via recycled treated wastewater.' },
      { name: 'Solar power plant expansion', description: 'An additional 1,800 KW solar power plant has been approved, targeting a fully solar-powered campus with no grid electricity usage.' },
    ],
    source_urls: ['https://www.cuchd.in/ppcb-report/report.pdf'],
    verified_metrics: [
      { metric: 'Total water requirement', value: 1530, unit: 'KLD', source_url: 'https://www.cuchd.in/ppcb-report/report.pdf' },
      { metric: 'Wastewater treated', value: 1224, unit: 'KLD', source_url: 'https://www.cuchd.in/ppcb-report/report.pdf' },
      { metric: 'Solid waste generated', value: 6200, unit: 'kg/day', source_url: 'https://www.cuchd.in/ppcb-report/report.pdf' },
    ],
  },
  {
    institution: 'KIIT (Kalinga Institute of Industrial Technology)',
    type: 'comparable',
    summary: "KIIT's official third-party Green & Energy Audit Report 2023-24 documents extensive rooftop solar generation, solar water heating, and biogas-based waste-to-energy systems across its campuses.",
    programs: [
      { name: 'Rooftop solar power', description: 'Grid-interactive rooftop solar system of 1,050 KWp capacity, meeting roughly 12% of daytime power demand; generated 1,374,227 kWh in FY2022-23.' },
      { name: 'Solar water heating', description: 'Installed solar water heating capacity of 107,000 litres/day across hostels, saving an estimated 1,605,000 kWh of electricity per year.' },
      { name: 'Biogas from organic waste', description: 'Four biogas plants of 500 kg/day capacity each, processing hostel and canteen organic waste to supplement kitchen fuel needs.' },
    ],
    source_urls: ['https://sustainability.kiit.ac.in/wp-content/uploads/2025/10/KIIT-Green-Audit-Report-2023-24.pdf'],
    verified_metrics: [
      { metric: 'Rooftop solar capacity', value: 1050, unit: 'kWp', source_url: 'https://sustainability.kiit.ac.in/wp-content/uploads/2025/10/KIIT-Green-Audit-Report-2023-24.pdf' },
      { metric: 'Solar generation (FY2022-23)', value: 1374227, unit: 'kWh/year', source_url: 'https://sustainability.kiit.ac.in/wp-content/uploads/2025/10/KIIT-Green-Audit-Report-2023-24.pdf' },
    ],
  },
  {
    institution: 'BITS Pilani',
    type: 'comparable',
    summary: 'BITS Pilani runs an active sustainability program covering on-site solar power, scientific wastewater treatment with reuse for irrigation and flushing, and source-segregated waste handling including a biogas plant and composter for wet waste, per its official campus sustainability disclosures and 2022-23 Green Assessment Report.',
    programs: [
      { name: 'Water recycling', description: 'Treated wastewater is reused for garden irrigation; sludge from treatment is dried and used as manure.' },
      { name: 'Wet waste biogas + composting', description: 'On-site biogas plant and composter process wet waste with roughly 1-tonne daily capacity each; dry waste is source-segregated and handed to an approved recycler.' },
    ],
    source_urls: [
      'https://www.bits-pilani.ac.in/about/sustainability/',
      'https://www.bits-pilani.ac.in/wp-content/uploads/BITS-Pilani-Energy-Environment-Green-Assessment-Report-2022-23.pdf',
    ],
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
