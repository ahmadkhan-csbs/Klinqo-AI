'use client';

import React, { useState, useMemo } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { HospitalWithScore, EquipmentCode } from '@/types/medical';
import { formatINR } from '@/utils/scoringEngine';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  PhoneCall,
  FileCheck,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Info,
  QrCode,
  HeartPulse,
  Radio,
  Zap,
  X,
} from 'lucide-react';

interface CityMapConfig {
  name: string;
  homeCoords: { x: number; y: number; label: string };
  pinA: {
    hospitalId: string;
    name: string;
    type: string;
    coords: { x: number; y: number };
    distanceKm: number;
    etaMinutes: number;
    warning: string;
    missingMachines: string[];
    costPenalty: string;
  };
  pinB: {
    hospitalId: string;
    name: string;
    type: string;
    coords: { x: number; y: number };
    distanceKm: number;
    etaMinutes: number;
    status: string;
    headline: string;
    operationalRate: string;
  };
  pinC: {
    hospitalId: string;
    name: string;
    type: string;
    coords: { x: number; y: number };
    distanceKm: number;
    etaMinutes: number;
    headline: string;
    savingPct: string;
  };
}

const CITY_MAP_DATA: Record<string, CityMapConfig> = {
  Kolkata: {
    name: 'Kolkata Metropolitan Area',
    homeCoords: { x: 420, y: 310, label: 'Patient Home (Salt Lake Sector V)' },
    pinA: {
      hospitalId: 'HOSP_GHOSH_NH_KOL',
      name: 'Ghosh Medicare & Nursing Home (Barasat)',
      type: 'Local Nursing Home / Secondary',
      coords: { x: 340, y: 190 },
      distanceKm: 2.1,
      etaMinutes: 8,
      warning:
        'DO NOT VISIT FOR THIS CONDITION: Missing LINAC & PET-CT. Visiting here wastes 90+ mins in emergency transfer and ₹8,000 in duplicate ambulance/admission charges.',
      missingMachines: ['PET_CT', 'LINAC_RADIATION', 'BRACHYTHERAPY', 'CATH_LAB'],
      costPenalty: '₹8,000 – ₹25,000 wasted in non-refundable admission deposits',
    },
    pinB: {
      hospitalId: 'HOSP_TMC_KOL',
      name: 'Tata Medical Center (Rajarhat)',
      type: 'Verified Tertiary Oncology & SuperSpecialty',
      coords: { x: 620, y: 220 },
      distanceKm: 6.8,
      etaMinutes: 19,
      status: 'OPTIMAL DIRECT ROUTE (19 mins ETA)',
      headline: '100% Mandatory Equipment Operational. Direct admission to Specialist Unit.',
      operationalRate: '100% Modalities Active (Varian TrueBeam & Siemens PET-CT)',
    },
    pinC: {
      hospitalId: 'HOSP_SSKM_KOL',
      name: 'IPGMER & SSKM Hospital (Bhowanipore)',
      type: 'Apex State Teaching Institute',
      coords: { x: 260, y: 440 },
      distanceKm: 9.4,
      etaMinutes: 26,
      headline: 'SMART BUDGET ALTERNATIVE: 100% Equipment Match at 85% lower cost under Swasthya Sathi.',
      savingPct: '₹0 Cashless under Swasthya Sathi / PM-JAY',
    },
  },
  'Delhi-NCR': {
    name: 'Delhi-NCR Capital Region',
    homeCoords: { x: 400, y: 300, label: 'Patient Home (Lajpat Nagar IV)' },
    pinA: {
      hospitalId: 'HOSP_SHANTI_DEL',
      name: 'Shanti Polyclinic Daycare (East of Kailash)',
      type: 'Daycare Nursing Home',
      coords: { x: 330, y: 230 },
      distanceKm: 2.4,
      etaMinutes: 9,
      warning:
        'DO NOT VISIT FOR THIS CONDITION: Lacks Cath Lab, 3T MRI & High-Energy Radiotherapy. Diversion will be required.',
      missingMachines: ['CATH_LAB', 'LINAC_RADIATION', 'PET_CT', 'ECMO'],
      costPenalty: '₹12,000 duplicate day-care observation charge',
    },
    pinB: {
      hospitalId: 'HOSP_AIIMS_DEL',
      name: 'AIIMS New Delhi (Ansari Nagar)',
      type: 'Apex Central Institute',
      coords: { x: 580, y: 240 },
      distanceKm: 6.5,
      etaMinutes: 18,
      status: 'OPTIMAL DIRECT ROUTE (18 mins ETA)',
      headline: 'National Reference Center: All diagnostic & surgical modalities online 24x7.',
      operationalRate: 'Apex Research Infrastructure',
    },
    pinC: {
      hospitalId: 'HOSP_MEDANTA_DEL',
      name: 'Medanta - The Medicity (Sector 38)',
      type: 'Quaternary Corporate Center',
      coords: { x: 280, y: 470 },
      distanceKm: 14.2,
      etaMinutes: 28,
      headline: 'HIGH-ACUITY IMMEDIATE ADMISSION: 5 Cath Labs & Dedicated ECMO Units.',
      savingPct: '100% Cashless TPA & PM-JAY Empanelled',
    },
  },
  Mumbai: {
    name: 'Mumbai Metropolitan Region',
    homeCoords: { x: 390, y: 290, label: 'Patient Home (Dadar TT Circle)' },
    pinA: {
      hospitalId: 'HOSP_GHOSH_NH_KOL', // Generic representation
      name: 'Local Matunga Nursing Home',
      type: 'Primary Nursing Home',
      coords: { x: 330, y: 210 },
      distanceKm: 1.8,
      etaMinutes: 7,
      warning: 'DO NOT VISIT: Missing advanced oncology & cath lab modalities.',
      missingMachines: ['PET_CT', 'LINAC_RADIATION'],
      costPenalty: '₹10,000 non-refundable registration gap',
    },
    pinB: {
      hospitalId: 'HOSP_TMH_MUM',
      name: 'Tata Memorial Hospital (Parel)',
      type: 'National Apex Cancer Center',
      coords: { x: 560, y: 230 },
      distanceKm: 5.4,
      etaMinutes: 15,
      status: 'OPTIMAL DIRECT ROUTE (15 mins ETA)',
      headline: 'Gold Standard Oncology: Digital PET-CT, TrueBeam & Flexitron Brachytherapy.',
      operationalRate: '100% Oncological Modalities Active',
    },
    pinC: {
      hospitalId: 'HOSP_HINDUJA_MUM',
      name: 'P. D. Hinduja Hospital (Mahim)',
      type: 'NABH Charitable Trust',
      coords: { x: 260, y: 420 },
      distanceKm: 7.2,
      etaMinutes: 20,
      headline: 'NABH QUALITY CARE: Silent Scan 3T MRI & Zeiss Pentero Micro-neurosurgery.',
      savingPct: 'Subsidized Trust Concessions',
    },
  },
};

