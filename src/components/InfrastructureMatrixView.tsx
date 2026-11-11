'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { EquipmentCode } from '@/types/medical';
import {
  Layers,
  Cpu,
  Check,
  AlertTriangle,
  XCircle,
  Filter,
  ShieldCheck,
  Search,
} from 'lucide-react';

const ALL_EQUIPMENT_CODES: { code: EquipmentCode; label: string; specialty: string }[] = [
  { code: 'PET_CT', label: 'PET-CT Scanner', specialty: 'Oncology' },
  { code: 'LINAC_RADIATION', label: 'LINAC Radiation', specialty: 'Radiation Oncology' },
  { code: 'BRACHYTHERAPY', label: 'HDR Brachytherapy', specialty: 'Radiation Oncology' },
  { code: 'CATH_LAB', label: 'Biplane Cath Lab', specialty: 'Cardio / Neuro' },
  { code: 'ECMO', label: 'ECMO Life Support', specialty: 'Critical Care' },
  { code: 'MRI_3T', label: '3.0 Tesla MRI', specialty: 'Radiology' },
  { code: 'DIALYSIS_CRRT', label: 'CRRT / Dialysis', specialty: 'Nephrology' },
  { code: 'BIOPSY_HISTOPATH', label: 'Histopathology IHC', specialty: 'Pathology' },
  { code: 'NEURO_MICRO', label: 'Neuro Microscope', specialty: 'Neurosurgery' },
  { code: 'VENTILATOR_ICU', label: 'ICU Ventilators', specialty: 'Critical Care' },
];

export const InfrastructureMatrixView: React.FC = () => {
  const {
    hospitals,
    equipment,
    toggleEquipmentStatusQuick,
    triageState,
    setSelectedHospitalForModal,
    activeCondition,
  } = useKlinqo();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredHospitals = hospitals.filter((h) => {
    const matchesCity =
      triageState.selectedCity === 'All Cities' ||
      h.city.toLowerCase() === triageState.selectedCity.toLowerCase();
    const matchesQuery =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || h.hospital_type === filterType;
    return matchesCity && matchesQuery && matchesType;
  });

  return (
    <section className="bg-white rounded-2xl border border-border shadow-clinical p-5 mb-8">
      {/* Header and Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-clinical-teal" />
              National Hospital Infrastructure & Equipment Telemetry Matrix
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
              10 Modalities Monitored
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operational status across Indian tertiary centers. Click any cell to toggle equipment status and test telemetry cascades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter by Hospital Type"
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Ownership Types</option>
            <option value="Government">Government Only</option>
            <option value="Trust">Trust Centers</option>
            <option value="Corporate">Corporate SuperSpecialty</option>
            <option value="Nursing_Home">Nursing Homes</option>
          </select>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="my-3 flex flex-wrap items-center gap-4 text-[11px] p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <span className="font-bold text-slate-700">Telemetry Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600 font-medium">OPERATIONAL (Online & Active)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-amber-800 font-medium">MAINTENANCE (Calibration / Overhaul)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
          <span className="text-slate-500 font-medium">NOT INSTALLED / UNAVAILABLE</span>
        </div>
        <span className="text-slate-400 font-mono text-[10px] ml-auto">
          Tip: Red ring indicates mandatory for ICD {activeCondition?.condition_icd_code}
        </span>
      </div>

      {/* Matrix Table */}
      <div className="border border-border rounded-xl overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-border text-slate-700 font-bold">
              <th className="p-3 sticky left-0 bg-slate-50 z-10 min-w-[200px] border-r border-border">
                Hospital Center ({filteredHospitals.length})
              </th>
              {ALL_EQUIPMENT_CODES.map((col) => {
                const isMandatoryForActive = activeCondition?.mandatory_equipment.includes(
                  col.code
                );
                return (
                  <th
                    key={col.code}
                    className={`p-2.5 px-3 text-center font-mono whitespace-nowrap min-w-[125px] ${
                      isMandatoryForActive ? 'bg-teal-50 text-clinical-dark font-extrabold' : ''
                    }`}
                  >
                    <div className="font-bold">{col.label}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {col.code}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredHospitals.map((hosp) => {
              const hospEquipment = equipment.filter(
                (eq) => eq.hospital_id === hosp.hospital_id
              );

              return (
                <tr key={hosp.hospital_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 sticky left-0 bg-white hover:bg-slate-50/80 z-10 border-r border-border">
                    <div className="font-bold text-brand-navy flex items-center gap-1.5">
                      <span>{hosp.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>{hosp.city}</span>
                      <span>•</span>
                      <span>{hosp.hospital_type}</span>
                    </div>
                  </td>

                  {ALL_EQUIPMENT_CODES.map((col) => {
                    const eq = hospEquipment.find((e) => e.equipment_code === col.code);
                    const isMandatory = activeCondition?.mandatory_equipment.includes(
                      col.code
                    );

                    if (!eq) {
                      return (
                        <td
                          key={col.code}
                          className={`p-2 text-center text-slate-300 font-mono text-[10px] ${
                            isMandatory ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          —
                        </td>
                      );
                    }

                    const isOp = eq.operational_status === 'OPERATIONAL' && eq.available_units > 0;
                    const isMaint = eq.operational_status === 'MAINTENANCE';

                    return (
                      <td
                        key={col.code}
                        className={`p-1.5 text-center transition-all ${
                          isMandatory ? 'bg-teal-50/20' : ''
                        }`}
                      >
                        <button
                          onClick={() => toggleEquipmentStatusQuick(eq.id)}
                          title={`${eq.brand_model} (${eq.operational_status})\nClick to toggle state.`}
                          className={`w-full py-1.5 px-1 rounded-md text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-transform hover:scale-105 ${
                            isOp
                              ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200'
                              : isMaint
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 animate-pulse'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          } ${isMandatory ? 'ring-1 ring-clinical-teal' : ''}`}
                        >
                          <span>{isOp ? `${eq.available_units}/${eq.total_units}` : isMaint ? 'MAINT' : 'OFF'}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
