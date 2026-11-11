export interface HealthcareInfrastructureTier {
  id: number;
  category: 'Government Healthcare' | 'Private Healthcare' | 'Outpatient / Primary Care';
  title: string;
  count: string;
  examples: string[];
  color: string;
  borderColor: string;
  bgLight: string;
}

export interface KolkataMasterZone {
  id: string;
  name: string;
  shortName: string;
  description: string;
  neighborhoods: string[];
  kmcBoroughs: string[];
  keyHospitals: {
    name: string;
    type: 'Govt' | 'Private' | 'Trust';
    specialty?: string;
    hospitalId?: string;
  }[];
  densityProfile: string;
  color: string;
}

export const HEALTHCARE_INFRASTRUCTURE_TIERS: HealthcareInfrastructureTier[] = [
  {
    id: 1,
    category: 'Government Healthcare',
    title: 'Major Medical Colleges & Teaching Hospitals',
    count: '10+',
    examples: [
      'IPGMER / SSKM Hospital',
      'Medical College Kolkata',
      'RG Kar Medical College',
      'NRS Medical College',
      'Calcutta National Medical College',
    ],
    color: 'emerald',
    borderColor: 'border-emerald-300',
    bgLight: 'bg-emerald-50',
  },
  {
    id: 2,
    category: 'Government Healthcare',
    title: 'District, Sub-divisional & Specialized Hospitals',
    count: '30+',
    examples: [
      'M.R. Bangur Hospital',
      'Sambhunath Pandit Hospital',
      'Beliaghata ID Hospital',
      'Baghajatin State General Hospital',
    ],
    color: 'teal',
    borderColor: 'border-teal-300',
    bgLight: 'bg-teal-50',
  },
  {
    id: 3,
    category: 'Government Healthcare',
    title: 'Urban Primary Health Centres (UPHCs) & Ward Clinics',
    count: '140+',
    examples: [
      'Kolkata Municipal Corporation (KMC) Health Units',
      'Local Ward Dispensaries',
    ],
    color: 'cyan',
    borderColor: 'border-cyan-300',
    bgLight: 'bg-cyan-50',
  },
  {
    id: 4,
    category: 'Private Healthcare',
    title: 'Corporate Super-Specialty Hospitals',
    count: '40 - 50',
    examples: [
      'Apollo Multispeciality Hospital',
      'CMRI Hospital',
      'Manipal Hospitals (Broadway/Dhakuria/Salt Lake)',
      'Narayana RN Tagore',
      'Fortis Hospital',
      'Peerless Hospital',
    ],
    color: 'blue',
    borderColor: 'border-blue-300',
    bgLight: 'bg-blue-50',
  },
  {
    id: 5,
    category: 'Private Healthcare',
    title: 'Registered Private Nursing Homes',
    count: '150+',
    examples: [
      'Belle Vue Clinic',
      'Midland Nursing Home',
      'Daffodil Nursing Home',
      'Dreamland Nursing Home',
    ],
    color: 'amber',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50',
  },
  {
    id: 6,
    category: 'Outpatient / Primary Care',
    title: 'Standalone Private Clinics & Doctor Chambers',
    count: '3,500+',
    examples: [
      'Apollo Clinic',
      'Fortis Medical Centre',
      'Local Independent Polyclinics',
      'Individual Doctor Chambers',
    ],
    color: 'purple',
    borderColor: 'border-purple-300',
    bgLight: 'bg-purple-50',
  },
];

