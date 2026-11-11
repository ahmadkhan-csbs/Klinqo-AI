'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import {
  Building2,
  ShieldCheck,
  PhoneCall,
  Search,
  MapPin,
  ExternalLink,
  Bed,
  CheckCircle2,
} from 'lucide-react';

export const ABDMDirectoryView: React.FC = () => {
  const { hospitals, setSelectedHospitalForModal, rankedHospitals } = useKlinqo();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.abdm_hfr_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-white rounded-2xl border border-border shadow-clinical p-5 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-clinical-teal" />
              ABDM Health Facility Registry (HFR) National Directory
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {hospitals.length} Empanelled Facilities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified Indian medical facilities with synchronized ABDM Health Facility Registry identifiers, trauma grades, and critical care units.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, city, or HFR ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal w-64"
          />
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {filtered.map((hosp) => {
          const matchedScore = rankedHospitals.find(
            (r) => r.hospital.hospital_id === hosp.hospital_id
          );

          return (
            <div
              key={hosp.hospital_id}
              className="bg-slate-50/60 rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-teal-300 transition-colors shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {hosp.abdm_hfr_id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {hosp.hospital_type.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-brand-navy leading-snug">
                  {hosp.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>{hosp.address}, {hosp.city} - {hosp.pincode}</span>
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">ICU Capacity</span>
                    <span className="font-bold text-slate-800">
                      {hosp.icu_beds_available} / {hosp.icu_beds_total} Beds
                    </span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Trauma Level</span>
                    <span className="font-bold text-slate-800">
                      {hosp.trauma_level}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1 text-[10px]">
                  {hosp.nabh_accredited && (
                    <span className="bg-teal-50 text-clinical-dark font-bold px-1.5 py-0.5 rounded border border-teal-200">
                      ✓ NABH
                    </span>
                  )}
                  {hosp.pmjay_empanelled && (
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ PM-JAY
                    </span>
                  )}
                  {hosp.swasthya_sathi_accepted && (
                    <span className="bg-teal-50 text-teal-800 font-bold px-1.5 py-0.5 rounded border border-teal-200">
                      ✓ Swasthya Sathi
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <a
                  href={`tel:${hosp.contact_phone}`}
                  className="text-xs text-slate-700 hover:text-brand-navy font-medium flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3 text-slate-400" />
                  {hosp.contact_phone}
                </a>

                {matchedScore && (
                  <button
                    onClick={() => setSelectedHospitalForModal(matchedScore)}
                    className="text-xs font-bold text-clinical-teal hover:text-clinical-dark flex items-center gap-1"
                  >
                    <span>View Audit</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
