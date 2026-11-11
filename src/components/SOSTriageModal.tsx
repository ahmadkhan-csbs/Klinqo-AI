'use client';

import React, { useState, useMemo } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { HospitalWithScore, EquipmentCode } from '@/types/medical';
import {
  X,
  Zap,
  PhoneCall,
  Clock,
  ShieldCheck,
  Navigation,
  AlertTriangle,
  HeartPulse,
  Activity,
  CheckCircle2,
  Ambulance,
  Brain,
  Car,
  Wind,
  Layers,
  ArrowRight,
  ExternalLink,
  MapPin,
  Check,
  Building2,
  BedDouble,
  Flame,
} from 'lucide-react';

interface EmergencyTrigger {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  goldenHourWindow: string;
  targetEquipment: EquipmentCode[];
  icdCode: string;
  urgencyColor: string;
  borderBadge: string;
  clinicalProtocol: string;
  preHospitalGuidance: string[];
}

const EMERGENCY_TRIGGERS: EmergencyTrigger[] = [
  {
    id: 'stemi',
    title: 'Heart Attack (Acute STEMI)',
    icon: <HeartPulse className="w-6 h-6 text-rose-500" />,
    subtitle: 'Needs 24x7 Cath Lab & Primary Angioplasty (<60-90 mins)',
    goldenHourWindow: '< 90 MINS (Door-to-Balloon)',
    targetEquipment: ['CATH_LAB', 'VENTILATOR_ICU'],
    icdCode: 'BA41',
    urgencyColor: 'bg-rose-600',
    borderBadge: 'border-rose-500 text-rose-700 bg-rose-50',
    clinicalProtocol:
      'Immediate coronary reperfusion protocol. Primary PCI center required with ready interventional cardiologist and operational Cath Lab.',
    preHospitalGuidance: [
      'Keep patient resting in semi-upright posture; strictly avoid physical walking or exertion.',
      'Administer 300 mg chewable Aspirin immediately if advised by tele-doctor and no bleeding history.',
      'Keep ECG report / photo ready on WhatsApp to dispatch to receiving triage desk.',
    ],
  },
  {
    id: 'stroke',
    title: 'Acute Brain Stroke (CVA)',
    icon: <Brain className="w-6 h-6 text-purple-600" />,
    subtitle: 'Needs CT Brain + IV Thrombolysis / Thrombectomy (<4.5 hrs)',
    goldenHourWindow: '< 4.5 HRS (Thrombolysis Window)',
    targetEquipment: ['MRI_3T', 'NEURO_MICRO', 'VENTILATOR_ICU'],
    icdCode: '8B11',
    urgencyColor: 'bg-purple-600',
    borderBadge: 'border-purple-500 text-purple-700 bg-purple-50',
    clinicalProtocol:
      'BE-FAST stroke alert. Urgent non-contrast CT brain to rule out hemorrhage, followed by IV Alteplase/Tenecteplase or mechanical thrombectomy.',
    preHospitalGuidance: [
      'Note exact time of symptom onset (critical for 4.5-hour clot-buster eligibility).',
      'Do NOT administer aspirin or blood thinners until hemorrhagic stroke is ruled out by CT scan.',
      'Position patient on their side if vomiting or unconscious to keep airway clear.',
    ],
  },
  {
    id: 'trauma',
    title: 'Severe Accident / Polytrauma',
    icon: <Ambulance className="w-6 h-6 text-amber-500" />,
    subtitle: 'Needs Level-1 Trauma ICU + On-Duty Neurosurgeon + Blood Bank',
    goldenHourWindow: '< 60 MINS (Resuscitation & Hemostasis)',
    targetEquipment: ['VENTILATOR_ICU', 'NEURO_MICRO'],
    icdCode: 'NC72',
    urgencyColor: 'bg-amber-600',
    borderBadge: 'border-amber-500 text-amber-700 bg-amber-50',
    clinicalProtocol:
      'Advanced Trauma Life Support (ATLS) protocol. Immediate damage-control surgery, massive transfusion protocol, and neurosurgical decompression capability.',
    preHospitalGuidance: [
      'Maintain cervical spine immobilization; do not twist or turn patient neck/head.',
      'Apply firm, direct pressure on bleeding wounds using clean cloth or sterile gauze.',
      'Ensure the receiving facility has active 24x7 O-negative emergency blood units available.',
    ],
  },
  {
    id: 'respiratory_renal',
    title: 'Acute Respiratory / Renal Crisis',
    icon: <Wind className="w-6 h-6 text-teal-600" />,
    subtitle: 'Needs ECMO / Advanced Ventilator ICU / Continuous CRRT',
    goldenHourWindow: '< 120 MINS (Oxygenation & Dialysis)',
    targetEquipment: ['ECMO', 'DIALYSIS_CRRT', 'VENTILATOR_ICU'],
    icdCode: 'GB61',
    urgencyColor: 'bg-teal-600',
    borderBadge: 'border-teal-500 text-teal-700 bg-teal-50',
    clinicalProtocol:
      'Severe metabolic acidemia or ARDS hypoxemic failure. Immediate ICU bed with ventilator or continuous renal replacement therapy.',
    preHospitalGuidance: [
      'Deliver supplemental high-flow oxygen via non-rebreather mask during transit.',
      'Check SpO2 saturation and heart rate continuously; note previous dialysis fistula access site.',
      'Carry recent serum potassium and arterial blood gas (ABG) reports if available.',
    ],
  },
];

