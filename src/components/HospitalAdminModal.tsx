'use client';

import React, { useState, useMemo } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import {
  Hospital,
  HospitalEquipment,
  OperationalStatus,
  EquipmentCode,
} from '@/types/medical';
import {
  X,
  Sliders,
  Building2,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  BedDouble,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldCheck,
  Radio,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface HospitalAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HospitalAdminModal: React.FC<HospitalAdminModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    hospitals,
    equipment,
    updateEquipmentStatus,
    updateHospitalMetrics,
    activeCondition,
    rankedHospitals,
    setActiveTab,
  } = useKlinqo();

  // Selected hospital in the B2B portal
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    hospitals[0]?.hospital_id || 'hosp-003' // Default to Apollo or TMC
  );

  const [equipmentFilter, setEquipmentFilter] = useState<'ALL' | OperationalStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastMutatedMachine, setLastMutatedMachine] = useState<string | null>(null);

  // Active hospital
  const currentHospital = useMemo(() => {
    return (
      hospitals.find((h) => h.hospital_id === selectedHospitalId) || hospitals[0]
    );
  }, [hospitals, selectedHospitalId]);

  // Current hospital's capability match score
  const currentHospitalScore = useMemo(() => {
    return rankedHospitals.find(
      (rh) => rh.hospital.hospital_id === selectedHospitalId
    );
  }, [rankedHospitals, selectedHospitalId]);

  // Current hospital's equipment list
  const hospitalEquipment = useMemo(() => {
    return equipment.filter((eq) => eq.hospital_id === selectedHospitalId);
  }, [equipment, selectedHospitalId]);

  // Filtered equipment list
  const filteredEquipment = useMemo(() => {
    return hospitalEquipment.filter((eq) => {
      const matchesStatus =
        equipmentFilter === 'ALL' || eq.operational_status === equipmentFilter;
      const matchesSearch =
        eq.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.brand_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.equipment_code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [hospitalEquipment, equipmentFilter, searchTerm]);

  // Operational telemetry counts
  const operationalCount = hospitalEquipment.filter(
    (e) => e.operational_status === 'OPERATIONAL'
  ).length;
  const maintenanceCount = hospitalEquipment.filter(
    (e) => e.operational_status === 'MAINTENANCE'
  ).length;
  const unavailableCount = hospitalEquipment.filter(
    (e) => e.operational_status === 'UNAVAILABLE'
  ).length;

  if (!isOpen) return null;

  const handleStatusChange = (
    eq: HospitalEquipment,
    newStatus: OperationalStatus
  ) => {
    updateEquipmentStatus(
      eq.id,
      newStatus,
      newStatus === 'OPERATIONAL' ? Math.max(1, eq.total_units) : 0,
      newStatus === 'MAINTENANCE'
        ? 'B2B Admin Manual Override: Emergency tube replacement & QA calibration'
        : 'Decommissioned / Down'
    );
    setLastMutatedMachine(eq.equipment_name);
    setTimeout(() => setLastMutatedMachine(null), 4000);
  };

  const handleWaitTimeChange = (eq: HospitalEquipment, hours: number) => {
    updateEquipmentStatus(
      eq.id,
      eq.operational_status,
      eq.available_units,
      eq.maintenance_reason,
      hours
    );
  };

  const handleIcuBedChange = (delta: number) => {
    if (!currentHospital || !updateHospitalMetrics) return;
    const newAvailable = Math.max(
      0,
      Math.min(currentHospital.icu_beds_total, currentHospital.icu_beds_available + delta)
    );
    updateHospitalMetrics(currentHospital.hospital_id, {
      icu_beds_available: newAvailable,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-brand-navy text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg font-black text-xl shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  B2B HOSPITAL ADMIN & TELEMETRY
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Live ABDM HFR Sync
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Real-Time Hospital Infrastructure & Machine Grid Controller
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Mutate live machine statuses, monitor regional search demand, and verify real-time 50-25-25 capability score drops across Klinqo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Mutation Toast Banner */}
        {lastMutatedMachine && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-950" />
              <span>
                <strong>Live Mutation Dispatched:</strong> &quot;{lastMutatedMachine}&quot; status updated. Klinqo 50-25-25 scoring algorithm has instantly re-ranked all hospitals!
              </span>
            </span>
            <span className="font-mono text-[11px] underline">Recalculated in 4ms</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 pt-6 pb-8">
          {/* Hospital Selector Bar & Live Score Gauge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Select Facility to Administer &amp; Audit:
              </label>
              <div className="relative">
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy shadow-xs focus:ring-2 focus:ring-clinical-teal focus:border-clinical-teal"
                >
                  {hospitals.map((h) => (
                    <option key={h.hospital_id} value={h.hospital_id}>
                      {h.name} ({h.city} • {h.hospital_type} • {h.tier_category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Capability Score Card */}
            {currentHospitalScore && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shrink-0 shadow-xs">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg ${
                    currentHospitalScore.scoreBreakdown.totalScore >= 80
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : currentHospitalScore.scoreBreakdown.totalScore >= 60
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}
                >
                  {currentHospitalScore.scoreBreakdown.totalScore}%
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Public Match Score ({activeCondition?.condition_name || 'Active Condition'})
                  </span>
                  <div className="text-xs font-semibold text-brand-navy">
                    {currentHospitalScore.scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER' ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> High Referral Risk (Missing Machine)
                      </span>
                    ) : currentHospitalScore.scoreBreakdown.totalScore >= 80 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Capability Match
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Equipment Penalty Applied
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Facility Quick Controls (ICU Beds, Emergency status, ABDM verification) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-clinical-teal" />
                Live ICU Beds
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black font-mono text-brand-navy">
                  {currentHospital?.icu_beds_available} / {currentHospital?.icu_beds_total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleIcuBedChange(-1)}
                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center justify-center text-sm"
                    title="Admit 1 ICU Patient"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleIcuBedChange(1)}
                    className="w-7 h-7 bg-clinical-teal hover:bg-teal-700 text-white rounded-lg font-bold flex items-center justify-center text-sm"
                    title="Discharge 1 ICU Bed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Operational Machines
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-700">
                  {operationalCount}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">of {hospitalEquipment.length} total units</span>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Under Maintenance
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-700">
                  {maintenanceCount}
                </span>
                <span className="text-xs text-amber-600 font-semibold">Scheduled / Service</span>
              </div>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Unavailable
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-rose-700">
                  {unavailableCount}
                </span>
                <span className="text-xs text-rose-600 font-semibold">Decommissioned</span>
              </div>
            </div>
          </div>

          {/* Equipment Inventory Grid with 1-Click Status Toggles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-brand-navy flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-clinical-teal" />
                  Live Equipment Telemetry &amp; Downtime Controller
                </h3>
                <p className="text-xs text-slate-500">
                  Click any pill to immediately simulate downtime or operational recovery.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setEquipmentFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    equipmentFilter === 'ALL'
                      ? 'bg-white text-brand-navy shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({hospitalEquipment.length})
                </button>
                <button
                  onClick={() => setEquipmentFilter('OPERATIONAL')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    equipmentFilter === 'OPERATIONAL'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🟢 Operational ({operationalCount})
                </button>
                <button
                  onClick={() => setEquipmentFilter('MAINTENANCE')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    equipmentFilter === 'MAINTENANCE'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🟡 Maintenance ({maintenanceCount})
                </button>
              </div>
            </div>

            {/* Equipment Table / Cards */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {filteredEquipment.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No equipment matching filter.
                </div>
              ) : (
                filteredEquipment.map((eq) => {
                  const isCriticalForActiveCondition =
                    activeCondition?.mandatory_equipment.includes(eq.equipment_code);

                  return (
                    <div
                      key={eq.id}
                      className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                        eq.operational_status === 'MAINTENANCE'
                          ? 'bg-amber-50/40'
                          : eq.operational_status === 'UNAVAILABLE'
                          ? 'bg-rose-50/40'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-brand-navy">
                            {eq.equipment_name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            {eq.equipment_code}
                          </span>
                          {isCriticalForActiveCondition && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Mandatory for {activeCondition?.condition_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Brand/Model: <span className="text-slate-700 font-semibold">{eq.brand_model}</span> • Total Units: {eq.total_units} • Available: {eq.available_units}
                        </p>
                        {eq.maintenance_reason && (
                          <p className="text-xs text-amber-700 italic">
                            ⚠️ Reason: {eq.maintenance_reason} ({eq.expected_restoration || 'TBD'})
                          </p>
                        )}
                      </div>

                      {/* Controls: Wait time editor + Status toggle pill */}
                      <div className="flex items-center flex-wrap gap-3 shrink-0">
                        {/* Wait Time Selector */}
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500">Wait:</span>
                          <select
                            value={eq.avg_wait_time_hours}
                            onChange={(e) =>
                              handleWaitTimeChange(eq, parseFloat(e.target.value))
                            }
                            className="bg-transparent font-mono font-bold text-slate-800 focus:outline-hidden text-xs"
                          >
                            <option value={0.5}>0.5 hr</option>
                            <option value={1}>1.0 hr</option>
                            <option value={2}>2.0 hrs</option>
                            <option value={4}>4.0 hrs</option>
                            <option value={8}>8.0 hrs</option>
                            <option value={24}>24 hrs</option>
                            <option value={72}>72 hrs</option>
                          </select>
                        </div>

                        {/* Interactive Status Switcher Buttons */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          <button
                            onClick={() => handleStatusChange(eq, 'OPERATIONAL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              eq.operational_status === 'OPERATIONAL'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Operational</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(eq, 'MAINTENANCE')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              eq.operational_status === 'MAINTENANCE'
                                ? 'bg-amber-400 text-slate-950 shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Maintenance</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(eq, 'UNAVAILABLE')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              eq.operational_status === 'UNAVAILABLE'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Unavailable</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* B2B Local Demand & Regional Shortage Analytics (SaaS Preview) */}
          <div className="bg-gradient-to-br from-slate-900 via-brand-navy to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-clinical-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest bg-teal-500/20 text-clinical-light border border-teal-500/40 px-2 py-0.5 rounded-full">
                    REGIONAL EPIDEMIOLOGY &amp; CAPACITY SAAS
                  </span>
                  <span className="text-xs text-teal-300 font-mono">Radius: 50 km around {currentHospital?.city}</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  Local Patient Demand &amp; Machine Deficit Analytics
                </h3>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Aggregated from 42,800+ Klinqo anonymized patient queries
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Top Searched Conditions */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-clinical-teal" />
                  Top Searched Diseases (Last 30 Days)
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">1. Cervical &amp; Lung Carcinoma (Radiation)</span>
                    <span className="font-mono font-bold text-emerald-400">38.4%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[38%]"></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-200">2. Acute STEMI Heart Attack</span>
                    <span className="font-mono font-bold text-teal-300">29.1%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-clinical-teal h-full w-[29%]"></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-200">3. ESRD Dialysis &amp; CRRT</span>
                    <span className="font-mono font-bold text-amber-300">18.6%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[19%]"></div>
                  </div>
                </div>
              </div>

              {/* Card 2: Highest Machine Deficit In Cluster */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  High Deficit Machines in {currentHospital?.city}
                </span>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700">
                    <div className="flex justify-between font-bold text-white">
                      <span>Linear Accelerator (LINAC)</span>
                      <span className="text-rose-400 font-mono">92% Utilized</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Average queue: 14.8 days in government centers. 1 unit in maintenance causes 350+ patient diverts/mo.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700">
                    <div className="flex justify-between font-bold text-white">
                      <span>Digital PET-CT</span>
                      <span className="text-amber-400 font-mono">84% Utilized</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Radiotracer 18F-FDG cycle delays reported across 2 facilities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Referral Revenue Recovery Opportunity */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Preventable Patient Leakage
                </span>
                <div className="space-y-2 text-xs">
                  <div className="text-2xl font-black font-mono text-white">
                    ₹1.42 Cr / mo
                  </div>
                  <p className="text-slate-300 text-xs">
                    Estimated referral revenue lost by local facilities due to uncommunicated machine maintenance and unequipped nursing home delays.
                  </p>
                  <div className="pt-2">
                    <span className="inline-block text-[11px] font-bold text-teal-300 bg-teal-950/60 border border-teal-800 px-2 py-1 rounded-lg">
                      💡 ArogyaPath B2B API sync reduces referral delays by 84%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Any equipment mutation takes effect immediately across all patient discovery grids and route maps.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('finder');
                onClose();
              }}
              className="px-4 py-2 bg-clinical-teal hover:bg-clinical-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>View Updated Public Discovery Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              Close Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
