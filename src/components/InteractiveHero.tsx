'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { EquipmentCode, KolkataZone, HospitalType } from '@/types/medical';
import { KOLKATA_LOCALITIES } from '@/data/kolkataLocalities';
import {
  ShieldCheck,
  Search,
  Cpu,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  IndianRupee,
  Sparkles,
  Zap,
  Filter,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

const KOLKATA_ZONES: { id: KolkataZone | 'ALL_ZONES'; label: string }[] = [
  { id: 'ALL_ZONES', label: 'All Kolkata Zones (Greater Metropolitan)' },
  { id: 'ZONE_SALT_LAKE_NEW_TOWN', label: 'Salt Lake & New Town (Sector 1-5, Rajarhat)' },
  { id: 'ZONE_EM_BYPASS', label: 'EM Bypass Corridor (Apollo, Fortis, Medica, RTIICS)' },
  { id: 'ZONE_CENTRAL_ALIPORE', label: 'Central & Alipore (SSKM, I-NK, BM Birla, CMRI)' },
  { id: 'ZONE_NORTH_DUMDUM_BARASAT', label: 'North Kolkata & Dum Dum (MCH, NRS, RG Kar, Barasat)' },
  { id: 'ZONE_SOUTH_BEHALA_GARIA', label: 'South Kolkata & Behala/Garia (Saroj Gupta, KPC, Bangur)' },
  { id: 'ZONE_HOWRAH_KALYANI', label: 'Howrah & Kalyani (Narayana Superspeciality, AIIMS Kalyani)' },
];

const FACILITY_TYPES: { id: HospitalType | 'ALL_TYPES'; label: string }[] = [
  { id: 'ALL_TYPES', label: 'All 5 Facility Categories' },
  { id: 'Government', label: 'Govt Medical Colleges (Free Care)' },
  { id: 'Trust', label: 'Charitable Trust Apex Centers' },
  { id: 'Corporate', label: 'Corporate Super-Specialty' },
  { id: 'Nursing_Home', label: 'Local Nursing Homes' },
  { id: 'Diagnostic_Clinic', label: 'Diagnostic & PET-CT Clinics' },
];

const EQUIPMENT_OPTIONS: { code: EquipmentCode; label: string; count: number }[] = [
  { code: 'PET_CT', label: 'PET-CT Scanner', count: 6 },
  { code: 'LINAC_RADIATION', label: 'Linear Accelerator (LINAC)', count: 7 },
  { code: 'CATH_LAB', label: '24x7 Digital Cath Lab', count: 9 },
  { code: 'MRI_3T', label: '3.0 Tesla High-Field MRI', count: 8 },
  { code: 'ECMO', label: 'ECMO Life Support Unit', count: 5 },
  { code: 'VENTILATOR_ICU', label: 'Mechanical Ventilator ICU', count: 14 },
  { code: 'BRACHYTHERAPY', label: 'HDR Brachytherapy Unit', count: 5 },
  { code: 'DIALYSIS_CRRT', label: 'Continuous Renal (CRRT)', count: 7 },
];

const SEARCH_SUGGESTIONS = [
  { term: 'kanser (lung tumor)', label: 'Lung Cancer Stage IIA', icd: '2C25' },
  { term: 'hart atack (chest pain)', label: 'Acute STEMI Heart Attack', icd: 'BA41' },
  { term: 'cervix cancer (bleeding)', label: 'Carcinoma Cervix Stage IIB', icd: '2C77' },
  { term: 'stroke (slurred speech)', label: 'Acute Ischemic Stroke', icd: '8B11' },
  { term: 'kidney dialysis (creatinine)', label: 'ESRD Hyperkalemic Crisis', icd: 'GB61' },
  { term: 'head injury / trauma', label: 'Polytrauma & Subdural Hematoma', icd: 'NC72' },
];

export const InteractiveHero: React.FC = () => {
  const {
    t,
    searchMode,
    setSearchMode,
    searchQuery,
    executeTypoTolerantSearch,
    selectedEquipmentFilters,
    toggleEquipmentFilter,
    clearEquipmentFilters,
    triageState,
    setSelectedCity,
    isGpsSimulated,
    gpsLabel,
    simulateLiveGps,
    filterPmjayOnly,
    toggleFilterPmjay,
    filterSwasthyaSathiOnly,
    toggleFilterSwasthyaSathi,
    filterGovtTrustOnly,
    toggleFilterGovtTrust,
    filterEmergencyCathLabOnly,
    toggleFilterEmergencyCathLab,
    setActiveConditionIcd,
    rankedHospitals,
    selectedZone,
    setSelectedZone,
    selectedFacilityType,
    setSelectedFacilityType,
    selectedLocalityId,
    setSelectedLocalityId,
  } = useKlinqo();

  const [activePreviewTab, setActivePreviewTab] = useState<'DISCREPANCY' | 'COST_SAVINGS'>('DISCREPANCY');

  const handleSuggestionClick = (icd: string, term: string) => {
    executeTypoTolerantSearch(term);
    setActiveConditionIcd(icd);
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12">
      {/* Background radial medical glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-50/60 via-slate-50/20 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: HERO HEADLINE & COMMAND SEARCH BOX ================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-clinical-subtle border border-teal-200 text-clinical-dark text-xs font-bold shadow-2xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clinical-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-clinical-teal"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal" />
              <span>{t.trustPill}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight leading-[1.15]">
              {t.heroHeadline}
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {t.heroSubheadline}
            </p>

            {/* DUAL-MODE SEARCH COMMAND CENTER BOX */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-clinical-lg p-4 sm:p-5 relative transition-all">
              {/* Dual-Mode Tabs */}
              <div className="flex items-center border-b border-slate-200 pb-3 mb-4">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setSearchMode('DISEASE')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                      searchMode === 'DISEASE'
                        ? 'bg-brand-navy text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-navy'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{t.searchDiseaseTab}</span>
                  </button>

                  <button
                    onClick={() => setSearchMode('MACHINE')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                      searchMode === 'MACHINE'
                        ? 'bg-brand-navy text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-navy'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-clinical-teal" />
                    <span>{t.searchMachineTab}</span>
                    {selectedEquipmentFilters.length > 0 && (
                      <span className="bg-clinical-teal text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                        {selectedEquipmentFilters.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* MODE 1: Typo-Tolerant Disease Search */}
              {searchMode === 'DISEASE' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => executeTypoTolerantSearch(e.target.value)}
                      placeholder={t.diseaseSearchPlaceholder}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-clinical-teal focus:border-transparent transition-all shadow-inner"
                    />
                  </div>

                  {/* Typo-tolerant quick keyword pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                    {SEARCH_SUGGESTIONS.map((item) => (
                      <button
                        key={item.icd}
                        onClick={() => handleSuggestionClick(item.icd, item.term)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                          triageState.activeConditionIcd === item.icd
                            ? 'bg-clinical-subtle border-clinical-teal text-clinical-dark font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {item.term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE 2: Specific Machine / Equipment Multi-Checkboxes */}
              {searchMode === 'MACHINE' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                    <span className="font-semibold text-brand-navy">
                      Select required diagnostic/surgical modalities:
                    </span>
                    {selectedEquipmentFilters.length > 0 && (
                      <button
                        onClick={clearEquipmentFilters}
                        className="text-rose-600 hover:underline text-[11px] font-bold"
                      >
                        Clear Selection ({selectedEquipmentFilters.length})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EQUIPMENT_OPTIONS.map((item) => {
                      const isChecked = selectedEquipmentFilters.includes(item.code);
                      return (
                        <button
                          key={item.code}
                          onClick={() => toggleEquipmentFilter(item.code)}
                          className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                            isChecked
                              ? 'bg-teal-50 border-clinical-teal text-clinical-dark shadow-xs font-bold ring-1 ring-clinical-teal'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="font-mono text-[10px] text-slate-500 uppercase">
                            {item.code}
                          </div>
                          <div className="text-[11px] font-semibold text-brand-navy mt-1 line-clamp-1">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-mono mt-1">
                            ✓ {item.count} Active Units
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hyperlocal Kolkata Zone & Locality / Pin Code Picker */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Locality / Area / Pin Code selector */}
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <MapPin className="w-4 h-4 text-clinical-teal shrink-0" />
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Local Area / Pin Code:</span>
                      <select
                        value={selectedLocalityId}
                        onChange={(e) => setSelectedLocalityId(e.target.value)}
                        aria-label="Select Local Area or Pin Code"
                        className="w-full bg-transparent text-xs font-bold text-brand-navy focus:outline-none"
                      >
                        {KOLKATA_LOCALITIES.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} ({loc.pincode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Kolkata Zone Filter */}
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Kolkata Sub-Region Zone:</span>
                      <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value as any)}
                        aria-label="Filter by Kolkata Zone"
                        className="w-full bg-transparent text-xs font-bold text-brand-navy focus:outline-none"
                      >
                        {KOLKATA_ZONES.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Facility Type Filter Bar & GPS status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Facility Category:</span>
                    <select
                      value={selectedFacilityType}
                      onChange={(e) => setSelectedFacilityType(e.target.value as any)}
                      aria-label="Filter by Facility Category"
                      className="p-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700"
                    >
                      {FACILITY_TYPES.map((ft) => (
                        <option key={ft.id} value={ft.id}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* GPS simulated badge */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>{gpsLabel}</span>
                  </div>
                </div>
              </div>

              {/* Quick Filter Chips */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Filter Chips:
                </span>

                <button
                  onClick={toggleFilterPmjay}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filterPmjayOnly
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ {t.filterPmjay}
                </button>

                <button
                  onClick={toggleFilterSwasthyaSathi}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filterSwasthyaSathiOnly
                      ? 'bg-clinical-teal text-white border-clinical-teal shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ {t.filterSwasthyaSathi}
                </button>

                <button
                  onClick={toggleFilterGovtTrust}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filterGovtTrustOnly
                      ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.filterGovtTrust}
                </button>

                <button
                  onClick={toggleFilterEmergencyCathLab}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filterEmergencyCathLabOnly
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ⚡ {t.filterCathLab}
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE CLINICAL RADAR PREVIEW WIDGET ================= */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl relative">
              {/* Card Header & Discrepancy Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-coral animate-ping"></span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    {t.previewCardTitle}
                  </span>
                </div>
                <div className="flex bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setActivePreviewTab('DISCREPANCY')}
                    className={`px-2 py-0.5 rounded ${
                      activePreviewTab === 'DISCREPANCY'
                        ? 'bg-clinical-teal text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Telemetry Gap
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('COST_SAVINGS')}
                    className={`px-2 py-0.5 rounded ${
                      activePreviewTab === 'COST_SAVINGS'
                        ? 'bg-clinical-teal text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Financial Gap
                  </button>
                </div>
              </div>

              {/* Subheading Info */}
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Illustrating why proximity without verified equipment is the primary cause of fatal golden-hour delays and medical bankruptcy in India:
              </p>

              {/* Discrepancy Comparison Cards */}
              <div className="space-y-3.5 mt-4">
                {/* 1. Unverified Local Nursing Home (Near, but Missing Machines) */}
                <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 relative">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <h4 className="text-xs font-extrabold text-rose-200">
                          {t.unverifiedHome}
                        </h4>
                      </div>
                      <span className="text-[11px] text-rose-300 font-mono">
                        Distance: 2.1 km • Ambulance: 8 mins
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-rose-300 font-mono block uppercase">
                        {t.matchScore}
                      </span>
                      <span className="text-lg font-mono font-extrabold text-rose-400">
                        33%
                      </span>
                    </div>
                  </div>

                  {/* Deficit details */}
                  <div className="mt-2.5 pt-2 border-t border-rose-900/60 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-300 text-[11px]">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{t.missingLinacPet}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-300 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{t.moneyWasted}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Outcome: {t.hoursLost}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Verified Apex Tertiary Facility (Slightly further, but 100% Prepared) */}
                <div className="bg-teal-950/40 border-2 border-emerald-500/80 rounded-2xl p-4 relative shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <h4 className="text-xs font-extrabold text-emerald-200">
                          {t.verifiedCenter}
                        </h4>
                      </div>
                      <span className="text-[11px] text-emerald-300 font-mono">
                        Distance: 6.4 km • Ambulance: 16 mins
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-300 font-mono block uppercase">
                        {t.matchScore}
                      </span>
                      <span className="text-lg font-mono font-extrabold text-emerald-400">
                        98%
                      </span>
                    </div>
                  </div>

                  {/* Verified Capabilities */}
                  <div className="mt-2.5 pt-2 border-t border-emerald-900/60 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.allOperational}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-300 text-[11px]">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.moneyCovered}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Door-to-Intervention: {t.immediateCare}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Callout */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Live verification via ABDM HFR Node
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {rankedHospitals.length} Centers Filtered Below
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
