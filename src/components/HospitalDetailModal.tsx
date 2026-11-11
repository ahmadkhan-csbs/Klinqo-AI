'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { formatINR } from '@/utils/scoringEngine';
import { MANIPAL_MUKUNDAPUR_DOCTORS } from '@/data/manipalMukundapurDoctors';
import {
  X,
  ShieldCheck,
  Cpu,
  Clock,
  IndianRupee,
  Navigation,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Bed,
  Droplet,
  Flame,
  UserCheck,
  Scale,
  FileCheck,
  CheckSquare,
  Square,
  QrCode,
  Sparkles,
  Users,
  Star,
  Search,
} from 'lucide-react';

export const HospitalDetailModal: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    id_proof: true,
    scheme_card: true,
  });
  const [referralTokenGenerated, setReferralTokenGenerated] = useState(false);

  const {
    selectedHospitalForModal,
    setSelectedHospitalForModal,
    activeCondition,
    toggleEquipmentStatusQuick,
    compareHospitals,
    toggleCompareHospital,
  } = useKlinqo();

  if (!selectedHospitalForModal) return null;

  const { hospital, equipment, treatmentCost, scoreBreakdown } =
    selectedHospitalForModal;

  const isSelectedForCompare = compareHospitals.some(
    (h) => h.hospital.hospital_id === hospital.hospital_id
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-border shadow-2xl relative">
        {/* Sticky Modal Top Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-border flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-navy text-white">
                {hospital.hospital_type}
              </span>
              <h2 className="text-lg font-extrabold text-brand-navy">
                {hospital.name}
              </h2>
              {hospital.nabh_accredited && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-clinical-dark border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal" /> NABH
                </span>
              )}
              {hospital.established_year && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Est. {hospital.established_year}
                </span>
              )}
              {hospital.free_statutory_care && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  100% Free Public Bed &amp; Diagnostics
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ABDM HFR ID: <span className="font-mono font-bold text-slate-700">{hospital.abdm_hfr_id}</span> • Verified: {new Date(hospital.last_verified_at).toLocaleDateString()}
              {hospital.opd_timings && <span> • OPD: <strong className="text-slate-700">{hospital.opd_timings}</strong></span>}
            </p>
          </div>

          <button
            onClick={() => setSelectedHospitalForModal(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Hospital Historical & Clinical Highlights Overview Banner */}
          {(hospital.description || hospital.clinical_highlights || hospital.key_specialties) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
              {hospital.description && (
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {hospital.description}
                </p>
              )}

              {hospital.clinical_highlights && (
                <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Clinical Super-Specialty Highlights:
                  </span>
                  <p className="text-xs text-teal-950 font-semibold leading-normal">
                    {hospital.clinical_highlights}
                  </p>
                </div>
              )}

              {hospital.key_specialties && hospital.key_specialties.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Clinical Departments &amp; Specializations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.key_specialties.map((dept, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Capability Score Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-clinical-md">
            <div>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                Live 50-25-25 Capability Index for {activeCondition?.condition_name.split('(')[0]}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-extrabold text-white">
                  {scoreBreakdown.totalScore}%
                </span>
                <span className="text-xs text-slate-300">
                  Overall Composite Triage Score
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-xl">
                Algorithmic synthesis of 50% operational equipment availability, 25% financial/PM-JAY cashless fit, and 25% ambulance transit time + NABH accreditation.
              </p>
            </div>

            <div className="shrink-0 grid grid-cols-3 gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Equipment</span>
                <span className="font-mono font-bold text-teal-300">
                  {scoreBreakdown.equipmentScore}/50
                </span>
              </div>
              <div className="border-x border-slate-700 px-2">
                <span className="text-[10px] text-slate-400 block">Financial</span>
                <span className="font-mono font-bold text-emerald-300">
                  {scoreBreakdown.financialScore}/25
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">ETA / Quality</span>
                <span className="font-mono font-bold text-amber-300">
                  {scoreBreakdown.logisticsQualityScore}/25
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Referral Warning Notice if present */}
          {scoreBreakdown.clinicalWarning && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Clinical Referral Warning
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {scoreBreakdown.clinicalWarning}
                </p>
              </div>
            </div>
          )}

          {/* Complete Equipment Telemetry Inventory (USP) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-clinical-teal" />
                  Live Equipment Telemetry & Diagnostic Inventory
                </h3>
                <p className="text-xs text-slate-500">
                  Click any machine status to simulate downtime or maintenance cycle and observe real-time scoring recalculation.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                {equipment.length} Tracked Modalities
              </span>
            </div>

            <div className="border border-border rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold">
                    <th className="p-3">Equipment Modality</th>
                    <th className="p-3">Brand & Specification</th>
                    <th className="p-3">Operational Status</th>
                    <th className="p-3 text-center">Active / Total</th>
                    <th className="p-3 text-right">Avg Wait</th>
                    <th className="p-3 text-right">Simulation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {equipment.map((eq) => {
                    const isMandatory = activeCondition?.mandatory_equipment.includes(
                      eq.equipment_code
                    );

                    return (
                      <tr
                        key={eq.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isMandatory ? 'bg-teal-50/20' : ''
                        }`}
                      >
                        <td className="p-3 font-semibold text-brand-navy">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {eq.equipment_code}
                            </span>
                            {isMandatory && (
                              <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold uppercase">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                            {eq.equipment_name}
                          </div>
                        </td>

                        <td className="p-3 text-slate-700 font-medium">
                          {eq.brand_model}
                          {eq.maintenance_reason && (
                            <div className="text-[10px] text-amber-700 mt-0.5 font-mono">
                              ⚠ {eq.maintenance_reason} ({eq.expected_restoration})
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              eq.operational_status === 'OPERATIONAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : eq.operational_status === 'MAINTENANCE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                eq.operational_status === 'OPERATIONAL'
                                  ? 'bg-emerald-500'
                                  : eq.operational_status === 'MAINTENANCE'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {eq.operational_status}
                          </span>
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-slate-800">
                          {eq.available_units} / {eq.total_units}
                        </td>

                        <td className="p-3 text-right font-mono text-slate-600">
                          {eq.avg_wait_time_hours} hrs
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => toggleEquipmentStatusQuick(eq.id)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Procedure Cost Itemization & Cashless Insurers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-brand-navy flex items-center gap-1.5 mb-2">
                <IndianRupee className="w-3.5 h-3.5 text-clinical-teal" />
                Procedure Financial Package Audit
              </h4>
              {treatmentCost ? (
                <div className="space-y-2 text-xs">
                  <div className="text-slate-700 font-semibold">
                    {treatmentCost.procedure_name}
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Estimated Patient Cost:</span>
                    <span className="font-mono font-bold text-brand-navy">
                      {formatINR(treatmentCost.min_estimated_cost)} - {formatINR(treatmentCost.max_estimated_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">PM-JAY Mandated Package Rate:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatINR(treatmentCost.pmjay_package_rate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CGHS Base Benchmark Rate:</span>
                    <span className="font-mono font-bold text-slate-600">
                      {formatINR(activeCondition?.cghs_base_rate || 0)}
                    </span>
                  </div>
                </div>
              ) : hospital.hospital_type === 'Government' ? (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <span className="font-bold block">✓ 100% Free / Govt Subsidized Rate</span>
                  Statutory out-of-pocket &lt; ₹5,000 under general ward protocol for consumables and implants.
                </div>
              ) : hospital.hospital_type === 'Trust' ? (
                <div className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                  <span className="font-bold block">Charitable Trust Subsidized Package</span>
                  Typical range: ₹1,20,000 – ₹2,20,000 (35-50% below corporate tariffs). PM-JAY &amp; Swasthya Sathi cashless beds honored.
                </div>
              ) : (
                <div className="text-xs text-slate-800 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
                  <span className="font-bold block text-brand-navy">Corporate Super-Specialty Tariff Grid</span>
                  Estimated package: ₹2,80,000 – ₹4,90,000. Cashless TPA insurance accepted; Swasthya Sathi/PM-JAY subject to bed quota availability.
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-brand-navy flex items-center gap-1.5 mb-2">
                <FileCheck className="w-3.5 h-3.5 text-clinical-teal" />
                Empanelled Schemes & Cashless Insurers
              </h4>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {hospital.pmjay_empanelled && (
                  <span className="bg-emerald-100 text-emerald-900 px-2 py-1 rounded-md font-bold text-[11px] border border-emerald-300">
                    ✓ Ayushman Bharat (PM-JAY)
                  </span>
                )}
                {hospital.swasthya_sathi_accepted && (
                  <span className="bg-teal-100 text-teal-900 px-2 py-1 rounded-md font-bold text-[11px] border border-teal-300">
                    ✓ Swasthya Sathi (West Bengal)
                  </span>
                )}
                {treatmentCost?.cashless_insurers.map((ins, i) => (
                  <span
                    key={i}
                    className="bg-white text-slate-700 px-2 py-1 rounded-md font-medium text-[11px] border border-slate-200"
                  >
                    {ins}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Clinical Capacity & Specialist Matrix */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">ICU Beds Available</span>
              <span className="font-mono font-bold text-base text-brand-navy flex items-center justify-center gap-1 mt-0.5">
                <Bed className="w-4 h-4 text-clinical-teal" />
                {hospital.icu_beds_available} / {hospital.icu_beds_total}
              </span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Blood Bank 24x7</span>
              <span className="font-bold text-base text-brand-navy flex items-center justify-center gap-1 mt-0.5">
                <Droplet className="w-4 h-4 text-rose-500" />
                {hospital.blood_bank_active ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Trauma Level</span>
              <span className="font-bold text-base text-brand-navy mt-0.5 block">
                {hospital.trauma_level}
              </span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Burn ICU Unit</span>
              <span className="font-bold text-base text-brand-navy flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-4 h-4 text-amber-500" />
                {hospital.burn_unit ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          {/* Verified On-Duty Specialists & Doctor Directory (if available for hospital) */}
          {hospital.hospital_id === 'HOSP_MANIPAL_MUKUNDAPUR' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-brand-navy flex items-center gap-1.5 uppercase tracking-wide">
                    <Users className="w-4 h-4 text-clinical-teal" />
                    Verified Practicing Specialists Directory ({MANIPAL_MUKUNDAPUR_DOCTORS.length} Specialists)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live consultation fee schedule, clinical experience, and patient recommendation scores at Manipal Mukundapur.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Practo Verified Roster
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {MANIPAL_MUKUNDAPUR_DOCTORS.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white p-3 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="font-bold text-xs text-brand-navy block leading-tight">
                          {doc.name}
                        </span>
                        <span className="text-[11px] text-teal-700 font-medium">
                          {doc.specialization}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                        ₹{doc.consultation_fee}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{doc.experience_years} yrs exp</span>
                      {doc.satisfaction_score_pct ? (
                        <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          {doc.satisfaction_score_pct}% ({doc.patient_stories_count})
                        </span>
                      ) : (
                        <span>{doc.patient_stories_count} stories</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Pre-Arrival Document & Clinical Checklist (Interactive QA Requirement) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-xs font-bold text-brand-navy flex items-center gap-1.5 uppercase tracking-wide">
                  <FileCheck className="w-4 h-4 text-clinical-teal" />
                  Pre-Arrival Document &amp; Clinical Checklist
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Prepare these mandatory physical documents before leaving home to eliminate admission counter bottlenecks at {hospital.name}.
                </p>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Tailored for: {activeCondition?.condition_name || 'Active Diagnosis'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-teal-300 transition-colors">
                <input
                  type="checkbox"
                  checked={!!checkedItems.id_proof}
                  onChange={(e) =>
                    setCheckedItems((prev) => ({ ...prev, id_proof: e.target.checked }))
                  }
                  className="rounded text-clinical-teal focus:ring-clinical-teal mt-0.5"
                />
                <div>
                  <span className="font-bold text-brand-navy block">Patient Government ID</span>
                  <span className="text-[11px] text-slate-500">Original Aadhaar / Voter ID + 2 photocopies</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-teal-300 transition-colors">
                <input
                  type="checkbox"
                  checked={!!checkedItems.scheme_card}
                  onChange={(e) =>
                    setCheckedItems((prev) => ({ ...prev, scheme_card: e.target.checked }))
                  }
                  className="rounded text-clinical-teal focus:ring-clinical-teal mt-0.5"
                />
                <div>
                  <span className="font-bold text-brand-navy block">Health Scheme / TPA Card</span>
                  <span className="text-[11px] text-slate-500">Swasthya Sathi / PM-JAY / Private Health Insurance e-Card</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-teal-300 transition-colors">
                <input
                  type="checkbox"
                  checked={!!checkedItems.biopsy_blocks}
                  onChange={(e) =>
                    setCheckedItems((prev) => ({ ...prev, biopsy_blocks: e.target.checked }))
                  }
                  className="rounded text-clinical-teal focus:ring-clinical-teal mt-0.5"
                />
                <div>
                  <span className="font-bold text-brand-navy block">Histopathology / Biopsy Slides</span>
                  <span className="text-[11px] text-slate-500">Paraffin tissue blocks &amp; IHC slide staining report</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-teal-300 transition-colors">
                <input
                  type="checkbox"
                  checked={!!checkedItems.ecg_scans}
                  onChange={(e) =>
                    setCheckedItems((prev) => ({ ...prev, ecg_scans: e.target.checked }))
                  }
                  className="rounded text-clinical-teal focus:ring-clinical-teal mt-0.5"
                />
                <div>
                  <span className="font-bold text-brand-navy block">Prior Imaging / Cardiac CD</span>
                  <span className="text-[11px] text-slate-500">Last 3 ECGs, Angiogram CD, and Serum Creatinine lab values</span>
                </div>
              </label>
            </div>

            {/* Referral Token Generator */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-teal-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-clinical-teal" />
                <div>
                  <span className="font-bold text-xs text-brand-navy block">
                    Klinqo Verified Referral Token
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Transmits machine readiness check directly to {hospital.name} triage reception
                  </span>
                </div>
              </div>

              {referralTokenGenerated ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    Token #KL-2026-8819 Active
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setReferralTokenGenerated(true)}
                  className="bg-clinical-teal hover:bg-clinical-dark text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                >
                  Generate Verified Referral Token
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleCompareHospital(selectedHospitalForModal)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${
                isSelectedForCompare
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4 text-slate-500" />
              {isSelectedForCompare ? 'Selected in Compare' : 'Add to Compare Drawer'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${hospital.contact_phone}`}
              className="flex items-center gap-2 bg-status-coral hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Emergency ER Line: {hospital.contact_phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
