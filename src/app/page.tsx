'use client';

import React from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { NavigationHeader } from '@/components/NavigationHeader';
import { InteractiveHero } from '@/components/InteractiveHero';
import { AiTriageStudio } from '@/components/AiTriageStudio';
import { KolkataMasterExplorer } from '@/components/KolkataMasterExplorer';
import { HospitalDiscoveryGrid } from '@/components/HospitalDiscoveryGrid';
import { CostTransparencyEngine } from '@/components/CostTransparencyEngine';
import { GeospatialRerouteMap } from '@/components/GeospatialRerouteMap';
import { HospitalDetailModal } from '@/components/HospitalDetailModal';
import { HospitalCompareDrawer } from '@/components/HospitalCompareDrawer';
import { SOSTriageModal } from '@/components/SOSTriageModal';
import { InfrastructureMatrixView } from '@/components/InfrastructureMatrixView';
import { CostTransparencyView } from '@/components/CostTransparencyView';
import { ABDMDirectoryView } from '@/components/ABDMDirectoryView';
import { AdminTelemetryControl } from '@/components/AdminTelemetryControl';
import { WhatsAppBotSimulator } from '@/components/WhatsAppBotSimulator';
import { ComplianceFooter } from '@/components/ComplianceFooter';
import {
  Activity,
  ShieldCheck,
  AlertCircle,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  Sliders,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    rankedHospitals,
    activeCondition,
    triageState,
    equipment,
    isB2BAdminMode,
    t,
  } = useKlinqo();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. Top Clinical Status Bar & Sticky Glassmorphic Navbar */}
      <NavigationHeader />

      {/* 2. Interactive Hero Command Center (Dual Search & Discrepancy Preview) */}
      <InteractiveHero />

      {/* B2B Admin Mode Alert Banner if active */}
      {isB2BAdminMode && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-950" />
              B2B Hospital Administration Mode is ON: You can mutate live equipment status, test failure cascades, and view internal hospital telemetry.
            </span>
            <span className="font-mono text-[11px] underline">Admin Privileges Active</span>
          </div>
        </div>
      )}

      {/* 3. Main Dynamic Content by Navigation Tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {/* TAB 1: Equipped Hospital Finder (Section 3: Infrastructure-First Hospital Discovery & Comparison Engine) */}
        {activeTab === 'finder' && (
          <div>
            {/* Quick Callout Banner to Launch AI Triage Studio */}
            <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-brand-navy via-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-clinical-md border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-clinical-light flex items-center justify-center border border-teal-500/30">
                  <Sparkles className="w-5 h-5 text-clinical-teal" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Have a Doctor&apos;s Prescription or Radiology PDF?
                  </h3>
                  <p className="text-xs text-slate-300">
                    Use our DPDP-compliant Multimodal AI Studio to auto-mask PII and map mandatory hospital machines.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai_triage')}
                className="shrink-0 flex items-center gap-1.5 bg-clinical-teal hover:bg-clinical-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <span>Launch AI Triage Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Kolkata Healthcare Infrastructure & Zonal Atlas (144 Wards, 16 Boroughs, 6 Tiers) */}
            <KolkataMasterExplorer />

            {/* Infrastructure-First Hospital Discovery & Comparison Grid */}
            <HospitalDiscoveryGrid />
          </div>
        )}

        {/* TAB 2: AI Report Triage Studio (Section 2) */}
        {activeTab === 'ai_triage' && (
          <div>
            <AiTriageStudio />

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    Equipped Hospitals Ranked for Identified Diagnosis:
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hospitals evaluated using live 50-25-25 capability score for ICD-11 {activeCondition?.condition_icd_code}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {rankedHospitals.length} Verified Facilities
                </span>
              </div>

              {/* Discovery Grid below AI Report Triage */}
              <HospitalDiscoveryGrid />
            </div>
          </div>
        )}

        {/* TAB 3: 3-Tier Cost Calculator (Section 4: 3-Tier Algorithmic Cost Estimator & Financial Aid Matcher) */}
        {activeTab === 'cost_calc' && (
          <div className="space-y-6">
            <CostTransparencyEngine />
            <CostTransparencyView />
          </div>
        )}

        {/* TAB 4: Smart Route Map & Telemetry Matrix (Section 5: Geospatial Smart Rerouter & Hospital Infrastructure Deep-Dive) */}
        {activeTab === 'smart_route' && (
          <div className="space-y-6">
            <GeospatialRerouteMap />
            <InfrastructureMatrixView />
          </div>
        )}

        {/* TAB 5: Verify Hospital Portal */}
        {activeTab === 'verify_portal' && <ABDMDirectoryView />}

        {/* TAB 6: Admin Telemetry Control */}
        {activeTab === 'admin_telemetry' && <AdminTelemetryControl />}
      </main>

      {/* Global Interactive Modals & Drawers */}
      <HospitalDetailModal />
      <HospitalCompareDrawer />
      <SOSTriageModal />

      {/* Floating WhatsApp Triage Bot Simulator */}
      <WhatsAppBotSimulator />

      {/* Comprehensive Regulatory, Data Trust & Legal Compliance Footer */}
      <ComplianceFooter />
    </div>
  );
}