export const KOLKATA_MASTER_ZONES: KolkataMasterZone[] = [
  {
    id: 'ZONE_NORTH_KOLKATA',
    name: 'North Kolkata',
    shortName: 'North Zone',
    description: 'Historical and traditional core of the city.',
    neighborhoods: [
      'Shyambazar',
      'Hatibagan',
      'Sovabazar',
      'Chitpur',
      'Bagbazar',
      'Cossipore',
      'Dum Dum (part)',
    ],
    kmcBoroughs: ['Borough 1', 'Borough 2', 'Borough 4 (part)', 'Borough 5 (part)'],
    keyHospitals: [
      { name: 'R.G. Kar Medical College & Hospital', type: 'Govt', hospitalId: 'HOSP_RGKAR_KOL' },
      { name: 'NRS Medical College & Hospital', type: 'Govt', hospitalId: 'HOSP_NRS_KOL' },
      { name: 'Marwari Relief Society Hospital', type: 'Trust', hospitalId: 'HOSP_MARWARI_RELIEF_KOL' },
      { name: 'Daffodil Nursing Home', type: 'Private', hospitalId: 'HOSP_DAFFODIL_NH_KOL' },
      { name: 'Midland Nursing Home', type: 'Private', hospitalId: 'HOSP_MIDLAND_NH_KOL' },
      { name: 'Dreamland Nursing Home', type: 'Private', hospitalId: 'HOSP_DREAMLAND_NH_KOL' },
    ],
    densityProfile:
      'High density of historical government medical institutions and older standalone private family doctor clinics.',
    color: 'rose',
  },
  {
    id: 'ZONE_CENTRAL_KOLKATA',
    name: 'Central Kolkata',
    shortName: 'Central Zone',
    description: 'Main commercial, administrative, and institutional hub.',
    neighborhoods: [
      'B.B.D. Bagh (Dalhousie Square)',
      'Esplanade',
      'Park Street',
      'Bowbazar',
      'Burrabazar',
      'Sealdah',
      'Entally',
    ],
    kmcBoroughs: ['Borough 4 (part)', 'Borough 5 (part)', 'Borough 6', 'Borough 7 (part)'],
    keyHospitals: [
      { name: 'Medical College Kolkata', type: 'Govt', hospitalId: 'HOSP_MCH_KOL' },
      { name: 'Calcutta National Medical College', type: 'Govt', hospitalId: 'HOSP_CNMC_KOL' },
      { name: 'Sambhunath Pandit Hospital', type: 'Govt', hospitalId: 'HOSP_SAMBHUNATH_KOL' },
      { name: 'Belle Vue Clinic', type: 'Private', hospitalId: 'HOSP_BELLEVUE_KOL' },
      { name: 'Fortis Medical Centre', type: 'Private', hospitalId: 'HOSP_FORTIS_MED_CENTRE' },
    ],
    densityProfile:
      'Dense cluster of premier heritage apex government hospitals alongside luxury corporate diagnostic clinics.',
    color: 'amber',
  },
  {
    id: 'ZONE_SOUTH_KOLKATA',
    name: 'South Kolkata',
    shortName: 'South Zone',
    description: 'Upscale residential zones, premium cultural and market centers.',
    neighborhoods: [
      'Ballygunge',
      'Gariahat',
      'Jadavpur',
      'Tollygunge',
      'Alipore',
      'Bhawanipur',
      'Behala',
      'Dhakuria',
      'Garia',
    ],
    kmcBoroughs: [
      'Borough 8',
      'Borough 9',
      'Borough 10',
      'Borough 11',
      'Borough 12',
      'Borough 13',
      'Borough 14',
    ],
    keyHospitals: [
      { name: 'IPGMER & SSKM Hospital', type: 'Govt', hospitalId: 'HOSP_SSKM_KOL' },
      { name: 'M.R. Bangur Hospital', type: 'Govt', hospitalId: 'HOSP_MRBANGUR_TOLLYGUNGE' },
      { name: 'Baghajatin State General Hospital', type: 'Govt', hospitalId: 'HOSP_BAGHAJATIN_SGH' },
      { name: 'CMRI Hospital', type: 'Private', hospitalId: 'HOSP_CMRI_KOL' },
      { name: 'Kothari Medical Centre', type: 'Trust', hospitalId: 'HOSP_KOTHARI_ALIPORE' },
      { name: 'Manipal Hospital Dhakuria (AMRI)', type: 'Private', hospitalId: 'HOSP_MANIPAL_DHAKURIA' },
      { name: 'Peerless Hospital', type: 'Private', hospitalId: 'HOSP_PEERLESS_KOL' },
    ],
    densityProfile:
      'Extremely high concentration of major private tertiary-care multispecialty corporate hospitals and extensive residential nursing homes.',
    color: 'emerald',
  },
  {
    id: 'ZONE_EAST_KOLKATA',
    name: 'East Kolkata',
    shortName: 'East Corridor',
    description: 'Modern planned townships, IT corridors, and rapid real estate expansion.',
    neighborhoods: [
      'Salt Lake (Bidhannagar)',
      'New Town',
      'Rajarhat',
      'Mukundapur',
      'Anandapur',
      'Tangra',
      'Topsia',
    ],
    kmcBoroughs: [
      'Borough 7 (part)',
      'Borough 12 (part)',
      'Bidhannagar Municipal Corp',
      'NKDA (New Town)',
    ],
    keyHospitals: [
      { name: 'Apollo Multispeciality Hospital', type: 'Private', hospitalId: 'HOSP_APOLLO_KOL' },
      { name: 'Narayana RN Tagore Hospital (RTIICS)', type: 'Private', hospitalId: 'HOSP_RTIICS_KOL' },
      { name: 'Manipal Hospital Salt Lake', type: 'Private', hospitalId: 'HOSP_MANIPAL_SL' },
      { name: 'Manipal Hospital Broadway', type: 'Private', hospitalId: 'HOSP_MANIPAL_BROADWAY' },
      { name: 'Tata Medical Center', type: 'Trust', specialty: 'Oncology', hospitalId: 'HOSP_TMC_KOL' },
      { name: 'Fortis Hospital Anandapur', type: 'Private', hospitalId: 'HOSP_FORTIS_KOL' },
      { name: 'Beliaghata ID Hospital', type: 'Govt', hospitalId: 'HOSP_BELIAGHATA_ID' },
    ],
    densityProfile:
      'The modern healthcare corridor of Kolkata, dominated by huge sprawling private corporate super-specialty hospitals.',
    color: 'blue',
  },
  {
    id: 'ZONE_WEST_KOLKATA_SUBURBS',
    name: 'West Kolkata & Suburbs (Greater KMA)',
    shortName: 'West & Howrah',
    description: 'Stretches along the Hooghly River, industrial belts, and connected municipal corporations.',
    neighborhoods: [
      'Howrah City',
      'Bally',
      'Shalimar',
      'Sankrail',
      'Garden Reach',
      'Metiabruz',
      'Chandernagore',
      'Kamarhati',
    ],
    kmcBoroughs: [
      'Borough 15',
      'Borough 16',
      'Howrah Municipal Corp',
      'Hooghly Municipalities',
    ],
    keyHospitals: [
      { name: 'Howrah State General Hospital', type: 'Govt', hospitalId: 'HOSP_HOWRAH_SGH' },
      { name: 'Garden Reach State General Hospital', type: 'Govt', hospitalId: 'HOSP_GARDEN_REACH_SGH' },
      { name: 'Narayana Superspeciality Hospital Howrah', type: 'Private', hospitalId: 'HOSP_NARAYANA_HOWRAH' },
      { name: 'ILS Hospitals Howrah', type: 'Private', hospitalId: 'HOSP_ILS_HOWRAH' },
    ],
    densityProfile:
      'Industrial zone with large government state-general systems mixed with rapidly developing regional private multispecialty facilities.',
    color: 'purple',
  },
];
