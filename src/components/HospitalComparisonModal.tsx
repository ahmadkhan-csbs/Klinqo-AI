'use client';

import React from 'react';
import { HospitalWithScore, EquipmentCode } from '@/types/medical';
import { formatINR } from '@/utils/scoringEngine';
import {
  X,
  Scale,
  ShieldCheck,
  Check,
  AlertTriangle,
  XCircle,
  Clock,
  Navigation,
  IndianRupee,
  PhoneCall,
  Bed,
  Droplet,
  Cpu,
  Flame,
  MessageSquare,
} from 'lucide-react';

interface HospitalComparisonModalProps {
  hospitals: HospitalWithScore[];
  activeConditionName?: string;
  onClose: () => void;
  onRemove: (hospital: HospitalWithScore) => void;
  onOpenWhatsApp: (hospital: HospitalWithScore) => void;
}

const MODALITY_KEYS: { code: EquipmentCode; label: string }[] = [
  { code: 'PET_CT', label: 'PET-CT Scanner' },
  { code: 'LINAC_RADIATION', label: 'LINAC Radiation' },
  { code: 'BRACHYTHERAPY', label: 'HDR Brachytherapy' },
  { code: 'CATH_LAB', label: '24x7 Cath Lab' },
  { code: 'ECMO', label: 'ECMO Life Support' },
  { code: 'MRI_3T', label: '3.0 Tesla MRI' },
  { code: 'DIALYSIS_CRRT', label: 'CRRT / Dialysis' },
  { code: 'BIOPSY_HISTOPATH', label: 'Biopsy / Histopath' },
  { code: 'NEURO_MICRO', label: 'Neuro Microscope' },
  { code: 'VENTILATOR_ICU', label: 'Ventilator ICU' },
];

