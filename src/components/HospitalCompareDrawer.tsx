'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { formatINR } from '@/utils/scoringEngine';
import {
  Scale,
  X,
  ShieldCheck,
  Check,
  AlertTriangle,
  XCircle,
  Clock,
  Navigation,
  IndianRupee,
  PhoneCall,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export const HospitalCompareDrawer: React.FC = () => {
  const {
    compareHospitals,
    clearCompareHospitals,
    toggleCompareHospital,
    activeCondition,
  } = useKlinqo();

  const [isExpanded, setIsExpanded] = useState(false);

  if (compareHospitals.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-brand-navy shadow-2xl transition-all">
      {/* Drawer Control Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-clinical-light" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Hospital Capability Compare Tray ({compareHospitals.length} / 3)
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Comparing for: <strong className="text-teal-300">{activeCondition?.condition_name.split('(')[0]}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-md text-slate-200 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Collapse Comparison
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Expand Side-by-Side Comparison
              </>
            )}
          </button>

          <button
            onClick={clearCompareHospitals}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Expanded Table Comparison View */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareHospitals.map(({ hospital, equipment, treatmentCost, scoreBreakdown }) => (
              <div
                key={hospital.hospital_id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 relative"
              >
                <button
                  onClick={() =>
                    toggleCompareHospital({ hospital, equipment, treatmentCost, scoreBreakdown })
                  }
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                    {hospital.hospital_type}
                  </span>
                  <h4 className="text-sm font-bold text-brand-navy pr-6">
                    {hospital.name}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {hospital.city} • ETA {hospital.eta_minutes}m ({hospital.distance_km}km)
                  </div>
                </div>

                {/* Score Pill */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">50-25-25 Match:</span>
                  <span className="text-lg font-mono font-extrabold text-clinical-teal">
                    {scoreBreakdown.totalScore}%
                  </span>
                </div>

                {/* Machine Status Checklist */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Mandatory Machines Status:
                  </span>
                  {activeCondition?.mandatory_equipment.map((code) => {
                    const eq = equipment.find((e) => e.equipment_code === code);
                    const isOp = eq && eq.operational_status === 'OPERATIONAL' && eq.available_units > 0;
                    const isMaint = eq && eq.operational_status === 'MAINTENANCE';

                    return (
                      <div
                        key={code}
                        className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-100 text-[11px]"
                      >
                        <span className="font-mono font-semibold">{code}</span>
                        {isOp ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Ready ({eq.available_units} units)
                          </span>
                        ) : isMaint ? (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Maintenance
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cost Estimation */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    Estimated Cost Range
                  </span>
                  {treatmentCost ? (
                    <div className="font-mono font-bold text-brand-navy mt-0.5">
                      {formatINR(treatmentCost.min_estimated_cost)} - {formatINR(treatmentCost.max_estimated_cost)}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic mt-0.5">Govt Subsidized (&lt; ₹5,000)</div>
                  )}
                  <div className="text-[10px] text-emerald-700 font-medium mt-1">
                    {hospital.pmjay_empanelled ? '✓ PM-JAY Cashless' : '✗ PM-JAY Out-of-Pocket'}
                  </div>
                </div>

                {/* Action button */}
                <a
                  href={`tel:${hospital.contact_phone}`}
                  className="block text-center text-xs font-bold py-2 px-3 rounded-lg bg-brand-navy hover:bg-slate-800 text-white transition-colors"
                >
                  Call ER: {hospital.contact_phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
