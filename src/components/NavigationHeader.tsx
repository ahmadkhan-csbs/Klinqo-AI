'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { Language } from '@/utils/translations';
import { NavigationTab } from '@/context/KlinqoContext';
import { HospitalAdminModal } from '@/components/HospitalAdminModal';
import {
  Activity,
  ShieldCheck,
  PhoneCall,
  Sliders,
  Sparkles,
  Search,
  IndianRupee,
  Navigation2,
  Building2,
  Scale,
  Globe,
  Radio,
  Zap,
} from 'lucide-react';

const CITIES = ['Kolkata', 'Delhi-NCR', 'Mumbai', 'Chennai', 'Bengaluru', 'All Cities'];

export const NavigationHeader: React.FC = () => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const {
    activeTab,
    setActiveTab,
    compareHospitals,
    clearCompareHospitals,
    language,
    setLanguage,
    t,
    isB2BAdminMode,
    toggleB2BAdminMode,
    triggerSosTriage,
  } = useKlinqo();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'finder', label: t.navEquippedFinder, icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'ai_triage', label: t.navReportTriage, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'cost_calc', label: t.navCostCalc, icon: <IndianRupee className="w-3.5 h-3.5" /> },
    { id: 'smart_route', label: t.navSmartRoute, icon: <Navigation2 className="w-3.5 h-3.5" /> },
    { id: 'verify_portal', label: t.navVerifyPortal, icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-clinical">
      {/* 1. TOP CLINICAL STATUS STRIP */}
      <div className="bg-brand-navy text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Live Pulsing Emerald Grid Status */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-100 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-clinical-light" />
              {t.topBarAlert}
            </span>
          </div>

          {/* Right Controls: B2B Admin Switch + Language Switcher + 108 Emergency */}
          <div className="flex items-center flex-wrap gap-3 text-[11px]">
            {/* Quick Switch: B2B Hospital Admin Mode */}
            <button
              onClick={() => {
                toggleB2BAdminMode();
                setIsAdminModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold transition-all border ${
                isB2BAdminMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              title="Launch B2B Admin & Machine Telemetry Controller"
            >
              <Sliders className="w-3 h-3" />
              <span>{isB2BAdminMode ? t.adminModeActive : t.adminMode}</span>
              {isB2BAdminMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
              )}
            </button>

            {/* Multilingual Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-md p-0.5 border border-slate-700">
              <Globe className="w-3 h-3 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  language === 'en'
                    ? 'bg-clinical-teal text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  language === 'hi'
                    ? 'bg-clinical-teal text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  language === 'bn'
                    ? 'bg-clinical-teal text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* National 108 Emergency Direct link */}
            <a
              href="tel:108"
              className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded font-bold transition-colors border border-rose-500/40"
            >
              <PhoneCall className="w-3 h-3 text-status-coral animate-bounce" />
              <span>108 ER</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. STICKY GLASSMORPHIC NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand Logo with Radar Pulse */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-navy via-slate-900 to-clinical-teal p-0.5 shadow-md flex items-center justify-center relative">
              {/* Radar pulse rings */}
              <div className="absolute inset-0 rounded-xl border border-teal-400/40 animate-ping opacity-30 pointer-events-none"></div>
              <div className="w-full h-full bg-brand-navy rounded-[10px] flex items-center justify-center text-clinical-light">
                <Activity className="w-5 h-5 text-clinical-light animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-brand-navy flex items-center gap-1">
                  Klinqo<span className="text-clinical-teal">AI</span>
                </span>
                <span className="bg-clinical-subtle text-clinical-dark text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-clinical-teal animate-pulse" />
                  ArogyaPath v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Infrastructure-Verified Hospital Triage & Golden Hour Routing
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Nav Tabs & SOS High-Contrast Button */}
        <div className="flex items-center flex-wrap justify-between md:justify-end gap-2.5">
          <nav className="flex items-center space-x-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'verify_portal') {
                    setIsAdminModalOpen(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-brand-navy shadow-sm border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-brand-navy hover:bg-slate-200/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {isB2BAdminMode && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isAdminModalOpen
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Machine Grid</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
              </button>
            )}
          </nav>

          {/* High-Contrast Coral Red SOS Button */}
          <button
            onClick={triggerSosTriage}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-700 hover:to-rose-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] radar-pulse-danger whitespace-nowrap border border-rose-400"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{t.sosButton}</span>
          </button>
        </div>
      </div>

      {/* Compare Hospital indicator bar if any selected */}
      {compareHospitals.length > 0 && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5 max-w-7xl mx-auto w-full">
            <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Comparing {compareHospitals.length} of 3 Facilities:
            </span>
            <span className="text-amber-800 truncate">
              {compareHospitals.map((c) => c.hospital.name).join(', ')}
            </span>
            <button
              onClick={clearCompareHospitals}
              className="ml-auto underline text-[11px] font-bold text-amber-800 hover:text-amber-950"
            >
              Clear Tray
            </button>
          </div>
        </div>
      )}
    </header>

    {/* B2B Hospital Admin & Infrastructure Modal */}
    <HospitalAdminModal
      isOpen={isAdminModalOpen}
      onClose={() => setIsAdminModalOpen(false)}
    />
  </>
  );
};
