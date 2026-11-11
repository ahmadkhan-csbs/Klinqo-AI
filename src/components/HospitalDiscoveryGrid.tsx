'use client';

import React, { useState, useMemo } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { HospitalWithScore, EquipmentCode, HospitalType, KolkataZone } from '@/types/medical';
import { KOLKATA_LOCALITIES } from '@/data/kolkataLocalities';
import { formatINR } from '@/utils/scoringEngine';
import { WhatsAppDispatchModal } from '@/components/WhatsAppDispatchModal';
import { HospitalComparisonModal } from '@/components/HospitalComparisonModal';
import { HospitalQuickDirectoryTable } from '@/components/HospitalQuickDirectoryTable';
import {
  ShieldCheck,
  Check,
  AlertTriangle,
  XCircle,
  Clock,
  Navigation,
  IndianRupee,
  PhoneCall,
  Scale,
  ExternalLink,
  Cpu,
  Bed,
  Filter,
  ArrowUpDown,
  Search,
  MessageSquare,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react';

type SortOption = 'MATCH_SCORE_DESC' | 'ETA_ASC' | 'COST_ASC';
type SpecialtyOption = 'ALL' | 'Oncology' | 'Cardiology' | 'Neurology' | 'Nephrology' | 'Trauma';
type SchemeOption = 'ALL' | 'PMJAY' | 'SWASTHYA_SATHI' | 'CGHS' | 'STAR_HEALTH' | 'HDFC_ERGO';

const ZONE_OPTIONS: { value: KolkataZone | 'ALL_ZONES'; label: string }[] = [
  { value: 'ALL_ZONES', label: 'All Kolkata Zones (Full Metropolitan Area)' },
  { value: 'ZONE_SALT_LAKE_NEW_TOWN', label: 'Salt Lake & New Town Hub' },
  { value: 'ZONE_EM_BYPASS', label: 'EM Bypass Health Corridor' },
  { value: 'ZONE_CENTRAL_ALIPORE', label: 'Central Kolkata & Alipore' },
  { value: 'ZONE_NORTH_DUMDUM_BARASAT', label: 'North Kolkata & Dum Dum / Barasat' },
  { value: 'ZONE_SOUTH_BEHALA_GARIA', label: 'South Kolkata & Behala / Garia' },
  { value: 'ZONE_HOWRAH_KALYANI', label: 'Howrah & Kalyani Apex Hub' },
];

const FACILITY_TYPE_OPTIONS: { value: HospitalType | 'ALL_TYPES'; label: string }[] = [
  { value: 'ALL_TYPES', label: 'All Facility Categories' },
  { value: 'Government', label: 'Government Medical Colleges (Free/Subsidized)' },
  { value: 'Trust', label: 'Charitable Trust & Apex Non-Profits' },
  { value: 'Corporate', label: 'Corporate SuperSpecialty Hospitals' },
  { value: 'Nursing_Home', label: 'Local Nursing Homes (Secondary)' },
  { value: 'Diagnostic_Clinic', label: 'Diagnostic Centers & Daycare Clinics' },
];

const MUST_HAVE_EQUIPMENT_OPTIONS: { code: EquipmentCode; label: string }[] = [
  { code: 'PET_CT', label: 'PET-CT' },
  { code: 'LINAC_RADIATION', label: 'LINAC' },
  { code: 'BRACHYTHERAPY', label: 'Brachytherapy' },
  { code: 'CATH_LAB', label: '24x7 Cath Lab' },
  { code: 'ECMO', label: 'ECMO' },
  { code: 'MRI_3T', label: '3T MRI' },
  { code: 'DIALYSIS_CRRT', label: 'Dialysis CRRT' },
];

export const HospitalDiscoveryGrid: React.FC = () => {
  const {
    rankedHospitals,
    activeCondition,
    triageState,
    setSelectedHospitalForModal,
    compareHospitals,
    toggleCompareHospital,
    clearCompareHospitals,
    equipment,
    selectedZone,
    setSelectedZone,
    selectedFacilityType,
    setSelectedFacilityType,
    selectedLocalityId,
    setSelectedLocalityId,
    simulateLiveGps,
    gpsLabel,
    isGpsSimulated,
  } = useKlinqo();

  // Filter Bar State
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyOption>('ALL');
  const [selectedScheme, setSelectedScheme] = useState<SchemeOption>('ALL');
  const [mustHaveEquipment, setMustHaveEquipment] = useState<EquipmentCode[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('MATCH_SCORE_DESC');

  // WhatsApp Modal State
  const [whatsAppModalHospital, setWhatsAppModalHospital] = useState<HospitalWithScore | null>(null);

  // Comparison Matrix Modal State
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Tooltip score breakdown active card
  const [hoveredScoreHospitalId, setHoveredScoreHospitalId] = useState<string | null>(null);

  // Toggle between Cards view and Quick Directory Table view
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  const toggleMustHaveEquipment = (code: EquipmentCode) => {
    setMustHaveEquipment((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Filter & Sort Pipeline
  const filteredAndSortedHospitals = useMemo(() => {
    let list = [...rankedHospitals];

    // 1. Specialty Filter
    if (selectedSpecialty !== 'ALL') {
      list = list.filter((item) => {
        if (selectedSpecialty === 'Oncology') {
          return item.equipment.some(
            (e) =>
              (e.equipment_code === 'PET_CT' ||
                e.equipment_code === 'LINAC_RADIATION' ||
                e.equipment_code === 'BRACHYTHERAPY') &&
              e.operational_status === 'OPERATIONAL'
          );
        }
        if (selectedSpecialty === 'Cardiology') {
          return item.equipment.some(
            (e) =>
              (e.equipment_code === 'CATH_LAB' || e.equipment_code === 'ECMO') &&
              e.operational_status === 'OPERATIONAL'
          );
        }
        if (selectedSpecialty === 'Neurology') {
          return item.equipment.some(
            (e) =>
              (e.equipment_code === 'NEURO_MICRO' || e.equipment_code === 'MRI_3T') &&
              e.operational_status === 'OPERATIONAL'
          );
        }
        if (selectedSpecialty === 'Nephrology') {
          return item.equipment.some(
            (e) =>
              e.equipment_code === 'DIALYSIS_CRRT' && e.operational_status === 'OPERATIONAL'
          );
        }
        if (selectedSpecialty === 'Trauma') {
          return item.hospital.trauma_level === 'Level 1' || item.hospital.trauma_level === 'Level 2';
        }
        return true;
      });
    }

    // 2. Must-Have Operational Equipment Pills
    if (mustHaveEquipment.length > 0) {
      list = list.filter((item) => {
        return mustHaveEquipment.every((reqCode) =>
          item.equipment.some(
            (e) =>
              e.equipment_code === reqCode &&
              e.operational_status === 'OPERATIONAL' &&
              e.available_units > 0
          )
        );
      });
    }

    // 3. Scheme & Insurance Filter
    if (selectedScheme !== 'ALL') {
      list = list.filter((item) => {
        if (selectedScheme === 'PMJAY') return item.hospital.pmjay_empanelled;
        if (selectedScheme === 'SWASTHYA_SATHI') return item.hospital.swasthya_sathi_accepted;
        if (selectedScheme === 'CGHS') {
          return (
            item.hospital.hospital_type === 'Government' ||
            (item.treatmentCost?.cashless_insurers.some((ins) =>
              ins.toLowerCase().includes('cghs')
            ) ??
              false)
          );
        }
        if (selectedScheme === 'STAR_HEALTH') {
          return (
            item.treatmentCost?.cashless_insurers.some((ins) =>
              ins.toLowerCase().includes('star')
            ) ?? false
          );
        }
        if (selectedScheme === 'HDFC_ERGO') {
          return (
            item.treatmentCost?.cashless_insurers.some((ins) =>
              ins.toLowerCase().includes('hdfc')
            ) ?? false
          );
        }
        return true;
      });
    }

    // 4. Working Sorting Dropdown
    if (sortBy === 'MATCH_SCORE_DESC') {
      list.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);
    } else if (sortBy === 'ETA_ASC') {
      list.sort((a, b) => a.hospital.eta_minutes - b.hospital.eta_minutes);
    } else if (sortBy === 'COST_ASC') {
      list.sort((a, b) => {
        const costA = a.treatmentCost ? a.treatmentCost.min_estimated_cost : (a.hospital.hospital_type === 'Government' ? 0 : 200000);
        const costB = b.treatmentCost ? b.treatmentCost.min_estimated_cost : (b.hospital.hospital_type === 'Government' ? 0 : 200000);
        return costA - costB;
      });
    }

    return list;
  }, [
    rankedHospitals,
    selectedSpecialty,
    mustHaveEquipment,
    selectedScheme,
    sortBy,
  ]);

  return (
    <section className="space-y-6">
      {/* 1. ADVANCED CLINICAL FILTER & SORTING BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-clinical p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-clinical-teal" />
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                <span>Kolkata Metropolitan Healthcare Grid</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-mono px-2 py-0.5 rounded-full font-bold">
                  Hyperlocal WB Live
                </span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {filteredAndSortedHospitals.length} of {rankedHospitals.length} Matching
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Refine by Kolkata micro-zone, facility tier, operational machines, or Swasthya Sathi / PM-JAY empanelment.
            </p>
          </div>

          {/* Working Sort Dropdown & Quick GPS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={simulateLiveGps}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isGpsSimulated
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isGpsSimulated ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{isGpsSimulated ? 'GPS Live: ' + gpsLabel.split('(')[0] : 'Simulate GPS Locality'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Table / Cards View Mode Switcher */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('CARDS')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'CARDS'
                      ? 'bg-white text-brand-navy shadow-xs'
                      : 'text-slate-600 hover:text-brand-navy'
                  }`}
                >
                  Cards Grid
                </button>
                <button
                  onClick={() => setViewMode('TABLE')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    viewMode === 'TABLE'
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-brand-navy'
                  }`}
                >
                  <span>📋 Directory Table</span>
                </button>
              </div>

              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort hospitals"
                className="text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:ring-1 focus:ring-clinical-teal"
              >
                <option value="MATCH_SCORE_DESC">Highest Capability Match (50-25-25)</option>
                <option value="ETA_ASC">Fastest Ambulance ETA (Shortest Travel)</option>
                <option value="COST_ASC">Lowest Estimated Treatment Cost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hyperlocal Zone & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
          {/* Kolkata Zone Selector */}
          <div>
            <label className="text-[11px] font-bold text-teal-800 block mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-600" />
              Kolkata Geographic Zone:
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value as KolkataZone | 'ALL_ZONES')}
              aria-label="Kolkata Geographic Zone"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            >
              {ZONE_OPTIONS.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Type Category */}
          <div>
            <label className="text-[11px] font-bold text-teal-800 block mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              Facility Model & Tier:
            </label>
            <select
              value={selectedFacilityType}
              onChange={(e) => setSelectedFacilityType(e.target.value as HospitalType | 'ALL_TYPES')}
              aria-label="Facility Model & Tier"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            >
              {FACILITY_TYPE_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Local Area / Pin Code Origin */}
          <div>
            <label className="text-[11px] font-bold text-teal-800 block mb-1 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-teal-600" />
              Patient Dispatch Locality:
            </label>
            <select
              value={selectedLocalityId}
              onChange={(e) => setSelectedLocalityId(e.target.value)}
              aria-label="Patient Dispatch Locality"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            >
              {KOLKATA_LOCALITIES.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.pincode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Specialty */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Clinical Specialty Requirement:
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value as SpecialtyOption)}
              aria-label="Clinical Specialty"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            >
              <option value="ALL">All Clinical Specialties</option>
              <option value="Oncology">Oncology (Cancer - PET/LINAC/Brachy)</option>
              <option value="Cardiology">Cardiology (Cath Lab & ECMO)</option>
              <option value="Neurology">Neurology (Neuro Micro & 3T MRI)</option>
              <option value="Nephrology">Nephrology (CRRT & Dialysis)</option>
              <option value="Trauma">Trauma (Level 1 / 2 Apex Centers)</option>
            </select>
          </div>

          {/* Govt Scheme & Insurance */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Cashless Scheme / Insurance Empanelment:
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value as SchemeOption)}
              aria-label="Cashless Scheme / Insurance"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            >
              <option value="ALL">All Schemes & Cashless Insurance</option>
              <option value="SWASTHYA_SATHI">Swasthya Sathi Accepted (West Bengal ₹5 Lakh Cashless)</option>
              <option value="PMJAY">Ayushman Bharat (PM-JAY) 100% Cashless</option>
              <option value="CGHS">Central Govt Health Scheme (CGHS)</option>
              <option value="STAR_HEALTH">Star Health TPA Cashless</option>
              <option value="HDFC_ERGO">HDFC ERGO Health Insurance</option>
            </select>
          </div>
        </div>

        {/* Must-Have Operational Equipment Multi-Select Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-clinical-teal" />
              Must-Have Verified Operational Equipment (Click to Require):
            </span>
            {mustHaveEquipment.length > 0 && (
              <button
                onClick={() => setMustHaveEquipment([])}
                className="text-[10px] text-rose-600 hover:underline font-bold"
              >
                Clear Equipment Filter ({mustHaveEquipment.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MUST_HAVE_EQUIPMENT_OPTIONS.map((item) => {
              const isSelected = mustHaveEquipment.includes(item.code);
              return (
                <button
                  key={item.code}
                  onClick={() => toggleMustHaveEquipment(item.code)}
                  className={`text-xs px-3 py-1 rounded-full font-mono transition-all ${
                    isSelected
                      ? 'bg-clinical-teal text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isSelected ? `✓ ${item.label}` : `+ ${item.label}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. VIEW MODE SWITCH: CARDS GRID vs QUICK DIRECTORY TABLE */}
      {viewMode === 'TABLE' ? (
        <HospitalQuickDirectoryTable
          hospitals={filteredAndSortedHospitals}
          onSelectHospital={(hosp) => setSelectedHospitalForModal(hosp)}
        />
      ) : filteredAndSortedHospitals.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedHospitals.map((hospWithScore, index) => {
            const { hospital, equipment: hospEquipment, treatmentCost, scoreBreakdown } = hospWithScore;
            const isCompareSelected = compareHospitals.some(
              (c) => c.hospital.hospital_id === hospital.hospital_id
            );
            const isGovt = hospital.hospital_type === 'Government';

            return (
              <div
                key={hospital.hospital_id}
                className={`bg-white rounded-3xl border transition-all duration-200 p-5 sm:p-6 relative shadow-clinical hover:shadow-clinical-hover ${
                  scoreBreakdown.referralRiskLevel === 'HIGH' || scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER'
                    ? 'border-amber-300'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                {/* Top Badges Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Rank Badge */}
                    <div className="w-9 h-9 rounded-xl bg-brand-navy text-white text-xs font-mono font-black flex items-center justify-center shrink-0 shadow-sm">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          onClick={() => setSelectedHospitalForModal(hospWithScore)}
                          className="text-base sm:text-lg font-black text-brand-navy hover:text-clinical-teal cursor-pointer transition-colors"
                        >
                          {hospital.name}
                        </h3>

                        {/* Ownership Tier */}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isGovt
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : hospital.hospital_type === 'Trust'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : hospital.hospital_type === 'Corporate'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {hospital.hospital_type.replace('_', ' ')}
                        </span>

                        {/* Verified NABH Badge */}
                        {hospital.nabh_accredited && (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-clinical-dark border border-teal-200">
                            <ShieldCheck className="w-3 h-3 text-clinical-teal" /> NABH Verified
                          </span>
                        )}
                      </div>

                      {/* Address & ABDM & Live Ambulance ETA */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                        <span>{hospital.address}, {hospital.city}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-600 font-semibold">
                          ABDM: {hospital.abdm_hfr_id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-800">
                          <Navigation className="w-3 h-3 text-clinical-teal" />
                          {hospital.distance_km} km
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 font-mono font-black text-brand-navy">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Ambulance ETA: {hospital.eta_minutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic 50-25-25 Match Score Ring with Breakdown Popup on Hover */}
                  <div
                    className="relative shrink-0 flex items-center sm:flex-col sm:items-end"
                    onMouseEnter={() => setHoveredScoreHospitalId(hospital.hospital_id)}
                    onMouseLeave={() => setHoveredScoreHospitalId(null)}
                  >
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                        50-25-25 Capability Match
                      </span>
                      <div
                        className={`font-mono text-xl sm:text-2xl font-black px-3 py-1 rounded-2xl border cursor-pointer inline-flex items-center gap-1.5 transition-transform hover:scale-105 ${
                          scoreBreakdown.totalScore >= 80
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                            : scoreBreakdown.totalScore >= 60
                            ? 'text-teal-700 bg-teal-50 border-teal-300'
                            : scoreBreakdown.totalScore >= 40
                            ? 'text-amber-700 bg-amber-50 border-amber-300'
                            : 'text-rose-700 bg-rose-50 border-rose-300'
                        }`}
                      >
                        <span>{scoreBreakdown.totalScore}% Match</span>
                      </div>
                    </div>

                    {/* Score Breakdown Floating Tooltip / Popover */}
                    {hoveredScoreHospitalId === hospital.hospital_id && (
                      <div className="absolute top-full right-0 mt-2 z-30 w-72 bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700 text-xs space-y-2 animate-in fade-in duration-150">
                        <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider block">
                          Exact 50-25-25 Algorithmic Synthesis:
                        </span>
                        <div className="space-y-1 font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Machine Readiness (50%):</span>
                            <span className="font-bold text-teal-300">
                              {scoreBreakdown.equipmentScore} / 50 pts
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Budget / Scheme Fit (25%):</span>
                            <span className="font-bold text-emerald-300">
                              {scoreBreakdown.financialScore} / 25 pts
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Ambulance ETA + NABH (25%):</span>
                            <span className="font-bold text-amber-300">
                              {scoreBreakdown.logisticsQualityScore} / 25 pts
                            </span>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                          Formula: Equipment Operational Ratio + Cashless Scheme Coverage + Travel Decay Score.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Referral Warning Banner (if present) */}
                {scoreBreakdown.clinicalWarning && (
                  <div
                    className={`mt-3.5 p-3 rounded-2xl flex items-start gap-2.5 text-xs ${
                      scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER'
                        ? 'bg-rose-50 border border-rose-300 text-rose-900'
                        : 'bg-amber-50 border border-amber-300 text-amber-900'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase">
                        {scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER'
                          ? 'DIVERSION ALERT:'
                          : 'CLINICAL DEFICIT WARNING:'}
                      </span>{' '}
                      {scoreBreakdown.clinicalWarning}
                    </div>
                  </div>
                )}

                {/* Live Equipment Inventory Matrix Badges */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-clinical-teal" />
                      Condition Equipment Inventory Telemetry:
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {scoreBreakdown.mandatoryEquipmentAvailable} of{' '}
                      {scoreBreakdown.mandatoryEquipmentTotal} Mandatory Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {activeCondition?.mandatory_equipment.map((code) => {
                      const eq = hospEquipment.find((e) => e.equipment_code === code);
                      const isOp = eq && eq.operational_status === 'OPERATIONAL' && eq.available_units > 0;
                      const isMaint = eq && eq.operational_status === 'MAINTENANCE';

                      return (
                        <div
                          key={code}
                          className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            isOp
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : isMaint
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-mono font-bold block text-[11px]">
                              {isOp ? `✔ ${code}` : isMaint ? `⚠ ${code}` : `✖ ${code}`}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {eq ? eq.brand_model : 'Unavailable here'}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isOp
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : isMaint
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-rose-200 text-rose-900'
                              }`}
                            >
                              {isOp
                                ? `Operational • Wait: ${eq.avg_wait_time_hours}h`
                                : isMaint
                                ? 'Under Maintenance'
                                : 'Unavailable here'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3-Tier Price & Scheme Box (in JetBrains Mono) */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-sans">
                      Estimated Procedure Cost Range:
                    </span>
                    <div className="text-sm font-extrabold text-brand-navy mt-0.5">
                      {treatmentCost ? (
                        <span>
                          {formatINR(treatmentCost.min_estimated_cost)} – {formatINR(treatmentCost.max_estimated_cost)}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans italic text-xs">
                          {isGovt ? '₹0 - ₹5,000 (Govt Free/Subsidized Scheme)' : 'Standard Tariff'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Govt Scheme Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    {hospital.pmjay_empanelled ? (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl">
                        ✓ ₹0 Cashless under PM-JAY
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-700 text-[11px] px-2 py-1 rounded-xl">
                        PM-JAY Out-of-Pocket
                      </span>
                    )}

                    {hospital.swasthya_sathi_accepted && (
                      <span className="bg-teal-100 text-teal-900 border border-teal-300 text-[11px] font-bold px-2.5 py-1 rounded-xl">
                        ✓ Swasthya Sathi Accepted
                      </span>
                    )}

                    <span className="bg-white text-slate-700 border border-slate-200 text-[11px] font-bold px-2 py-1 rounded-xl">
                      ICU: {hospital.icu_beds_available}/{hospital.icu_beds_total} Beds
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {/* [+ Compare] Checkbox */}
                    <button
                      onClick={() => toggleCompareHospital(hospWithScore)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                        isCompareSelected
                          ? 'bg-amber-100 border-amber-400 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isCompareSelected ? '✓ In Compare' : '+ Compare'}</span>
                    </button>

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => setWhatsAppModalHospital(hospWithScore)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] border border-[#25D366]/40 transition-colors"
                      title="Send summary to family via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                      <span>📲 WhatsApp Summary</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Pre-Arrival Checklist & Detail Modal */}
                    <button
                      onClick={() => setSelectedHospitalForModal(hospWithScore)}
                      className="flex items-center gap-1.5 bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                      <span>Inspect Machines & Pre-Arrival Checklist</span>
                      <ExternalLink className="w-3.5 h-3.5 text-clinical-light" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-clinical">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No hospitals match your active multi-filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Try loosening the must-have equipment selection or switching the ownership filter to &apos;All Categories&apos;.
          </p>
        </div>
      )}

      {/* 3. WORKING SIDE-BY-SIDE COMPARISON DRAWER & MODAL TRIGGER */}
      {compareHospitals.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900 text-white border-t-2 border-clinical-teal shadow-2xl py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/40">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {compareHospitals.length} of 3 Facilities Staged in Comparison Tray
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {compareHospitals.map((c) => c.hospital.name).join(' vs ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCompareHospitals}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
              >
                Clear All
              </button>

              <button
                onClick={() => setIsComparisonModalOpen(true)}
                className="flex items-center gap-1.5 bg-clinical-teal hover:bg-clinical-dark text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
              >
                <span>Launch 3-Way Comparison Matrix</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Comparison Matrix Modal */}
      {isComparisonModalOpen && (
        <HospitalComparisonModal
          hospitals={compareHospitals}
          activeConditionName={activeCondition?.condition_name}
          onClose={() => setIsComparisonModalOpen(false)}
          onRemove={(h) => toggleCompareHospital(h)}
          onOpenWhatsApp={(h) => setWhatsAppModalHospital(h)}
        />
      )}

      {/* WhatsApp Cloud API Dispatch Modal */}
      <WhatsAppDispatchModal
        hospitalWithScore={whatsAppModalHospital}
        activeConditionName={activeCondition?.condition_name}
        onClose={() => setWhatsAppModalHospital(null)}
      />
    </section>
  );
};