const DISEASE_CHECKLIST_DATA: Record<string, { title: string; items: string[] }> = {
  '2C25': {
    title: 'Lung / Breast Cancer Pre-Arrival Family Kit',
    items: [
      'Original Government Photo ID (Patient & Primary Attendant Aadhaar/Voter Card)',
      'Ayushman Bharat (PM-JAY) Golden Card / Swasthya Sathi Smart Card',
      'Original Formalin-Fixed Paraffin Embedded (FFPE) Tissue Block & Stained Biopsy Slides',
      'All Previous Contrast CT Chest / PET-CT DICOM Image Discs (CD/DVD)',
      'Baseline Pulmonary Function Test (PFT / Spirometry) and Echocardiogram Reports',
      'Complete list of current prescription medicines and antiplatelet history',
    ],
  },
  '2C77': {
    title: 'Carcinoma Cervix Radiotherapy Pre-Arrival Kit',
    items: [
      'Original Aadhaar Card & State Swasthya Sathi / PM-JAY Card',
      'Cervical punch biopsy histopathology glass slide and blocks',
      'High-Resolution Pelvic MRI & Whole Body PET-CT Films / CD',
      'Complete blood count (CBC), Serum Creatinine, and Urea within 7 days',
      'Attendant blood donor contact for transfusion standby during CCRT',
    ],
  },
  BA41: {
    title: 'Acute STEMI Heart Attack Emergency Kit',
    items: [
      'Stat 12-Lead Electrocardiogram (ECG) printout from local doctor/ambulance',
      'Patient Aadhaar Card / Ayushman Bharat Card for instant Emergency TPA authorization',
      'All previous angioplasty or coronary angiogram CDs if prior heart patient',
      'Immediate contact of blood relatives for primary PCI informed consent',
    ],
  },
  GB61: {
    title: 'ESRD / Dialysis Emergency Arrival Kit',
    items: [
      'Last 3 Serum Creatinine, Blood Urea, and Serum Potassium (K+) Reports',
      'Vascular access mapping / Doppler report for AV Fistula or PermCath history',
      'Viral markers profile (HBsAg, Anti-HCV, HIV stat within 3 months)',
      'Ayushman Bharat / Swasthya Sathi Dialysis Authorization Slip',
    ],
  },
  DEFAULT: {
    title: 'Tertiary Hospital Pre-Arrival Critical Kit',
    items: [
      'Original Aadhaar Card (Patient & Attendant)',
      'Ayushman Bharat (PM-JAY) / Swasthya Sathi / CGHS Card',
      'Recent diagnostic imaging films (MRI/CT/PET) on CD/DVD',
      'Complete file of medical prescriptions and active medications',
    ],
  },
};