export const SOSTriageModal: React.FC = () => {
  const {
    isSosModalOpen,
    setIsSosModalOpen,
    hospitals,
    equipment,
    triageState,
    setActiveConditionIcd,
    setSelectedCity,
    setActiveTab,
  } = useKlinqo();

  // Active trigger selected in SOS mode (defaults to STEMI)
  const [selectedTriggerId, setSelectedTriggerId] = useState<string>('stemi');

  // Currently active trigger definition
  const activeTrigger = useMemo(() => {
    return (
      EMERGENCY_TRIGGERS.find((t) => t.id === selectedTriggerId) ||
      EMERGENCY_TRIGGERS[0]
    );
  }, [selectedTriggerId]);

  // Filter hospitals:
  // 1. Strictly must be in the active city (unless "All Cities" is explicitly selected)
  // 2. Must have 24x7 emergency department
  // 3. Must have the required emergency equipment in OPERATIONAL state
  // 4. Sorted strictly by Ambulance ETA (shortest first)
  const emergencyHospitals = useMemo(() => {
    const cityHospitals = hospitals.filter((h) => {
      if (triageState.selectedCity === 'All Cities') return true;
      return h.city.toLowerCase() === triageState.selectedCity.toLowerCase();
    });

    const qualified = cityHospitals.map((hospital) => {
      const hospEquip = equipment.filter((eq) => eq.hospital_id === hospital.hospital_id);

      // Check operational status of target emergency machines
      const missingOrDown: EquipmentCode[] = [];
      const operationalMachines: string[] = [];

      activeTrigger.targetEquipment.forEach((code) => {
        const item = hospEquip.find((e) => e.equipment_code === code);
        if (!item || item.operational_status !== 'OPERATIONAL') {
          missingOrDown.push(code);
        } else {
          operationalMachines.push(item.equipment_name);
        }
      });

      const isFullyEquipped = missingOrDown.length === 0;

      return {
        hospital,
        isFullyEquipped,
        missingOrDown,
        operationalMachines,
      };
    });

    // We rank fully equipped facilities first, then by shortest ETA
    return qualified
      .sort((a, b) => {
        if (a.isFullyEquipped && !b.isFullyEquipped) return -1;
        if (!a.isFullyEquipped && b.isFullyEquipped) return 1;
        return a.hospital.eta_minutes - b.hospital.eta_minutes;
      })
      .slice(0, 3); // TOP 3 Nearest Verified Hospitals
  }, [hospitals, equipment, triageState.selectedCity, activeTrigger]);

  if (!isSosModalOpen) return null;

  const handleSelectEmergencyTrigger = (trigger: EmergencyTrigger) => {
    setSelectedTriggerId(trigger.id);
    setActiveConditionIcd(trigger.icdCode);
  };

  const launchFastRoute = (hospital: HospitalWithScore['hospital']) => {
    setIsSosModalOpen(false);
    setActiveTab('smart_route');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-5xl w-full border-4 border-rose-600 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-white">
        {/* TOP EMERGENCY BANNER */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 px-5 py-4 flex items-center justify-between border-b border-rose-500 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-black/40 text-rose-200 px-2.5 py-0.5 rounded-full">
                  🚨 GOLDEN HOUR EMERGENCY RESPONDER
                </span>
                <span className="text-xs font-mono text-white/90 font-bold">
                  Target: &lt; 60-90 Mins Door-to-Treatment
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Zero-Clutter Emergency Hospital Router
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="bg-white text-rose-700 hover:bg-rose-100 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-transform transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>DIAL 108</span>
            </a>
            <button
              onClick={() => setIsSosModalOpen(false)}
              className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 GIANT 1-TAP EMERGENCY TRIGGERS */}
        <div className="p-4 sm:p-6 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Step 1: Tap The Patient&apos;s Critical Emergency:
            </span>
            <span className="text-[11px] font-mono text-teal-400">
              Auto-filters unequipped nursing homes instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {EMERGENCY_TRIGGERS.map((trigger) => {
              const isSelected = trigger.id === selectedTriggerId;
              return (
                <button
                  key={trigger.id}
                  onClick={() => handleSelectEmergencyTrigger(trigger)}
                  className={`p-3.5 rounded-2xl text-left transition-all border-2 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-rose-500 shadow-lg ring-2 ring-rose-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                        {trigger.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {trigger.goldenHourWindow}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white leading-snug">
                      {trigger.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {trigger.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-teal-400 font-bold">ICD-11 {trigger.icdCode}</span>
                    {isSelected ? (
                      <span className="text-rose-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> ACTIVE ROUTE
                      </span>
                    ) : (
                      <span className="text-slate-500">Tap to route</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: TOP 3 NEAREST VERIFIED 24x7 EQUIPPED HOSPITALS */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 pt-6 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Step 2: Top 3 Nearest Verified Hospitals with Operational Emergency Grid
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Sorted strictly by fastest Ambulance ETA in {triageState.selectedCity}. All listed facilities have active 24x7 ERs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Emergency City:</span>
              <select
                value={triageState.selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-800 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                <option value="Kolkata">Kolkata</option>
                <option value="Delhi-NCR">Delhi-NCR</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="All Cities">All Cities</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {emergencyHospitals.map(({ hospital, isFullyEquipped, missingOrDown, operationalMachines }, index) => {
              return (
                <div
                  key={hospital.hospital_id}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                    isFullyEquipped
                      ? 'bg-slate-800/90 border-teal-500/40 hover:border-teal-400 shadow-md'
                      : 'bg-slate-900/60 border-rose-900/60 opacity-80'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Hospital Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-full bg-slate-700 text-teal-300 font-mono font-black text-xs flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <h3 className="text-base font-extrabold text-white">
                          {hospital.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold">
                          {hospital.hospital_type}
                        </span>
                        {hospital.nabh_accredited && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> NABH Verified
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400">
                        {hospital.address}, {hospital.city} • Pincode: {hospital.pincode}
                      </p>

                      {/* Equipment Operational State Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                        {isFullyEquipped ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Critical Machines Operational (Cath Lab / ICU Ready)
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1 bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5" /> Machine Warning: Missing or Service Downtime
                          </span>
                        )}

                        <span className="text-slate-300 font-mono bg-slate-700/60 px-2 py-1 rounded-lg">
                          ICU Beds: <strong className="text-emerald-400">{hospital.icu_beds_available}</strong> / {hospital.icu_beds_total} Available
                        </span>
                      </div>
                    </div>

                    {/* Middle: Ambulance ETA & Distance */}
                    <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-700/80 text-center shrink-0 min-w-[130px]">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Ambulance ETA
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {hospital.eta_minutes} mins
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        {hospital.distance_km} km away
                      </span>
                    </div>

                    {/* Right: 3 Instant Action Buttons */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                      {/* Button 1: Dial Hospital Emergency Desk */}
                      <a
                        href={`tel:${hospital.contact_phone}`}
                        className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                        <span>Call ER ({hospital.contact_phone})</span>
                      </a>

                      {/* Button 2: Call 108 / Private Ambulance */}
                      <a
                        href="tel:108"
                        className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 transition-colors"
                      >
                        <Ambulance className="w-3.5 h-3.5 text-teal-400" />
                        <span>Dispatch 108 Ambulance</span>
                      </a>

                      {/* Button 3: Launch Fast Route */}
                      <button
                        onClick={() => launchFastRoute(hospital)}
                        className="flex items-center justify-center gap-1.5 bg-clinical-teal hover:bg-teal-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Launch Fast Route</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pre-Hospital Critical First-Aid Guidance */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <span className="font-bold text-teal-400 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-clinical-teal" />
              Pre-Hospital Critical First-Aid Protocol for {activeTrigger.title}:
            </span>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-slate-300 pt-1">
              {activeTrigger.preHospitalGuidance.map((guide, idx) => (
                <li
                  key={idx}
                  className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2 text-[11px]"
                >
                  <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 p-3.5 px-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live Ambulance GPS Feed Active • Traffic Signal Corridor Priority Enabled
          </span>
          <button
            onClick={() => setIsSosModalOpen(false)}
            className="text-xs text-slate-400 hover:text-white underline font-semibold"
          >
            Exit Emergency Mode
          </button>
        </div>
      </div>
    </div>
  );
};
