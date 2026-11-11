'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { formatINR } from '@/utils/scoringEngine';
import {
  IndianRupee,
  ShieldCheck,
  TrendingDown,
  AlertCircle,
  HelpCircle,
  Search,
  CheckCircle,
} from 'lucide-react';

export const CostTransparencyView: React.FC = () => {
  const {
    conditionRequirements,
    treatmentCosts,
    hospitals,
    activeCondition,
    setActiveConditionIcd,
  } = useKlinqo();

  const [selectedConditionIcd, setSelectedConditionIcd] = useState(
    activeCondition?.condition_icd_code || '2C77'
  );

  const matchedCondition = conditionRequirements.find(
    (c) => c.condition_icd_code === selectedConditionIcd
  );

  const packagesForCondition = treatmentCosts.filter(
    (tc) => tc.condition_icd_code === selectedConditionIcd
  );

  return (
    <section className="bg-white rounded-2xl border border-border shadow-clinical p-5 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-clinical-teal" />
              National Healthcare Cost Transparency & Tariff Engine
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              NHA PM-JAY Linked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare private provider estimated cost ceilings against Ayushman Bharat PM-JAY package mandates and CGHS base schedules.
          </p>
        </div>

        {/* Condition Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
            Condition:
          </label>
          <select
            value={selectedConditionIcd}
            onChange={(e) => {
              setSelectedConditionIcd(e.target.value);
              setActiveConditionIcd(e.target.value);
            }}
            aria-label="Condition"
            className="text-xs font-semibold p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            {conditionRequirements.map((c) => (
              <option key={c.condition_icd_code} value={c.condition_icd_code}>
                [{c.condition_icd_code}] {c.condition_name.split('(')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Benchmark Summary Cards */}
      {matchedCondition && (
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              CGHS Base Benchmark Rate
            </span>
            <div className="text-xl font-mono font-extrabold text-brand-navy mt-1">
              {formatINR(matchedCondition.cghs_base_rate)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Official Central Govt Health Scheme statutory standard
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              PM-JAY Cashless Ceiling (Ayushman Bharat)
            </span>
            <div className="text-xl font-mono font-extrabold text-emerald-800 mt-1">
              {packagesForCondition.length > 0
                ? formatINR(packagesForCondition[0].pmjay_package_rate)
                : '₹1,35,000'}
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              100% cashless up to ₹5,00,000 per family per year
            </span>
          </div>

          <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200">
            <span className="text-[10px] uppercase font-bold text-clinical-dark tracking-wider block">
              Swasthya Sathi Coverage (West Bengal)
            </span>
            <div className="text-xl font-mono font-extrabold text-clinical-dark mt-1">
              ₹5,00,000
            </div>
            <span className="text-[10px] text-teal-600 block mt-0.5">
              Basic secondary/tertiary cashless insurance cover
            </span>
          </div>
        </div>
      )}

      {/* Package Detail Table */}
      <div className="border border-border rounded-xl overflow-hidden shadow-2xs mt-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-border text-slate-700 font-bold">
              <th className="p-3">Hospital Center</th>
              <th className="p-3">Standard Procedure Title</th>
              <th className="p-3 text-right">Private Cost Range</th>
              <th className="p-3 text-right">PM-JAY Rate</th>
              <th className="p-3">Empanelled Cashless Schemes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {packagesForCondition.map((pkg) => {
              const hosp = hospitals.find((h) => h.hospital_id === pkg.hospital_id);
              if (!hosp) return null;

              return (
                <tr key={pkg.package_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-semibold text-brand-navy">
                    <div>{hosp.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {hosp.city} • {hosp.hospital_type}
                    </div>
                  </td>

                  <td className="p-3 text-slate-700 font-medium max-w-xs">
                    {pkg.procedure_name}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-brand-navy">
                    {formatINR(pkg.min_estimated_cost)} - {formatINR(pkg.max_estimated_cost)}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    {pkg.pmjay_package_rate === 0 ? 'Free / Fully Subsidized' : formatINR(pkg.pmjay_package_rate)}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {pkg.cashless_insurers.map((ins, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                        >
                          {ins}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