export const GeospatialRerouteMap: React.FC = () => {
  const {
    triageState,
    setSelectedCity,
    hospitals,
    equipment,
    activeCondition,
  } = useKlinqo();

  const activeCityKey =
    CITY_MAP_DATA[triageState.selectedCity] ? triageState.selectedCity : 'Kolkata';
  const currentCityConfig = CITY_MAP_DATA[activeCityKey];

  // Selected Pin for inspection
  const [activePin, setActivePin] = useState<'PIN_A' | 'PIN_B' | 'PIN_C'>('PIN_B');

  // Green Corridor Ambulance mode toggle
  const [isGreenCorridorActive, setIsGreenCorridorActive] = useState(false);

  // Modal State
  const [modalHospitalId, setModalHospitalId] = useState<string | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'AUDIT' | 'CHECKLIST' | 'BOOKING'>('AUDIT');

  // Waze-style crowdsourced feedback counters
  const [verificationFeedback, setVerificationFeedback] = useState<Record<string, { yes: number; no: number }>>({
    EQ_TMC_1: { yes: 48, no: 0 },
    EQ_TMC_2: { yes: 62, no: 1 },
    EQ_SSKM_1: { yes: 3, no: 29 }, // Linac down
  });

  // Pre-arrival checklist completion
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    0: true,
    1: true,
  });

  // Booking Form State
  const [bookingName, setBookingName] = useState('Ramesh Sharma');
  const [bookingPhone, setBookingPhone] = useState('+91 98301 44921');
  const [bookingSlot, setBookingSlot] = useState('Tomorrow Morning (09:00 AM - 11:00 AM)');
  const [bookingScheme, setBookingScheme] = useState('Ayushman Bharat (PM-JAY)');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // Active hospital object for modal
  const selectedModalHospital = useMemo(() => {
    if (!modalHospitalId) return null;
    return hospitals.find((h) => h.hospital_id === modalHospitalId) || null;
  }, [modalHospitalId, hospitals]);

  const selectedModalEquipment = useMemo(() => {
    if (!modalHospitalId) return [];
    return equipment.filter((e) => e.hospital_id === modalHospitalId);
  }, [modalHospitalId, equipment]);

  const activeChecklist = useMemo(() => {
    const icd = triageState.activeConditionIcd;
    return DISEASE_CHECKLIST_DATA[icd] || DISEASE_CHECKLIST_DATA.DEFAULT;
  }, [triageState.activeConditionIcd]);

  // Live equipment status check for Pin C hospital
  const pinCHospitalEquipment = useMemo(() => {
    return equipment.filter((e) => e.hospital_id === currentCityConfig.pinC.hospitalId);
  }, [equipment, currentCityConfig.pinC.hospitalId]);

  const pinCMaintenanceMachines = useMemo(() => {
    return pinCHospitalEquipment.filter((e) => e.operational_status === 'MAINTENANCE');
  }, [pinCHospitalEquipment]);

  // Handle Waze-style upvote / downvote
  const handleFeedback = (eqId: string, isYes: boolean) => {
    setVerificationFeedback((prev) => {
      const current = prev[eqId] || { yes: 12, no: 0 };
      return {
        ...prev,
        [eqId]: {
          yes: isYes ? current.yes + 1 : current.yes,
          no: !isYes ? current.no + 1 : current.no,
        },
      };
    });
  };

  // Toggle checklist item
  const toggleChecklistItem = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round((checkedCount / activeChecklist.items.length) * 100);

  // Booking generator
  const handleGenerateBookingToken = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `MR-2026-${Math.floor(1000 + Math.random() * 9000)}-${selectedModalHospital?.hospital_id.slice(-3) || 'APX'}`;
    setGeneratedToken(token);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-clinical-lg p-5 sm:p-7 mb-8 space-y-6">
      {/* 1. Header with City Switcher & Green Corridor Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-clinical-teal flex items-center justify-center border border-teal-200">
              <Navigation className="w-5 h-5 text-clinical-teal" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-navy tracking-tight flex items-center gap-2">
                <span>Geospatial Smart Rerouter & Hospital Infrastructure Deep-Dive</span>
                <span className="bg-clinical-subtle text-clinical-dark text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  Live Vector GPS Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualizes patient home transit corridors to steer ambulances away from unequipped nursing homes directly to verified tertiary facilities.
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: City Switcher & Green Corridor Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hyperlocal Focus Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Kolkata Metropolitan Grid</span>
          </div>

          {/* Green Corridor Toggle */}
          <button
            onClick={() => setIsGreenCorridorActive(!isGreenCorridorActive)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
              isGreenCorridorActive
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isGreenCorridorActive ? 'text-amber-300 fill-amber-300' : 'text-slate-500'}`} />
            <span>Green Ambulance Corridor ({isGreenCorridorActive ? 'ON: -5m' : 'OFF'})</span>
          </button>
        </div>
      </div>

      {/* 2. CUSTOM INTERACTIVE SVG MAP CANVAS */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-4 sm:p-6">
        {/* Top Floating Map Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 text-xs font-mono text-slate-300 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="font-bold text-white uppercase tracking-wider">
              {currentCityConfig.name} • Live Radar Map
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Pin A: Unequipped Nursing Home
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Pin B: Optimal Tertiary Hub
            </span>
            <span className="flex items-center gap-1.5 text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              Pin C: Subsidized Trust Center
            </span>
          </div>
        </div>

        {/* The SVG Visual Radar Canvas */}
        <div className="relative w-full h-[400px] sm:h-[460px] overflow-hidden rounded-2xl my-2">
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full select-none cursor-crosshair"
            style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.5))' }}
          >
            {/* Background Map Grid */}
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>

              {/* Radial gradient glow for home */}
              <radialGradient id="homeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
              </radialGradient>

              {/* Red glow for warning pin */}
              <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E11D48" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="800" height="500" fill="#0B1329" />
            <rect width="800" height="500" fill="url(#gridPattern)" />

            {/* Simulated Road Arteries */}
            <path
              d="M 50 180 Q 200 240 420 310 T 750 420"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 220 50 Q 300 200 420 310 T 600 490"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* ROUTE 1: Home to Pin A (DANGEROUS / DEFICIT PATH) in RED */}
            <path
              d={`M ${currentCityConfig.homeCoords.x} ${currentCityConfig.homeCoords.y} Q 380 250 ${currentCityConfig.pinA.coords.x} ${currentCityConfig.pinA.coords.y}`}
              fill="none"
              stroke="#E11D48"
              strokeWidth={activePin === 'PIN_A' ? '4' : '2'}
              strokeDasharray="4 4"
              className="opacity-75"
            />

            {/* ROUTE 2: Home to Pin B (OPTIMAL DIRECT ROUTE) in EMERALD */}
            <path
              d={`M ${currentCityConfig.homeCoords.x} ${currentCityConfig.homeCoords.y} Q 520 280 ${currentCityConfig.pinB.coords.x} ${currentCityConfig.pinB.coords.y}`}
              fill="none"
              stroke="#10B981"
              strokeWidth={activePin === 'PIN_B' ? '5' : '3'}
              strokeDasharray={isGreenCorridorActive ? '8 4' : '6 3'}
              className="animate-pulse"
            />

            {/* ROUTE 3: Home to Pin C (BUDGET TRUST ALTERNATIVE) in TEAL */}
            <path
              d={`M ${currentCityConfig.homeCoords.x} ${currentCityConfig.homeCoords.y} Q 320 380 ${currentCityConfig.pinC.coords.x} ${currentCityConfig.pinC.coords.y}`}
              fill="none"
              stroke="#0D9488"
              strokeWidth={activePin === 'PIN_C' ? '4' : '2.5'}
              strokeDasharray="5 3"
              className="opacity-90"
            />

            {/* Patient Home Concentric Radar Circles */}
            <circle cx={currentCityConfig.homeCoords.x} cy={currentCityConfig.homeCoords.y} r="60" fill="url(#homeGlow)" />
            <circle cx={currentCityConfig.homeCoords.x} cy={currentCityConfig.homeCoords.y} r="40" fill="none" stroke="#0D9488" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={currentCityConfig.homeCoords.x} cy={currentCityConfig.homeCoords.y} r="20" fill="none" stroke="#14B8A6" strokeWidth="1.5" opacity="0.6" />

            {/* PIN: PATIENT HOME */}
            <g transform={`translate(${currentCityConfig.homeCoords.x}, ${currentCityConfig.homeCoords.y})`}>
              <circle r="7" fill="#0D9488" className="animate-ping opacity-75" />
              <circle r="6" fill="#14B8A6" stroke="#ffffff" strokeWidth="2" />
              <text y="-14" textAnchor="middle" fill="#5EEAD4" fontSize="11" fontWeight="bold" fontFamily="monospace">
                📍 {currentCityConfig.homeCoords.label.split('(')[0]}
              </text>
            </g>

            {/* PIN A: Local Unequipped Nursing Home (Warning Red) */}
            <g
              transform={`translate(${currentCityConfig.pinA.coords.x}, ${currentCityConfig.pinA.coords.y})`}
              className="cursor-pointer"
              onClick={() => setActivePin('PIN_A')}
            >
              <circle r="25" fill="url(#redGlow)" />
              <circle r="12" fill="#E11D48" className="animate-ping opacity-50" />
              <circle r="9" fill="#E11D48" stroke="#ffffff" strokeWidth="2" />
              <text y="-16" textAnchor="middle" fill="#FDA4AF" fontSize="11" fontWeight="bold">
                ⛔ Pin A ({currentCityConfig.pinA.distanceKm} km)
              </text>
              <text y="24" textAnchor="middle" fill="#F43F5E" fontSize="9" fontWeight="bold" fontFamily="monospace">
                MISSING MACHINES
              </text>
            </g>

            {/* PIN B: Optimal Direct Tertiary Center (Emerald Green) */}
            <g
              transform={`translate(${currentCityConfig.pinB.coords.x}, ${currentCityConfig.pinB.coords.y})`}
              className="cursor-pointer"
              onClick={() => setActivePin('PIN_B')}
            >
              <circle r="30" fill="rgba(16, 185, 129, 0.25)" className="animate-pulse" />
              <circle r="13" fill="#10B981" stroke="#ffffff" strokeWidth="2.5" />
              <text y="-18" textAnchor="middle" fill="#6EE7B7" fontSize="12" fontWeight="black">
                ⭐ Pin B: {currentCityConfig.pinB.name.split('(')[0]}
              </text>
              <text y="25" textAnchor="middle" fill="#34D399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ✔ {currentCityConfig.pinB.distanceKm} km • {isGreenCorridorActive ? currentCityConfig.pinB.etaMinutes - 5 : currentCityConfig.pinB.etaMinutes} mins
              </text>
            </g>

            {/* PIN C: Subsidized Charitable Trust Center (Teal) */}
            <g
              transform={`translate(${currentCityConfig.pinC.coords.x}, ${currentCityConfig.pinC.coords.y})`}
              className="cursor-pointer"
              onClick={() => setActivePin('PIN_C')}
            >
              <circle r="22" fill="rgba(13, 148, 136, 0.2)" />
              <circle r="10" fill="#0D9488" stroke="#ffffff" strokeWidth="2" />
              <text y="-16" textAnchor="middle" fill="#5EEAD4" fontSize="11" fontWeight="bold">
                💡 Pin C ({currentCityConfig.pinC.distanceKm} km)
              </text>
              <text y="24" textAnchor="middle" fill="#2DD4BF" fontSize="9" fontWeight="bold" fontFamily="monospace">
                BUDGET TRUST
              </text>
            </g>
          </svg>
        </div>

        {/* 3. Interactive Route Cards Below Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3">
          {/* CARD A: Warning Card */}
          <div
            onClick={() => setActivePin('PIN_A')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activePin === 'PIN_A'
                ? 'bg-rose-950/70 border-rose-500 shadow-md ring-1 ring-rose-500'
                : 'bg-slate-900/80 border-slate-800 hover:border-rose-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                PIN A: Nearby Nursing Home
              </span>
              <span className="text-rose-300 font-mono text-[11px]">
                {currentCityConfig.pinA.distanceKm} km • {currentCityConfig.pinA.etaMinutes}m
              </span>
            </div>

            <h4 className="text-xs font-extrabold text-white">
              {currentCityConfig.pinA.name}
            </h4>

            <p className="text-[11px] text-rose-200 mt-2 leading-relaxed">
              {currentCityConfig.pinA.warning}
            </p>

            <div className="mt-3 pt-2 border-t border-rose-900/60 text-[10px] font-mono text-rose-300">
              Penalty: {currentCityConfig.pinA.costPenalty}
            </div>
          </div>

          {/* CARD B: Optimal Direct Route (Emerald) */}
          <div
            onClick={() => setActivePin('PIN_B')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
              activePin === 'PIN_B'
                ? 'bg-emerald-950/70 border-emerald-400 shadow-lg ring-2 ring-emerald-400'
                : 'bg-slate-900/80 border-slate-800 hover:border-emerald-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-black text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                PIN B: OPTIMAL DIRECT ROUTE
              </span>
              <span className="text-emerald-300 font-mono text-[11px] font-bold">
                {currentCityConfig.pinB.distanceKm} km • {isGreenCorridorActive ? currentCityConfig.pinB.etaMinutes - 5 : currentCityConfig.pinB.etaMinutes}m
              </span>
            </div>

            <h4 className="text-xs font-black text-white">
              {currentCityConfig.pinB.name}
            </h4>

            <p className="text-[11px] text-emerald-200 mt-2 leading-relaxed font-medium">
              {currentCityConfig.pinB.headline}
            </p>

            <div className="mt-3 pt-2 border-t border-emerald-900/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-300">
                {currentCityConfig.pinB.operationalRate}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalHospitalId(currentCityConfig.pinB.hospitalId);
                  setModalActiveTab('CHECKLIST');
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Pre-Arrival Kit &rarr;
              </button>
            </div>
          </div>

          {/* CARD C: Budget Trust Alternative (Teal) */}
          <div
            onClick={() => setActivePin('PIN_C')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activePin === 'PIN_C'
                ? 'bg-teal-950/70 border-teal-400 shadow-md ring-1 ring-teal-400'
                : 'bg-slate-900/80 border-slate-800 hover:border-teal-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold text-teal-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                PIN C: SMART BUDGET TRUST
              </span>
              <span className="text-teal-300 font-mono text-[11px]">
                {currentCityConfig.pinC.distanceKm} km • {currentCityConfig.pinC.etaMinutes}m
              </span>
            </div>

            <h4 className="text-xs font-extrabold text-white">
              {currentCityConfig.pinC.name}
            </h4>

            {/* Status or Maintenance Warning Badge */}
            {pinCMaintenanceMachines.length > 0 ? (
              <div className="mt-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-200">
                <span className="font-bold flex items-center gap-1 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Note: {pinCMaintenanceMachines.map(m => m.equipment_name).join(', ')} currently under maintenance
                </span>
                <span className="text-[10px] text-amber-300/80 mt-0.5 block">
                  85% Lower Cost under Govt Quota • Expect queue or verify before travel
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-teal-200 mt-2 leading-relaxed">
                {currentCityConfig.pinC.headline}
              </p>
            )}

            <div className="mt-3 pt-2 border-t border-teal-900/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-teal-300">
                {currentCityConfig.pinC.savingPct}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalHospitalId(currentCityConfig.pinC.hospitalId);
                  setModalActiveTab('AUDIT');
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-600 text-white hover:bg-teal-500"
              >
                Audit Machines &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. HOSPITAL INFRASTRUCTURE & PRE-ARRIVAL CHECKLIST MODAL */}
      {modalHospitalId && selectedModalHospital && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl relative">
            {/* Modal Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-navy text-white">
                    {selectedModalHospital.hospital_type}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-brand-navy">
                    {selectedModalHospital.name}
                  </h3>
                  {selectedModalHospital.nabh_accredited && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-clinical-dark border border-teal-200">
                      NABH
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedModalHospital.address}, {selectedModalHospital.city} • ABDM: {selectedModalHospital.abdm_hfr_id}
                </p>
              </div>

              <button
                onClick={() => {
                  setModalHospitalId(null);
                  setGeneratedToken(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Modal Tabs: [Tab 1: Live Equipment Audit] | [Tab 2: Pre-Arrival Family Kit] | [Tab 3: Priority Token] */}
            <div className="px-6 pt-4 border-b border-slate-200 flex items-center gap-2 text-xs font-bold bg-slate-50">
              <button
                onClick={() => setModalActiveTab('AUDIT')}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 transition-all ${
                  modalActiveTab === 'AUDIT'
                    ? 'border-clinical-teal text-clinical-dark font-black'
                    : 'border-transparent text-slate-500 hover:text-brand-navy'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Tab 1: Live Equipment Audit Log</span>
              </button>

              <button
                onClick={() => setModalActiveTab('CHECKLIST')}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 transition-all ${
                  modalActiveTab === 'CHECKLIST'
                    ? 'border-clinical-teal text-clinical-dark font-black'
                    : 'border-transparent text-slate-500 hover:text-brand-navy'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Tab 2: Pre-Arrival Family Checklist</span>
                <span className="bg-teal-100 text-clinical-dark text-[10px] px-1.5 py-0.2 rounded-full">
                  {checkedCount}/{activeChecklist.items.length}
                </span>
              </button>

              <button
                onClick={() => setModalActiveTab('BOOKING')}
                className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 transition-all ${
                  modalActiveTab === 'BOOKING'
                    ? 'border-clinical-teal text-clinical-dark font-black'
                    : 'border-transparent text-slate-500 hover:text-brand-navy'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Tab 3: Book Priority Admission Token</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-6">
              {/* ================= TAB 1: LIVE EQUIPMENT AUDIT LOG ================= */}
              {modalActiveTab === 'AUDIT' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-brand-navy">
                      Institutional Equipment Ledger & Waze-Style Patient Crowdsourced Telemetry:
                    </span>
                    <span className="font-mono text-[11px]">
                      {selectedModalEquipment.length} Registered Machines
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="p-3">Modality & Specification</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-center">Active Units</th>
                          <th className="p-3 text-right">Avg Wait</th>
                          <th className="p-3 text-right">Crowdsource Verified</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedModalEquipment.map((eq) => {
                          const feedback = verificationFeedback[eq.id] || { yes: 18, no: 1 };
                          const isOp = eq.operational_status === 'OPERATIONAL' && eq.available_units > 0;
                          const isMaint = eq.operational_status === 'MAINTENANCE';

                          return (
                            <tr key={eq.id} className="hover:bg-slate-50/70">
                              <td className="p-3">
                                <div className="font-bold text-brand-navy">
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mr-1.5">
                                    {eq.equipment_code}
                                  </span>
                                  {eq.brand_model}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {eq.equipment_name}
                                </div>
                                {eq.maintenance_reason && (
                                  <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                                    ⚠ {eq.maintenance_reason}
                                  </div>
                                )}
                              </td>

                              <td className="p-3">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    isOp
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isMaint
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {eq.operational_status}
                                </span>
                              </td>

                              <td className="p-3 text-center font-mono font-bold text-slate-800">
                                {eq.available_units} / {eq.total_units}
                              </td>

                              <td className="p-3 text-right font-mono text-slate-600">
                                {eq.avg_wait_time_hours} hrs
                              </td>

                              {/* Waze-Style Community Feedback Buttons */}
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                  <button
                                    onClick={() => handleFeedback(eq.id, true)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1"
                                    title="Confirm machine was working today"
                                  >
                                    <ThumbsUp className="w-3 h-3 text-emerald-600" />
                                    <span>{feedback.yes}</span>
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    onClick={() => handleFeedback(eq.id, false)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-800 hover:bg-rose-100 flex items-center gap-1"
                                    title="Report downtime or breakdown"
                                  >
                                    <ThumbsDown className="w-3 h-3 text-rose-600" />
                                    <span>{feedback.no}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: PRE-ARRIVAL FAMILY CHECKLIST ================= */}
              {modalActiveTab === 'CHECKLIST' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-teal-50 rounded-2xl border border-teal-200">
                    <div>
                      <h4 className="text-xs font-black text-teal-950 uppercase tracking-wide">
                        {activeChecklist.title}
                      </h4>
                      <p className="text-xs text-teal-800 mt-0.5">
                        Packing these documents prevents emergency patient discharge or return trips home.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-teal-700 font-mono font-bold uppercase block">
                        Preparedness Score:
                      </span>
                      <span className="text-lg font-mono font-black text-clinical-dark">
                        {progressPct}% Ready
                      </span>
                    </div>
                  </div>

                  {/* Interactive Checklist Items */}
                  <div className="space-y-2">
                    {activeChecklist.items.map((item, idx) => {
                      const isDone = !!checkedItems[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklistItem(idx)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                            isDone
                              ? 'bg-slate-50/70 border-teal-200 text-slate-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                              isDone
                                ? 'bg-clinical-teal text-white border-clinical-teal'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= TAB 3: BOOK PRIORITY ADMISSION TOKEN ================= */}
              {modalActiveTab === 'BOOKING' && (
                <div className="space-y-4">
                  {!generatedToken ? (
                    <form onSubmit={handleGenerateBookingToken} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Patient Legal Name (As per Aadhaar):</label>
                          <input
                            type="text"
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            required
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Attendant WhatsApp Mobile:</label>
                          <input
                            type="text"
                            value={bookingPhone}
                            onChange={(e) => setBookingPhone(e.target.value)}
                            required
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Preferred Admission / Triage Slot:</label>
                          <select
                            value={bookingSlot}
                            onChange={(e) => setBookingSlot(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                          >
                            <option>Stat Emergency Arrival (Under 60 mins)</option>
                            <option>Today Afternoon (02:00 PM - 04:00 PM)</option>
                            <option>Tomorrow Morning (09:00 AM - 11:00 AM)</option>
                            <option>Planned Radiotherapy / Chemo Cycle (Within 48h)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Billing Scheme / Insurance:</label>
                          <select
                            value={bookingScheme}
                            onChange={(e) => setBookingScheme(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                          >
                            <option>Ayushman Bharat (PM-JAY) 100% Cashless</option>
                            <option>Swasthya Sathi (West Bengal)</option>
                            <option>Private Insurance (Star Health / HDFC / Care)</option>
                            <option>Self-Pay / Cash Tariff</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                        Verified pre-registration notifies the hospital ER desk to reserve clean bed space and prep the diagnostic machine team prior to ambulance arrival.
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-clinical-teal hover:bg-clinical-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Generate Verified Priority Triage Token
                      </button>
                    </form>
                  ) : (
                    /* Verified Ticket Badge with Simulated QR Code */
                    <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl border border-slate-700 shadow-xl space-y-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-clinical-light flex items-center justify-center mx-auto border border-teal-500/40">
                        <CheckCircle2 className="w-6 h-6 text-teal-400" />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-teal-300 font-bold uppercase tracking-widest block">
                          KLINQO AI OFFICIAL TRIAGE PASS
                        </span>
                        <h4 className="text-xl font-mono font-black text-white mt-1">
                          {generatedToken}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          Reserved for: <strong>{bookingName}</strong> • {selectedModalHospital.name}
                        </p>
                      </div>

                      {/* QR Simulation Box */}
                      <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto">
                        <QrCode className="w-28 h-28 text-slate-900 mx-auto" />
                        <span className="text-[9px] font-mono text-slate-700 block mt-1">
                          SCAN AT RECEPTION DESK
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Show this digital referral pass at the emergency admissions counter. ER staff will expedite bed triage without repeating registration interviews.
                      </div>

                      <div className="flex justify-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `Klinqo Triage Token: ${generatedToken} for ${bookingName} at ${selectedModalHospital.name}`
                            );
                            alert('Token copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-600"
                        >
                          Copy Token
                        </button>

                        <button
                          onClick={() => setGeneratedToken(null)}
                          className="px-4 py-2 bg-clinical-teal hover:bg-clinical-dark text-white text-xs font-bold rounded-xl"
                        >
                          Book Another Token
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