export const HospitalComparisonModal: React.FC<HospitalComparisonModalProps> = ({
  hospitals,
  activeConditionName = 'Target Diagnosis',
  onClose,
  onRemove,
  onOpenWhatsApp,
}) => {
  if (hospitals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl relative">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-clinical-teal flex items-center justify-center border border-teal-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-brand-navy">
                  Multi-Facility Infrastructure & Cost Comparison Matrix
                </h2>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {hospitals.length} Centers Compared
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Evaluation target: <strong className="text-clinical-dark">{activeConditionName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* TOP SECTION: HOSPITAL OVERVIEW HEADERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hospitals.map((item) => {
              const { hospital, scoreBreakdown } = item;
              return (
                <div
                  key={hospital.hospital_id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative flex flex-col justify-between"
                >
                  <button
                    onClick={() => onRemove(item)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {hospital.hospital_type.replace('_', ' ')}
                      </span>
                      {hospital.nabh_accredited && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-clinical-dark">
                          NABH
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-brand-navy pr-5">
                      {hospital.name}
                    </h3>

                    <div className="text-xs text-slate-500 mt-0.5">
                      {hospital.city} • {hospital.abdm_hfr_id}
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 text-xs font-mono font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-clinical-teal">
                        <Navigation className="w-3.5 h-3.5" />
                        {hospital.distance_km} km
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3.5 h-3.5" />
                        ETA: {hospital.eta_minutes} mins
                      </span>
                    </div>

                    {/* Overall Score */}
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">50-25-25 Match:</span>
                      <span
                        className={`text-xl font-mono font-black ${
                          scoreBreakdown.totalScore >= 80
                            ? 'text-emerald-700'
                            : scoreBreakdown.totalScore >= 60
                            ? 'text-teal-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {scoreBreakdown.totalScore}%
                      </span>
                    </div>

                    <div className="mt-1.5 grid grid-cols-3 gap-1 text-center text-[10px] font-mono text-slate-500">
                      <div>Eq: {scoreBreakdown.equipmentScore}/50</div>
                      <div>Fin: {scoreBreakdown.financialScore}/25</div>
                      <div>ETA: {scoreBreakdown.logisticsQualityScore}/25</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() => onOpenWhatsApp(item)}
                      className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-2 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <a
                      href={`tel:${hospital.contact_phone}`}
                      className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-2 px-2.5 rounded-lg bg-brand-navy hover:bg-slate-800 text-white transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call ER</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION 2: FINANCIAL & SCHEME COVERAGE ROW */}
          <div>
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-clinical-teal" />
              Treatment Cost & Cashless Coverage Comparison
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3 w-48">Financial Metric</th>
                    {hospitals.map((h) => (
                      <th key={h.hospital.hospital_id} className="p-3 font-semibold text-brand-navy">
                        {h.hospital.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">
                      Estimated Package Range
                    </td>
                    {hospitals.map((h) => (
                      <td key={h.hospital.hospital_id} className="p-3 font-mono font-bold text-brand-navy">
                        {h.treatmentCost
                          ? `${formatINR(h.treatmentCost.min_estimated_cost)} - ${formatINR(h.treatmentCost.max_estimated_cost)}`
                          : h.hospital.hospital_type === 'Government'
                          ? 'Free / Subsidized (< ₹5K)'
                          : 'Standard Consult Tariff'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">
                      Ayushman Bharat (PM-JAY)
                    </td>
                    {hospitals.map((h) => (
                      <td key={h.hospital.hospital_id} className="p-3">
                        {h.hospital.pmjay_empanelled ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> 100% Cashless (₹5L Cap)
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Not Empanelled
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">
                      Swasthya Sathi (West Bengal)
                    </td>
                    {hospitals.map((h) => (
                      <td key={h.hospital.hospital_id} className="p-3">
                        {h.hospital.swasthya_sathi_accepted ? (
                          <span className="text-teal-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Accepted Cashless
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Not Empanelled</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">
                      PM-JAY Mandated Package Rate
                    </td>
                    {hospitals.map((h) => (
                      <td key={h.hospital.hospital_id} className="p-3 font-mono font-bold text-emerald-800">
                        {h.treatmentCost ? formatINR(h.treatmentCost.pmjay_package_rate) : 'Govt Sched.'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: MACHINE-BY-MACHINE TELEMETRY MATRIX */}
          <div>
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-clinical-teal" />
              Machine-by-Machine Operational Telemetry
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3 w-48">Modality</th>
                    {hospitals.map((h) => (
                      <th key={h.hospital.hospital_id} className="p-3 font-semibold text-brand-navy">
                        {h.hospital.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {MODALITY_KEYS.map((mod) => (
                    <tr key={mod.code} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-semibold text-slate-700 bg-slate-50/50">
                        <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-white border border-slate-200 mr-1.5">
                          {mod.code}
                        </span>
                        {mod.label}
                      </td>

                      {hospitals.map((h) => {
                        const eq = h.equipment.find((e) => e.equipment_code === mod.code);
                        if (!eq) {
                          return (
                            <td key={h.hospital.hospital_id} className="p-2.5 text-slate-400 text-[11px]">
                              <span className="flex items-center gap-1 text-rose-500">
                                <XCircle className="w-3.5 h-3.5" /> Not Installed
                              </span>
                            </td>
                          );
                        }

                        const isOp = eq.operational_status === 'OPERATIONAL' && eq.available_units > 0;
                        const isMaint = eq.operational_status === 'MAINTENANCE';

                        return (
                          <td key={h.hospital.hospital_id} className="p-2.5 text-[11px]">
                            {isOp ? (
                              <div>
                                <span className="font-bold text-emerald-700 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Operational ({eq.available_units}/{eq.total_units})
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  Wait: {eq.avg_wait_time_hours}h • {eq.brand_model.slice(0, 24)}...
                                </span>
                              </div>
                            ) : isMaint ? (
                              <div>
                                <span className="font-bold text-amber-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Under Maintenance
                                </span>
                                <span className="text-[10px] text-amber-800 font-mono block truncate max-w-[180px]">
                                  {eq.maintenance_reason || 'Calibration cycle'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-rose-600 font-semibold flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Unavailable
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: CLINICAL LOGISTICS & ICU CAPACITY */}
          <div>
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-clinical-teal" />
              Critical Care Beds & Trauma Readiness
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 w-48 font-semibold text-slate-700 bg-slate-50/50">
                      ICU Bed Availability
                    </td>
                    {hospitals.map((h) => (
                      <td key={h.hospital.hospital_id} className="p-3 font-mono font-bold text-slate-800">
                        {h.hospital.icu_beds_available} of {h.hospital.icu_beds_total} Beds Active
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 w-48 font-semibold text-slate-700 bg-slate-50/50">
                      24x7 Active Blood Bank
                    </td>
                    {hospitals.map((h) => (
                      <td key={h.hospital.hospital_id} className="p-3">
                        {h.hospital.blood_bank_active ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Droplet className="w-3.5 h-3.5 text-rose-500" /> Active 24x7
                          </span>
                        ) : (
                          <span className="text-slate-400">Offline / External</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 w-48 font-semibold text-slate-700 bg-slate-50/50">
                      Trauma Center Level
                    </td>
                    {hospitals.map((h) => (
                      <td key={h.hospital.hospital_id} className="p-3 font-bold text-brand-navy">
                        {h.hospital.trauma_level}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
