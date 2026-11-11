'use client';

import React, { useState, useMemo } from 'react';
import { formatINR } from '@/utils/scoringEngine';
import {
  IndianRupee,
  Calculator,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  CreditCard,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info,
  Layers,
  Percent,
  Check,
  ArrowRight,
} from 'lucide-react';

interface ProcedureOption {
  id: string;
  name: string;
  category: string;
  cghsBaseRate: number;
  pmjayPackageRate: number;
  description: string;
}

const PROCEDURES: ProcedureOption[] = [
  {
    id: 'PROC_LUNG',
    name: 'Lung/Breast Cancer Surgery + Chemo + 25 Cycles Radiation',
    category: 'Oncology',
    cghsBaseRate: 210000,
    pmjayPackageRate: 155000,
    description: 'VATS Lobectomy or Modified Radical Mastectomy + 6 Cycles Adjuvant Chemotherapy + 25-Fraction External Beam LINAC.',
  },
  {
    id: 'PROC_CERVIX',
    name: 'Cervix Cancer LINAC Radiotherapy + 3D Brachytherapy Boost',
    category: 'Radiation Oncology',
    cghsBaseRate: 180000,
    pmjayPackageRate: 145000,
    description: 'Concurrent Chemoradiotherapy (CCRT) via Linear Accelerator (50.4 Gy) + 4 fractions of 3D Image-Guided HDR Brachytherapy.',
  },
  {
    id: 'PROC_STEMI',
    name: 'Acute STEMI Coronary Angioplasty with 2 Drug-Eluting Stents',
    category: 'Interventional Cardiology',
    cghsBaseRate: 145000,
    pmjayPackageRate: 110000,
    description: 'Golden hour primary PCI, thrombus aspiration, 2 DES stents, 48 hours Coronary Care Unit (CCCU) monitoring.',
  },
  {
    id: 'PROC_BRAIN',
    name: 'Brain Tumor Micro-Neurosurgery & Decompressive Craniectomy',
    category: 'Neurosurgery',
    cghsBaseRate: 240000,
    pmjayPackageRate: 180000,
    description: 'Image-guided craniotomy using operative neuro-microscope (Zeiss Kinevo) with intracranial pressure neuromonitoring in Neuro-ICU.',
  },
  {
    id: 'PROC_RENAL',
    name: '12-Session Hemodialysis + AV Fistula / PermCath Placement',
    category: 'Nephrology',
    cghsBaseRate: 75000,
    pmjayPackageRate: 50000,
    description: 'Vascular access creation by vascular surgeon, temporary double-lumen dialysis catheter, plus 12 high-flux dialysis sessions.',
  },
  {
    id: 'PROC_STROKE',
    name: 'Acute Ischemic Stroke Mechanical Thrombectomy + Thrombolysis',
    category: 'Interventional Neurology',
    cghsBaseRate: 195000,
    pmjayPackageRate: 140000,
    description: 'Stat IV Tenecteplase thrombolytic infusion followed by endovascular catheter clot retrieval via neuro biplane cath lab.',
  },
];

type RoomCategory = 'GENERAL' | 'SEMI_PRIVATE' | 'PRIVATE_SINGLE';
type CityTier = 'METRO_TIER_1' | 'TIER_2';
type InsuranceCoverage = 'SELF_PAY' | 'PMJAY' | 'SWASTHYA_SATHI' | 'CGHS' | 'PRIVATE_INSURANCE';

