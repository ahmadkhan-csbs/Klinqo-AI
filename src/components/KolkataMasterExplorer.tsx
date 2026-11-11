'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import {
  HEALTHCARE_INFRASTRUCTURE_TIERS,
  KOLKATA_MASTER_ZONES,
  HealthcareInfrastructureTier,
  KolkataMasterZone,
} from '@/data/kolkataMasterStructure';
import { HospitalType, KolkataZone } from '@/types/medical';
import {
  Building2,
  MapPin,
  Layers,
  Activity,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const KolkataMasterExplorer: React.FC = () => {
  const {
    setSelectedZone,
    setSelectedFacilityType,
    setSelectedHospitalForModal,
    rankedHospitals,
    executeTypoTolerantSearch,
    setSearchQuery,
    setSearchMode,
  } = useKlinqo();

  const [activeTab, setActiveTab] = useState<'TIERS' | 'ZONES'>('TIERS');
  const [selectedMasterZoneId, setSelectedMasterZoneId] = useState<string>('ZONE_NORTH_KOLKATA');
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);

  const activeMasterZone =
    KOLKATA_MASTER_ZONES.find((z) => z.id === selectedMasterZoneId) || KOLKATA_MASTER_ZONES[0];

  // Handle clicking a tier card or institution pill
  const handleSelectTier = (tier: HealthcareInfrastructureTier) => {
    setHighlightedCategory(tier.title);
    if (tier.category === 'Government Healthcare') {
      setSelectedFacilityType('Government');
    } else if (tier.id === 4) {
      setSelectedFacilityType('Corporate');
    } else if (tier.id === 5) {
      setSelectedFacilityType('Nursing_Home');
    } else if (tier.id === 6) {
      setSelectedFacilityType('Diagnostic_Clinic');
    } else {
      setSelectedFacilityType('ALL_TYPES');
    }
  };

  const handleSelectInstitutionPill = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Search or find hospital
    setSearchMode('DISEASE');
    setSearchQuery(name);
    executeTypoTolerantSearch(name);

    // Also see if there is an exact hospital match in rankedHospitals
    const matched = rankedHospitals.find(
      (h) => h.hospital.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(h.hospital.name.toLowerCase())
    );
    if (matched) {
      setSelectedHospitalForModal(matched);
    }
  };

  // Handle selecting a master zone
  const handleSelectMasterZone = (zone: KolkataMasterZone) => {
    setSelectedMasterZoneId(zone.id);
    if (zone.id === 'ZONE_NORTH_KOLKATA') {
      setSelectedZone('ZONE_NORTH_DUMDUM_BARASAT');
    } else if (zone.id === 'ZONE_CENTRAL_KOLKATA') {
      setSelectedZone('ZONE_CENTRAL_ALIPORE');
    } else if (zone.id === 'ZONE_SOUTH_KOLKATA') {
      setSelectedZone('ZONE_SOUTH_BEHALA_GARIA');
    } else if (zone.id === 'ZONE_EAST_KOLKATA') {
      setSelectedZone('ZONE_EM_BYPASS');
    } else if (zone.id === 'ZONE_WEST_KOLKATA_SUBURBS') {
      setSelectedZone('ZONE_HOWRAH_KALYANI');
    }
  };

  const handleSelectNeighborhood = (neighborhood: string) => {
    setSearchQuery(neighborhood);
    executeTypoTolerantSearch(neighborhood);
  };

  const handleSelectKeyHospital = (hospitalId?: string, hospitalName?: string) => {
    if (hospitalId) {
      const found = rankedHospitals.find((h) => h.hospital.hospital_id === hospitalId);
      if (found) {
        setSelectedHospitalForModal(found);
        return;
      }
    }
    if (hospitalName) {
      handleSelectInstitutionPill(hospitalName, { stopPropagation: () => {} } as any);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-clinical-lg p-5 sm:p-7 mb-8 space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-clinical-teal flex items-center justify-center border border-teal-200 shadow-2xs">
              <Layers className="w-5 h-5 text-clinical-teal" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-navy tracking-tight flex items-center gap-2">
                <span>Kolkata Healthcare Infrastructure &amp; Zonal Atlas</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                  144 Wards • 16 Boroughs • 3,880+ Setups
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official urban healthcare mapping of Kolkata Metropolitan Area. Click any tier or zone to filter live discovery.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-bold border border-slate-200 self-start lg:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('TIERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'TIERS'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-navy'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>6-Tier Infrastructure Directory</span>
            <span className="text-[10px] bg-slate-800/40 text-teal-300 font-mono px-1.5 py-0.2 rounded">
              3,880+
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ZONES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ZONES'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-navy'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>5-Zone &amp; KMC Borough Explorer</span>
            <span className="text-[10px] bg-slate-800/40 text-teal-300 font-mono px-1.5 py-0.2 rounded">
              16 Boroughs
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: 6-TIER HEALTHCARE INFRASTRUCTURE DIRECTORY */}
      {activeTab === 'TIERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Click any tier card to filter hospitals by model, or click an institution pill to view its live status:
            </span>
            {highlightedCategory && (
              <button
                onClick={() => {
                  setHighlightedCategory(null);
                  setSelectedFacilityType('ALL_TYPES');
                }}
                className="text-[11px] text-rose-600 font-bold hover:underline"
              >
                Reset Tier Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HEALTHCARE_INFRASTRUCTURE_TIERS.map((tier) => {
              const isSelected = highlightedCategory === tier.title;
              return (
                <div
                  key={tier.id}
                  onClick={() => handleSelectTier(tier)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-clinical-md relative ${
                    isSelected
                      ? 'border-clinical-teal bg-teal-50/40 ring-2 ring-clinical-teal/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Tier {tier.id} • {tier.category}
                      </span>
                      <span className="text-xs font-mono font-black text-brand-navy bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                        {tier.count}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-brand-navy mb-2 leading-snug">
                      {tier.title}
                    </h3>

                    {/* Example Institutions Pills */}
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {tier.examples.map((ex, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => handleSelectInstitutionPill(ex, e)}
                          className="text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-300 px-2 py-0.5 rounded-lg text-slate-700 font-medium transition-colors text-left"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>Click card to filter facilities</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 5-ZONE & KMC BOROUGH EXPLORER */}
      {activeTab === 'ZONES' && (
        <div className="space-y-5">
          {/* 5-Zone Navigation Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {KOLKATA_MASTER_ZONES.map((zone) => {
              const isSelected = activeMasterZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectMasterZone(zone)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-brand-navy text-white border-brand-navy shadow-md ring-2 ring-clinical-teal/40'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-80">
                      {zone.shortName}
                    </span>
                  </div>
                  <span className="font-black text-xs block leading-tight truncate">
                    {zone.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Zone Detail Showcase Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-brand-navy flex items-center gap-2">
                  <span>{activeMasterZone.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                    Active Inspection Zone
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {activeMasterZone.description}
                </p>
              </div>

              {/* Density Profile Badge */}
              <div className="max-w-md bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                <span className="font-bold text-teal-800 block mb-0.5 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-600" /> Healthcare Density Profile:
                </span>
                <p className="leading-snug text-slate-600">
                  {activeMasterZone.densityProfile}
                </p>
              </div>
            </div>

            {/* Neighborhoods & KMC Boroughs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prominent Neighborhoods */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Prominent Neighborhoods (Click to filter):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMasterZone.neighborhoods.map((nbr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectNeighborhood(nbr)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-300 text-slate-800 transition-colors"
                    >
                      📍 {nbr}
                    </button>
                  ))}
                </div>
              </div>

              {/* KMC Boroughs Covered */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Administrative KMC Boroughs &amp; Civic Bodies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMasterZone.kmcBoroughs.map((boro, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200"
                    >
                      🏛️ {boro}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Healthcare Facilities In This Zone */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Key Healthcare Facilities in {activeMasterZone.name} (Click to open full clinical audit):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeMasterZone.keyHospitals.map((hosp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectKeyHospital(hosp.hospitalId, hosp.name)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/30 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-xs text-brand-navy block group-hover:text-clinical-teal transition-colors">
                        {hosp.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {hosp.type === 'Govt' ? 'Government Apex' : hosp.type === 'Trust' ? 'Charitable Trust' : 'Corporate SuperSpecialty'}
                        {hosp.specialty ? ` • ${hosp.specialty}` : ''}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-clinical-teal" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
