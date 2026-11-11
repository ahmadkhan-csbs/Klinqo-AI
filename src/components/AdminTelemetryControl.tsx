'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { OperationalStatus } from '@/types/medical';
import {
  Sliders,
  AlertTriangle,
  RotateCcw,
  Zap,
  Cpu,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';

export const AdminTelemetryControl: React.FC = () => {
  const {
    hospitals,
    equipment,
    updateEquipmentStatus,
    resetAllEquipmentToDefault,
    rankedHospitals,
    activeCondition,
    triageState,
  } = useKlinqo();

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    hospitals[0]?.hospital_id || 'HOSP_SSKM_KOL'
  );

  const currentHospital = hospitals.find((h) => h.hospital_id === selectedHospitalId);
  const currentHospitalEquipment = equipment.filter(
    (e) => e.hospital_id === selectedHospitalId
  );

  // Scenario 1: Restore SSKM LINAC
  const handleRestoreSSKMLinac = () => {
    const sskmLinac = equipment.find(
      (e) => e.hospital_id === 'HOSP_SSKM_KOL' && e.equipment_code === 'LINAC_RADIATION'
    );
    if (sskmLinac) {
      updateEquipmentStatus(sskmLinac.id, 'OPERATIONAL', 2);
    }
  };

  // Scenario 2: Simulate TMC LINAC Breakdown
  const handleBreakTMCLinac = () => {
    const tmcLinac = equipment.find(
      (e) => e.hospital_id === 'HOSP_TMC_KOL' && e.equipment_code === 'LINAC_RADIATION'
    );
    if (tmcLinac) {
      updateEquipmentStatus(
        tmcLinac.id,
        'MAINTENANCE',
        0,
        'CRITICAL: Vacuum fault and RF wave-guide arcing in Linac Gantry 1'
      );
    }
  };

  // Scenario 3: Simulate Apollo Cath Lab Overheat
  const handleBreakApolloCathLab = () => {
    const apolloCath = equipment.find(
      (e) => e.hospital_id === 'HOSP_APOLLO_KOL' && e.equipment_code === 'CATH_LAB'
    );
    if (apolloCath) {
      updateEquipmentStatus(
        apolloCath.id,
        'MAINTENANCE',
        0,
        'EMERGENCY: Flat detector calibration error during PCI'
      );
    }
  };

  return (
    <section className="bg-white rounded-2xl border-2 border-amber-300 shadow-clinical p-5 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-5 h-5 text-amber-600" />
              Admin Clinical Telemetry & Failure Simulation Control Room
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 animate-pulse">
              LIVE MUTATION ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test the resilience of the 50-25-25 triage algorithm. Mutate machine telemetry below and watch hospital ranks reorder instantaneously.
          </p>
        </div>

        <button
          onClick={resetAllEquipmentToDefault}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Reset All Telemetry to Factory Baseline
        </button>
      </div>

      {/* Preset 1-Click Simulation Scenarios */}
      <div className="my-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
        <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block mb-2">
          ⚡ 1-Click Clinical Failure & Restoration Scenarios
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleRestoreSSKMLinac}
            className="p-3 bg-white rounded-lg border border-emerald-200 hover:border-emerald-400 text-left transition-all shadow-2xs hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Restore SSKM LINAC
              </span>
              <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                MAINT → OP
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Clears SSKM&apos;s Linear Accelerator maintenance. Watch SSKM surge to #1 for Cervical Cancer (2C77) due to 100% cashless Swasthya Sathi coverage!
            </p>
          </button>

          <button
            onClick={handleBreakTMCLinac}
            className="p-3 bg-white rounded-lg border border-rose-200 hover:border-rose-400 text-left transition-all shadow-2xs hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Breakdown: TMC LINAC
              </span>
              <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                OP → MAINT
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Puts Tata Medical Center&apos;s TrueBeam LINAC into maintenance. Watch TMC trigger a severe Clinical Referral Warning.
            </p>
          </button>

          <button
            onClick={handleBreakApolloCathLab}
            className="p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 text-left transition-all shadow-2xs hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Apollo Cath Lab Downtime
              </span>
              <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                0 Active Units
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Simulates biplane tube failure during Acute STEMI (BA41) emergency. Diverts ambulances to Desun or AIIMS!
            </p>
          </button>
        </div>
      </div>

      {/* Live Ranking Scoreboard Preview */}
      <div className="my-4 p-3 bg-slate-900 text-white rounded-xl">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-teal-300 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-clinical-light" />
            Live Ranking Scoreboard for [{activeCondition?.condition_icd_code}] {activeCondition?.condition_name.split('(')[0]}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Filtered by: {triageState.selectedCity}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {rankedHospitals.slice(0, 3).map((item, idx) => (
            <div
              key={item.hospital.hospital_id}
              className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 flex items-center justify-between"
            >
              <div>
                <span className="font-mono text-[10px] text-teal-400 font-bold block">
                  Rank #{idx + 1}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[170px] block">
                  {item.hospital.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  ETA: {item.hospital.eta_minutes}m • {item.scoreBreakdown.mandatoryEquipmentAvailable}/{item.scoreBreakdown.mandatoryEquipmentTotal} Machines
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-mono font-extrabold text-teal-300">
                  {item.scoreBreakdown.totalScore}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Equipment Mutation Editor */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-clinical-teal" />
            Select Facility to Mutate Diagnostic Inventory:
          </label>
          <select
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            aria-label="Select Facility to Mutate Diagnostic Inventory"
            className="text-xs font-bold p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            {hospitals.map((h) => (
              <option key={h.hospital_id} value={h.hospital_id}>
                {h.name} ({h.city} - {h.hospital_type})
              </option>
            ))}
          </select>
        </div>

        {/* Machine list for selected hospital */}
        <div className="space-y-2">
          {currentHospitalEquipment.map((eq) => {
            const isMandatory = activeCondition?.mandatory_equipment.includes(
              eq.equipment_code
            );

            return (
              <div
                key={eq.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-[240px]">
                  <div className="font-bold text-brand-navy flex items-center gap-1.5">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white border border-slate-200">
                      {eq.equipment_code}
                    </span>
                    <span>{eq.brand_model}</span>
                    {isMandatory && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1 rounded font-bold uppercase">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {eq.equipment_name}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Radio */}
                  <div className="flex items-center gap-2">
                    {(['OPERATIONAL', 'MAINTENANCE', 'UNAVAILABLE'] as OperationalStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => updateEquipmentStatus(eq.id, st)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                            eq.operational_status === st
                              ? st === 'OPERATIONAL'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'MAINTENANCE'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>

                  {/* Units input */}
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-slate-500 text-[11px]">Units:</span>
                    <input
                      type="number"
                      min={0}
                      max={eq.total_units}
                      value={eq.available_units}
                      onChange={(e) =>
                        updateEquipmentStatus(
                          eq.id,
                          eq.operational_status,
                          Math.max(0, parseInt(e.target.value) || 0)
                        )
                      }
                      className="w-14 p-1 rounded border border-slate-200 bg-white text-center font-bold text-xs"
                    />
                    <span className="text-slate-400 text-[11px]">/ {eq.total_units}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