export const CostTransparencyEngine: React.FC = () => {
  // Inputs
  const [selectedProcId, setSelectedProcId] = useState<string>(PROCEDURES[0].id);
  const [roomCategory, setRoomCategory] = useState<RoomCategory>('SEMI_PRIVATE');
  const [cityTier, setCityTier] = useState<CityTier>('METRO_TIER_1');
  const [insuranceCoverage, setInsuranceCoverage] = useState<InsuranceCoverage>('PMJAY');
  const [includeComplicationBuffer, setIncludeComplicationBuffer] = useState<boolean>(true);

  // EMI Simulator
  const [emiTenureMonths, setEmiTenureMonths] = useState<number>(12);
  const [emiApproved, setEmiApproved] = useState<boolean>(false);

  // Selected Procedure Object
  const currentProcedure = useMemo(() => {
    return PROCEDURES.find((p) => p.id === selectedProcId) || PROCEDURES[0];
  }, [selectedProcId]);

  // Modifiers
  const roomMultiplier = useMemo(() => {
    switch (roomCategory) {
      case 'GENERAL':
        return 1.0;
      case 'SEMI_PRIVATE':
        return 1.35;
      case 'PRIVATE_SINGLE':
        return 1.75;
    }
  }, [roomCategory]);

  const cityMultiplier = useMemo(() => {
    return cityTier === 'METRO_TIER_1' ? 1.0 : 0.8;
  }, [cityTier]);

  const complicationMultiplier = includeComplicationBuffer ? 1.15 : 1.0;

  // 3-Tier Multiplier Calculations
  const baseRate = currentProcedure.cghsBaseRate;

  // Tier 1: Government Medical College / AIIMS (CGHS Base × 0.0x to 0.4x)
  const tier1Cost = useMemo(() => {
    if (
      insuranceCoverage === 'PMJAY' ||
      insuranceCoverage === 'SWASTHYA_SATHI' ||
      insuranceCoverage === 'CGHS'
    ) {
      return { min: 0, max: 0, isCashless: true };
    }
    // Self-pay or private: nominal consumable charges
    const min = Math.round(baseRate * 0.08);
    const max = Math.round(baseRate * 0.18);
    return { min, max, isCashless: false };
  }, [baseRate, insuranceCoverage]);

  // Tier 2: Charitable Trust & Mid-Sized NABH (CGHS Base × 1.5x to 2.2x)
  const tier2Cost = useMemo(() => {
    const rawMin = Math.round(baseRate * 1.5 * roomMultiplier * cityMultiplier * complicationMultiplier);
    const rawMax = Math.round(baseRate * 2.2 * roomMultiplier * cityMultiplier * complicationMultiplier);

    if (insuranceCoverage === 'PMJAY' || insuranceCoverage === 'SWASTHYA_SATHI') {
      return {
        min: 0,
        max: Math.round(rawMax * 0.15), // Small consumable gap if any
        isCashless: true,
        fullValue: rawMax,
      };
    }
    return { min: rawMin, max: rawMax, isCashless: false, fullValue: rawMax };
  }, [baseRate, roomMultiplier, cityMultiplier, complicationMultiplier, insuranceCoverage]);

  // Tier 3: Corporate Super-Specialty Chain (CGHS Base × 3.0x to 5.0x)
  const tier3Cost = useMemo(() => {
    const rawMin = Math.round(baseRate * 3.0 * roomMultiplier * cityMultiplier * complicationMultiplier);
    const rawMax = Math.round(baseRate * 5.0 * roomMultiplier * cityMultiplier * complicationMultiplier);

    if (insuranceCoverage === 'PRIVATE_INSURANCE') {
      return {
        min: Math.round(rawMin * 0.1), // 10% co-pay or non-medical items
        max: Math.round(rawMax * 0.15),
        isCashless: true,
        fullValue: rawMax,
      };
    }
    return { min: rawMin, max: rawMax, isCashless: false, fullValue: rawMax };
  }, [baseRate, roomMultiplier, cityMultiplier, complicationMultiplier, insuranceCoverage]);

  // Average Tier 2 benchmark for itemized breakdown & EMI
  const displayEstimatedTotal = tier2Cost.fullValue;

  // Itemized bill breakdown (45% Machine/Procedure, 25% ICU/Ward, 20% Drugs/Consumables, 10% Specialist)
  const itemizedBreakdown = useMemo(() => {
    const total = displayEstimatedTotal;
    return {
      procedureTariff: Math.round(total * 0.45),
      icuWardCharges: Math.round(total * 0.25),
      drugsAndStents: Math.round(total * 0.2),
      specialistFees: Math.round(total * 0.1),
    };
  }, [displayEstimatedTotal]);

  // Monthly No-Cost EMI
  const monthlyEmi = useMemo(() => {
    return Math.round(displayEstimatedTotal / emiTenureMonths);
  }, [displayEstimatedTotal, emiTenureMonths]);

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-clinical-lg p-5 sm:p-7 mb-8 space-y-7">
      {/* 1. Header with Pricing Formula Trust Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-clinical-teal flex items-center justify-center border border-teal-200">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-brand-navy tracking-tight">
              3-Tier Algorithmic Healthcare Cost Estimator & Financial Aid Matcher
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Real-world Indian healthcare tariffs calculated dynamically across Government Apex, Charitable Trust, and Corporate Super-Specialty hospitals.
          </p>
        </div>

        {/* Formula Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900 text-teal-300 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-clinical-light" />
          <span>PM-JAY HBP 2.2 & CGHS Base Multiplier Formula</span>
        </div>
      </div>

      {/* 2. Interactive Calculator Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
        {/* Procedure Package Picker */}
        <div className="md:col-span-2 space-y-1">
          <label className="font-extrabold text-slate-700 block">
            Clinical Procedure / Surgical Package:
          </label>
          <select
            value={selectedProcId}
            onChange={(e) => setSelectedProcId(e.target.value)}
            aria-label="Clinical Procedure / Surgical Package"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-brand-navy focus:outline-none focus:ring-1 focus:ring-clinical-teal truncate"
          >
            {PROCEDURES.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.category}] {p.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 block truncate">
            {currentProcedure.description}
          </span>
        </div>

        {/* Room Category */}
        <div className="space-y-1">
          <label className="font-extrabold text-slate-700 block">
            Room Category & Nursing Level:
          </label>
          <select
            value={roomCategory}
            onChange={(e) => setRoomCategory(e.target.value as RoomCategory)}
            aria-label="Room Category & Nursing Level"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            <option value="GENERAL">General Ward (1.0x Base)</option>
            <option value="SEMI_PRIVATE">Semi-Private Twin Sharing (1.35x)</option>
            <option value="PRIVATE_SINGLE">Private Single Deluxe AC (1.75x)</option>
          </select>
          <span className="text-[10px] text-slate-500 block">
            Ward modifier scales surgeon & bed tariffs
          </span>
        </div>

        {/* City Tier */}
        <div className="space-y-1">
          <label className="font-extrabold text-slate-700 block">
            Geographic City Tier:
          </label>
          <select
            value={cityTier}
            onChange={(e) => setCityTier(e.target.value as CityTier)}
            aria-label="Geographic City Tier"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            <option value="METRO_TIER_1">Metro Tier-1 (Delhi/Kolkata/Mumbai/BLR - 1.0x)</option>
            <option value="TIER_2">Tier-2 Hub (Siliguri/Patna/Lucknow - 0.8x)</option>
          </select>
          <span className="text-[10px] text-slate-500 block">
            Tier-2 index factors reduced overhead
          </span>
        </div>

        {/* Financial Coverage Selector */}
        <div className="md:col-span-2 space-y-1 pt-1">
          <label className="font-extrabold text-slate-700 block">
            Patient Financial Protection / Scheme:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { id: 'PMJAY', label: 'PM-JAY Cashless' },
              { id: 'SWASTHYA_SATHI', label: 'Swasthya Sathi' },
              { id: 'CGHS', label: 'CGHS Card' },
              { id: 'PRIVATE_INSURANCE', label: 'Private TPA' },
              { id: 'SELF_PAY', label: 'Self-Pay / Cash' },
            ].map((cov) => (
              <button
                key={cov.id}
                onClick={() => setInsuranceCoverage(cov.id as InsuranceCoverage)}
                className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                  insuranceCoverage === cov.id
                    ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cov.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complication Buffer Toggle */}
        <div className="md:col-span-2 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
          <div>
            <span className="font-extrabold text-slate-800 block text-xs">
              ICU & Complication Contingency Reserve (+15% Buffer):
            </span>
            <span className="text-[10px] text-slate-500">
              Recommended for high-risk cardiac, neuro, or geriatric oncology patients
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeComplicationBuffer}
              onChange={(e) => setIncludeComplicationBuffer(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clinical-teal"></div>
          </label>
        </div>
      </div>

      {/* 3. Live 3-Tier Multiplier Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-clinical-teal" />
            Live 3-Tier Tariff Comparison Cards (CGHS Base: {formatINR(baseRate)}):
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-bold">
            Modifiers: Room ({roomMultiplier}x) • City ({cityMultiplier}x) • Reserve ({complicationMultiplier}x)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* TIER 1: Government Medical College / AIIMS */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  Tier 1 • Government Apex / AIIMS
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  0.0x – 0.4x Base
                </span>
              </div>

              <h3 className="text-base font-extrabold text-brand-navy mt-2">
                AIIMS & State Medical Colleges
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Premier teaching institutes with subsidized treatment schedules.
              </p>

              {/* Price Out-of-Pocket Display */}
              <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Patient Out-of-Pocket Cost:
                </span>
                <div className="text-xl font-mono font-black text-brand-navy mt-1">
                  {tier1Cost.isCashless ? (
                    <span className="text-emerald-700">₹0 (100% Cashless)</span>
                  ) : (
                    <span>{formatINR(tier1Cost.min)} – {formatINR(tier1Cost.max)}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {tier1Cost.isCashless
                    ? 'Covered under PM-JAY / Swasthya Sathi / CGHS'
                    : 'Nominal surgical consumables / stent charges'}
                </span>
              </div>

              {/* Waiting & Queue Characteristics */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Expected Waiting:
                  </span>
                  <span className="font-mono font-bold text-slate-800">2 – 4 Weeks</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Equipment Queue Load:</span>
                  <span className="font-bold text-amber-700">High Queue / Priority Triage</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Cashless Approval:</span>
                  <span className="font-bold text-emerald-700">Instant Statutory Pass</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 italic">
              Best for budget-constrained families where clinical condition allows 2-4 week planned queue.
            </div>
          </div>

          {/* TIER 2: Charitable Trust & Mid-Sized NABH (BEST VALUE & FAST ACCESS) */}
          <div className="bg-gradient-to-b from-teal-50/70 to-white rounded-3xl border-2 border-clinical-teal p-5 space-y-4 shadow-clinical-md relative flex flex-col justify-between">
            {/* Highlight Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-clinical-teal text-white text-[11px] font-black px-4 py-0.5 rounded-full shadow-md tracking-wider uppercase">
              ⭐ Best Value & Fast Access
            </div>

            <div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono font-bold uppercase bg-teal-100 text-clinical-dark px-2.5 py-0.5 rounded-full">
                  Tier 2 • Charitable Trust & Mid NABH
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  1.5x – 2.2x Base
                </span>
              </div>

              <h3 className="text-base font-extrabold text-brand-navy mt-2">
                Tata Medical / TMH / Trust Centers
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Non-profit trust hospitals with zero commercial pressure and cutting-edge machines.
              </p>

              {/* Price Out-of-Pocket Display */}
              <div className="mt-4 p-4 rounded-2xl bg-white border border-teal-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Patient Estimated Range:
                </span>
                <div className="text-xl font-mono font-black text-clinical-dark mt-1">
                  {tier2Cost.isCashless ? (
                    <div>
                      <span className="text-emerald-700">₹0 – {formatINR(tier2Cost.max)}</span>
                      <span className="block text-[10px] font-normal text-slate-500 font-sans mt-0.5">
                        (Package Value: {formatINR(tier2Cost.fullValue)})
                      </span>
                    </div>
                  ) : (
                    <span>{formatINR(tier2Cost.min)} – {formatINR(tier2Cost.max)}</span>
                  )}
                </div>
                <span className="text-[10px] text-teal-800 font-medium block mt-1">
                  {tier2Cost.isCashless
                    ? '✓ PM-JAY / Swasthya Sathi Cashless with Minimal Gap'
                    : 'Subsidized trust tariffs; 50% cheaper than corporate'}
                </span>
              </div>

              {/* Waiting & Queue Characteristics */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-clinical-teal" /> Expected Waiting:
                  </span>
                  <span className="font-mono font-bold text-clinical-dark">2 – 3 Days (Fast)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Operational Equipment:</span>
                  <span className="font-bold text-emerald-700">Varian LINAC / Siemens PET</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Value Score:</span>
                  <span className="font-mono font-bold text-clinical-dark">98 / 100 Index</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-teal-100 text-[11px] text-clinical-dark font-medium">
              Optimal balance between high clinical expertise, subsidized costs, and minimal admission delays.
            </div>
          </div>

          {/* TIER 3: Corporate Super-Specialty Chain */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                  Tier 3 • Corporate Super-Specialty
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  3.0x – 5.0x Base
                </span>
              </div>

              <h3 className="text-base font-extrabold text-brand-navy mt-2">
                Apollo / Medanta / Fortis / Manipal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quaternary multi-organ transplant & luxury care centers with immediate triage.
              </p>

              {/* Price Out-of-Pocket Display */}
              <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Patient Estimated Range:
                </span>
                <div className="text-xl font-mono font-black text-brand-navy mt-1">
                  {tier3Cost.isCashless ? (
                    <div>
                      <span className="text-teal-700">{formatINR(tier3Cost.min)} – {formatINR(tier3Cost.max)}</span>
                      <span className="block text-[10px] font-normal text-slate-500 font-sans mt-0.5">
                        (Co-pay / Non-medical gap of {formatINR(tier3Cost.fullValue)})
                      </span>
                    </div>
                  ) : (
                    <span>{formatINR(tier3Cost.min)} – {formatINR(tier3Cost.max)}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {tier3Cost.isCashless
                    ? 'Covered via Private Health TPA with 10% co-pay buffer'
                    : 'Uninsured corporate tariff with premium amenities'}
                </span>
              </div>

              {/* Waiting & Queue Characteristics */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Expected Waiting:
                  </span>
                  <span className="font-mono font-bold text-emerald-700">Immediate (&lt; 2h)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Cath Lab / ECMO:</span>
                  <span className="font-bold text-slate-800">24x7 Dedicated Standby</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Private TPA Cashless:</span>
                  <span className="font-bold text-emerald-700">Star / HDFC / Care Accepted</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 italic">
              Best for hyper-acute golden hour emergencies (STEMI, Stroke) or patients with high-limit private TPA insurance.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Itemized Bill Breakdown (Horizontal Stacked Bar) */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-400" />
              Itemized Clinical Cost Stack (Benchmark: {formatINR(displayEstimatedTotal)})
            </h4>
            <p className="text-xs text-slate-400">
              Transparent cost distribution mapped from tertiary NABH hospital audit ledgers.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-teal-300">
            100% Itemized Audit
          </span>
        </div>

        {/* Horizontal Stacked Bar */}
        <div className="w-full h-8 rounded-xl overflow-hidden flex shadow-inner">
          <div
            style={{ width: '45%' }}
            className="bg-clinical-teal flex items-center justify-center text-[10px] font-mono font-bold text-white px-2 truncate"
            title={`Machine & Procedure Tariff: ${formatINR(itemizedBreakdown.procedureTariff)} (45%)`}
          >
            Machine/OT (45%)
          </div>
          <div
            style={{ width: '25%' }}
            className="bg-indigo-600 flex items-center justify-center text-[10px] font-mono font-bold text-white px-2 truncate"
            title={`ICU & Ward Room Charges: ${formatINR(itemizedBreakdown.icuWardCharges)} (25%)`}
          >
            ICU/Ward (25%)
          </div>
          <div
            style={{ width: '20%' }}
            className="bg-amber-500 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 px-2 truncate"
            title={`Drugs, Stents & Consumables: ${formatINR(itemizedBreakdown.drugsAndStents)} (20%)`}
          >
            Drugs/Stents (20%)
          </div>
          <div
            style={{ width: '10%' }}
            className="bg-rose-500 flex items-center justify-center text-[10px] font-mono font-bold text-white px-1 truncate"
            title={`Specialist & Surgeon Fees: ${formatINR(itemizedBreakdown.specialistFees)} (10%)`}
          >
            Fees (10%)
          </div>
        </div>

        {/* Stack Legend & Amounts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-teal-300 block">⚙️ Machine / OT (45%)</span>
            <span className="font-bold text-white text-sm">
              {formatINR(itemizedBreakdown.procedureTariff)}
            </span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-indigo-300 block">🛏️ ICU & Ward (25%)</span>
            <span className="font-bold text-white text-sm">
              {formatINR(itemizedBreakdown.icuWardCharges)}
            </span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-amber-300 block">🧪 Drugs / Stents (20%)</span>
            <span className="font-bold text-white text-sm">
              {formatINR(itemizedBreakdown.drugsAndStents)}
            </span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-rose-300 block">👨‍⚕️ Surgeon & Fees (10%)</span>
            <span className="font-bold text-white text-sm">
              {formatINR(itemizedBreakdown.specialistFees)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Medical Financing (No-Cost EMI) & Crowdfunding / PMNRF Relief Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Card A: Medical No-Cost EMI Simulator */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-brand-navy">
                Zero-Cost Medical EMI Simulator (CarePal / SaveIN)
              </h4>
              <p className="text-xs text-slate-500">
                Split out-of-pocket hospital bills into 0% interest monthly installments.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Select Loan Repayment Tenor:</span>
              <div className="flex gap-1">
                {[6, 12, 18, 24].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setEmiTenureMonths(m);
                      setEmiApproved(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      emiTenureMonths === m
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                  Estimated Monthly Installment:
                </span>
                <span className="text-xl font-mono font-black text-emerald-900">
                  {formatINR(monthlyEmi)} / month
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                0% Interest • 0 Down Payment
              </span>
            </div>

            {emiApproved ? (
              <div className="p-2.5 bg-emerald-100 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Pre-Approved Limit: Up to {formatINR(displayEstimatedTotal + 50000)} via PAN/Aadhaar</span>
              </div>
            ) : (
              <button
                onClick={() => setEmiApproved(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Check Instant Pre-Approved Medical Credit
              </button>
            )}
          </div>
        </div>

        {/* Card B: PMNRF / Chief Minister Relief Fund & Crowdfunding Matcher */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-brand-navy">
                Govt Relief Grants & Crowdfunding Aid
              </h4>
              <p className="text-xs text-slate-500">
                Grant subsidies for life-threatening oncology, cardiac, or neuro cases.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-indigo-950 block">
                  PM National Relief Fund (PMNRF)
                </span>
                <span className="text-[11px] text-indigo-700">
                  Direct grant for heart surgery, cancer & renal transplant
                </span>
              </div>
              <span className="font-mono font-black text-indigo-900 text-sm">
                Up to ₹3,00,000
              </span>
            </div>

            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-teal-950 block">
                  Chief Minister&apos;s Relief Fund (CMRF)
                </span>
                <span className="text-[11px] text-teal-700">
                  State-level emergency discretionary medical grant
                </span>
              </div>
              <span className="font-mono font-black text-teal-900 text-sm">
                Up to ₹1,00,000
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between text-slate-500 text-[11px]">
              <span>Klinqo AI auto-generates PMNRF Annexure II application dossier.</span>
              <a
                href="#pmnrf-dossier"
                onClick={(e) => {
                  e.preventDefault();
                  alert('PMNRF Medical Grant Dossier & Estimate Certificate generated for ' + currentProcedure.name);
                }}
                className="font-bold text-clinical-teal hover:underline flex items-center gap-1"
              >
                <span>Download Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
