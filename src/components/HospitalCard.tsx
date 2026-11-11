'use client';

import React from 'react';
import { HospitalWithScore } from '@/types/medical';
import { useKlinqo } from '@/context/KlinqoContext';
import { formatINR } from '@/utils/scoringEngine';
import {
  ShieldCheck,
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
  Check,
  Droplet,
} from 'lucide-react';

interface HospitalCardProps {
  hospitalWithScore: HospitalWithScore;
  rank: number;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospitalWithScore,
  rank,
}) => {
  const {
    hospital,
    equipment,
    treatmentCost,
    scoreBreakdown,
  } = hospitalWithScore;

  const {
    setSelectedHospitalForModal,
    compareHospitals,
    toggleCompareHospital,
    activeCondition,
  } = useKlinqo();

  const isSelectedForCompare = compareHospitals.some(
    (h) => h.hospital.hospital_id === hospital.hospital_id
  );

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-teal-700 bg-teal-50 border-teal-300';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getScoreFill = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-teal-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const isGovt = hospital.hospital_type === 'Government';

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 p-5 relative shadow-clinical hover:shadow-clinical-hover ${
        scoreBreakdown.referralRiskLevel === 'HIGH' || scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER'
          ? 'border-amber-200'
          : 'border-slate-200 hover:border-teal-300'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Rank Badge */}
          <div className="w-8 h-8 rounded-lg bg-brand-navy text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
            #{rank}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-brand-navy hover:text-clinical-teal cursor-pointer"
                  onClick={() => setSelectedHospitalForModal(hospitalWithScore)}>
                {hospital.name}
              </h3>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isGovt
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : hospital.hospital_type === 'Trust'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : hospital.hospital_type === 'Corporate'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {hospital.hospital_type.replace('_', ' ')}
              </span>

              {hospital.nabh_accredited && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-clinical-dark border border-teal-200">
                  <ShieldCheck className="w-3 h-3 text-clinical-teal" /> NABH Accredited
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{hospital.address}, {hospital.city}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-mono-numbers text-slate-700 font-semibold">
                <Navigation className="w-3 h-3 text-clinical-teal" />
                {hospital.distance_km} km
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-mono-numbers text-brand-navy font-bold">
                <Clock className="w-3 h-3 text-amber-600" />
                ETA: {hospital.eta_minutes} mins
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] text-slate-500">
                ABDM: {hospital.abdm_hfr_id}
              </span>
            </div>
          </div>
        </div>

        {/* 50-25-25 Overall Capability Match Score */}
        <div className="shrink-0 flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Capability Match
            </span>
            <div
              className={`font-mono text-xl font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${getScoreColor(
                scoreBreakdown.totalScore
              )}`}
            >
              <span>{scoreBreakdown.totalScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 50-25-25 Score Breakdown Bar */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-500 block text-[10px]">Machine Readiness (50%)</span>
          <span className="font-mono font-bold text-brand-navy">
            {scoreBreakdown.equipmentScore} / 50 pts
          </span>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-clinical-teal h-full rounded-full"
              style={{ width: `${(scoreBreakdown.equipmentScore / 50) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-500 block text-[10px]">Financial & Schemes (25%)</span>
          <span className="font-mono font-bold text-brand-navy">
            {scoreBreakdown.financialScore} / 25 pts
          </span>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${(scoreBreakdown.financialScore / 25) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-500 block text-[10px]">ETA & Quality (25%)</span>
          <span className="font-mono font-bold text-brand-navy">
            {scoreBreakdown.logisticsQualityScore} / 25 pts
          </span>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${(scoreBreakdown.logisticsQualityScore / 25) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clinical Warning Banner (If machine down or missing!) */}
      {scoreBreakdown.clinicalWarning && (
        <div
          className={`mt-3 p-3 rounded-xl flex items-start gap-2.5 text-xs ${
            scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER'
              ? 'bg-rose-50 border border-rose-300 text-rose-900'
              : 'bg-amber-50 border border-amber-300 text-amber-900'
          }`}
        >
          {scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER' ? (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-snug">
            <span className="font-bold">
              {scoreBreakdown.referralRiskLevel === 'CRITICAL_BLOCKER'
                ? 'CRITICAL DEFICIT / DIVERSION NOTICE:'
                : 'CLINICAL REFERRAL RISK:'}
            </span>{' '}
            {scoreBreakdown.clinicalWarning}
          </div>
        </div>
      )}

      {/* Mandatory Equipment Live Status Row */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-clinical-teal" />
            Mandatory Condition Equipment Telemetry:
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {scoreBreakdown.mandatoryEquipmentAvailable} of{' '}
            {scoreBreakdown.mandatoryEquipmentTotal} Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {activeCondition?.mandatory_equipment.map((code) => {
            const eq = equipment.find((e) => e.equipment_code === code);
            const isOperational = eq && eq.operational_status === 'OPERATIONAL' && eq.available_units > 0;
            const isMaintenance = eq && eq.operational_status === 'MAINTENANCE';

            return (
              <div
                key={code}
                className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  isOperational
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isMaintenance
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="truncate">
                  <div className="font-mono font-bold text-[11px] text-brand-navy flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOperational
                          ? 'bg-emerald-500'
                          : isMaintenance
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />
                    {code}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate" title={eq?.brand_model || 'Not Installed'}>
                    {eq ? eq.brand_model : 'Facility lacks modality'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isOperational
                        ? 'bg-emerald-100 text-emerald-800'
                        : isMaintenance
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isOperational
                      ? `${eq.available_units}/${eq.total_units} Active`
                      : isMaintenance
                      ? 'MAINTENANCE'
                      : 'UNAVAILABLE'}
                  </span>
                  {isOperational && eq && (
                    <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                      Wait: {eq.avg_wait_time_hours}h
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost & Scheme Transparency Bar */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Procedure Package Estimation ({activeCondition?.condition_name.split('(')[0]})
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            {treatmentCost ? (
              <>
                <span className="font-mono font-extrabold text-sm text-brand-navy">
                  {formatINR(treatmentCost.min_estimated_cost)} - {formatINR(treatmentCost.max_estimated_cost)}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  (PM-JAY: {formatINR(treatmentCost.pmjay_package_rate)})
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500 italic">
                {isGovt ? 'Free / Nominal Subsidized (< ₹5,000)' : 'Package estimate available upon consult'}
              </span>
            )}
          </div>
        </div>

        {/* Cashless Insurers & Schemes */}
        <div className="flex flex-wrap items-center gap-1.5">
          {hospital.pmjay_empanelled && (
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
              ✓ PM-JAY Cashless
            </span>
          )}
          {hospital.swasthya_sathi_accepted && (
            <span className="bg-teal-100 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-300">
              ✓ Swasthya Sathi
            </span>
          )}
          <span className="bg-slate-200 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded">
            ICU Beds: {hospital.icu_beds_available}/{hospital.icu_beds_total}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleCompareHospital(hospitalWithScore)}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              isSelectedForCompare
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            {isSelectedForCompare ? 'Selected for Compare' : 'Add to Compare'}
          </button>

          <a
            href={`tel:${hospital.contact_phone}`}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            {hospital.contact_phone}
          </a>
        </div>

        <button
          onClick={() => setSelectedHospitalForModal(hospitalWithScore)}
          className="flex items-center gap-1.5 bg-brand-navy hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <span>View Telemetry & Cost Audit</span>
          <ExternalLink className="w-3.5 h-3.5 text-clinical-light" />
        </button>
      </div>
    </div>
  );
};
