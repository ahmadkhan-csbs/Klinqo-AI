'use client';

import React, { useState, useMemo } from 'react';
import { HospitalWithScore } from '@/types/medical';
import {
  Search,
  ExternalLink,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  Building2,
  Cpu,
} from 'lucide-react';

interface HospitalQuickDirectoryTableProps {
  hospitals: HospitalWithScore[];
  onSelectHospital: (hospital: HospitalWithScore) => void;
}

export const HospitalQuickDirectoryTable: React.FC<HospitalQuickDirectoryTableProps> = ({
  hospitals,
  onSelectHospital,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((item) => {
      const h = item.hospital;
      const matchesType =
        filterType === 'ALL' ||
        (filterType === 'Government' && h.hospital_type === 'Government') ||
        (filterType === 'Trust' && h.hospital_type === 'Trust') ||
        (filterType === 'Corporate' && h.hospital_type === 'Corporate') ||
        (filterType === 'Nursing_Home' && h.hospital_type === 'Nursing_Home');

      const matchesSearch =
        searchTerm === '' ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.pincode.includes(searchTerm) ||
        (h.key_specialties && h.key_specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

      return matchesType && matchesSearch;
    });
  }, [hospitals, filterType, searchTerm]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-clinical overflow-hidden space-y-4 p-5">
      {/* Top Filter and Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-brand-navy flex items-center gap-2">
            <span>Kolkata Healthcare Directory Master Table</span>
            <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              {filteredHospitals.length} Facilities Listed
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant tabular directory of Government Medical Colleges, Apex Institutes, Trusts, and Private Hospitals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hospital, specialty, pincode..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-clinical-teal w-48 sm:w-60"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'Government', label: 'Govt Apex' },
              { id: 'Trust', label: 'Trust' },
              { id: 'Corporate', label: 'Corporate' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === btn.id
                    ? 'bg-brand-navy text-white shadow-2xs'
                    : 'text-slate-600 hover:text-brand-navy'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3.5 border-b border-slate-800">Hospital &amp; Est. Year</th>
              <th className="py-3 px-3 border-b border-slate-800">Type &amp; Accreditation</th>
              <th className="py-3 px-3 border-b border-slate-800">Key Specialties &amp; Highlights</th>
              <th className="py-3 px-3 border-b border-slate-800">Verified Address</th>
              <th className="py-3 px-3 border-b border-slate-800">Direct Phone</th>
              <th className="py-3 px-3 border-b border-slate-800 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredHospitals.map((item, idx) => {
              const h = item.hospital;
              const isGovt = h.hospital_type === 'Government';
              return (
                <tr
                  key={h.hospital_id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                  }`}
                >
                  {/* Name & Est Year */}
                  <td className="py-3 px-3.5 font-bold text-brand-navy align-top">
                    <button
                      onClick={() => onSelectHospital(item)}
                      className="text-left hover:text-clinical-teal font-extrabold text-xs block leading-snug"
                    >
                      {h.name}
                    </button>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-mono">
                      {h.established_year ? (
                        <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                          Est. {h.established_year}
                        </span>
                      ) : null}
                      <span>ABDM: {h.abdm_hfr_id}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        isGovt
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : h.hospital_type === 'Trust'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : h.hospital_type === 'Corporate'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {h.hospital_type.replace('_', ' ')}
                    </span>
                    {h.free_statutory_care && (
                      <span className="block mt-1 text-[9px] font-bold text-emerald-700">
                        ✓ 100% Free Public Bed
                      </span>
                    )}
                    {h.nabh_accredited && (
                      <span className="flex items-center gap-0.5 mt-0.5 text-[9px] font-bold text-teal-800">
                        <ShieldCheck className="w-2.5 h-2.5 text-clinical-teal" /> NABH
                      </span>
                    )}
                  </td>

                  {/* Specialties & Highlights */}
                  <td className="py-3 px-3 align-top max-w-xs">
                    {h.clinical_highlights && (
                      <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed mb-1 font-medium">
                        {h.clinical_highlights}
                      </p>
                    )}
                    {h.key_specialties && h.key_specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {h.key_specialties.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                          >
                            {s}
                          </span>
                        ))}
                        {h.key_specialties.length > 3 && (
                          <span className="text-[9px] font-mono text-slate-400">
                            +{h.key_specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Address */}
                  <td className="py-3 px-3 align-top text-[11px] text-slate-600">
                    <span className="block">{h.address}</span>
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      Pin: {h.pincode} • {h.city}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <a
                      href={`tel:${h.contact_phone}`}
                      className="font-mono text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3 text-clinical-teal" />
                      {h.contact_phone}
                    </a>
                    {h.emergency_24x7 && (
                      <span className="block mt-0.5 text-[9px] font-bold text-rose-600">
                        ● 24x7 Emergency Line
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-center align-top whitespace-nowrap">
                    <button
                      onClick={() => onSelectHospital(item)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-clinical-teal text-clinical-dark hover:text-white border border-teal-200 transition-colors flex items-center gap-1 mx-auto"
                    >
                      <span>Audit</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
