'use client';

import React from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Database,
  Eye,
  Activity,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react';

export const ComplianceFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 1. 4-LAYER DATA TRUST ARCHITECTURE GRID */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-teal-400 bg-teal-950/80 border border-teal-800 px-2.5 py-0.5 rounded-full inline-block mb-1">
                ENTERPRISE CLINICAL VERIFICATION
              </span>
              <h3 className="text-base font-black text-white tracking-tight">
                4-Layer Healthcare Infrastructure Trust &amp; Verification Architecture
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              National Health Stack &amp; ABDM Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Layer 1 */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase font-mono">
                <Database className="w-4 h-4 text-clinical-teal" />
                <span>Layer 1: ABDM &amp; PM-JAY</span>
              </div>
              <h4 className="font-bold text-sm text-white">
                Official ABDM HFR Registry
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Empanelment and registration data matched directly with National Health Authority (NHA) ABDM Health Facility IDs (`HFR-IN-XXXX`) and PM-JAY HBP 2.2 packages.
              </p>
            </div>

            {/* Layer 2 */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase font-mono">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Layer 2: CGHS Multipliers</span>
              </div>
              <h4 className="font-bold text-sm text-white">
                Algorithmic Cost Baselines
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hospital costs calculated using transparent mathematical multipliers anchored to CGHS Delhi/Kolkata baseline rates across Tier-1 (0.0x–0.4x), Tier-2 (1.5x–2.2x), and Tier-3 (3.0x–5.0x).
              </p>
            </div>

            {/* Layer 3 */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase font-mono">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Layer 3: AI Vision Audit</span>
              </div>
              <h4 className="font-bold text-sm text-white">
                Multimodal Verification Pipeline
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clinical report and radiology equipment matching with automatic DPDP Act 2023 PII sanitization (Aadhaar, contact, name masking) prior to ICD-11 extraction.
              </p>
            </div>

            {/* Layer 4 */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase font-mono">
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                <span>Layer 4: Crowdsourced Telemetry</span>
              </div>
              <h4 className="font-bold text-sm text-white">
                Hospital PRO &amp; Patient Audits
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Waze-style real-time verification where visiting patients and hospital PRO admins report operational equipment downtime, tube overheating, and live ICU occupancy.
              </p>
            </div>
          </div>
        </div>

        {/* 2. STATUTORY MEDICAL & LEGAL DISCLAIMER BOX */}
        <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="uppercase tracking-wider font-mono">
              Statutory Clinical Triage &amp; Data Privacy Notice (DPDP Act, 2023 Compliance)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Clinical Triage &amp; Infrastructure Discovery Only:</strong> Klinqo AI (ArogyaPath AI) provides hospital equipment availability tracking, emergency proximity routing, and algorithmic cost range estimates based on standard clinical guidelines and publicly notified CGHS / PM-JAY tariffs. It does <strong>not</strong> provide medical diagnoses, offer surgical prognosis, or prescribe pharmacological medication. All clinical decisions must be confirmed with licensed medical practitioners upon physical arrival. In life-threatening emergencies, immediately dial <strong>108</strong> or proceed to the nearest verified emergency room.
          </p>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Patient Data Privacy Shield:</strong> All clinical reports, prescriptions, and lab values analyzed via our AI Triage Studio are processed in memory with client-side automated PII masking in strict accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>. No personal identifying information (Aadhaar numbers, patient names, phone numbers, or residential addresses) is stored on persistent public servers.
          </p>
        </div>

        {/* 3. BOTTOM BRANDING & COPYRIGHT STRIP */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Activity className="w-3.5 h-3.5 text-clinical-teal" />
            </div>
            <span className="font-bold text-slate-300">Klinqo AI (ArogyaPath AI)</span>
            <span>• Next-Gen Indian Healthcare Telemetry Infrastructure</span>
          </div>

          <div className="flex items-center flex-wrap gap-4 font-mono text-[10px]">
            <span className="text-slate-400">ABDM Registry v2.4</span>
            <span>•</span>
            <span className="text-slate-400">NABH Standards Verified</span>
            <span>•</span>
            <span className="text-slate-400">PM-JAY HBP 2.2 Aligned</span>
            <span>•</span>
            <span className="text-emerald-400">All 15 Facility Grids Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
