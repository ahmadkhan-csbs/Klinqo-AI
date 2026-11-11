'use client';

import React, { useState } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { formatINR } from '@/utils/scoringEngine';
import { UserTriageState } from '@/types/medical';
import {
  FileText,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Filter,
  IndianRupee,
  Navigation2,
  Info,
} from 'lucide-react';

const CLINICAL_PRESETS = [
  {
    label: 'Carcinoma Cervix (Stage IIB)',
    icd: '2C77',
    text: '56F with post-coital bleeding and parametrial extension. Histology confirms squamous cell carcinoma cervix Stage IIB. Recommended for concurrent chemoradiotherapy (CCRT) with external beam LINAC followed by HDR intracavitary brachytherapy boost.',
  },
  {
    label: 'Acute STEMI Heart Attack',
    icd: 'BA41',
    text: '62M presenting with severe crushing substernal chest pain for 45 minutes, diaphoresis, dyspnea. ECG demonstrates acute ST elevations in V1-V4. Troponin-I stat positive. Patient in cardiogenic distress requiring immediate Primary PCI Cath Lab.',
  },
  {
    label: 'Acute Ischemic Stroke (MCA)',
    icd: '8B11',
    text: '68M sudden right-sided hemiparesis and acute global aphasia onset 70 minutes ago. NIHSS score 16. Fast-track MRI 3T with DWI-FLAIR mismatch required to assess salvageable ischemic penumbra and mechanical thrombectomy via biplane cath lab.',
  },
  {
    label: 'ESRD Hyperkalemic Crisis',
    icd: 'GB61',
    text: '52M known diabetic nephropathy, missed 2 hemodialysis sessions. Serum Potassium 7.2 mEq/L with tented T-waves and metabolic acidosis (pH 7.12). Oliguric with pulmonary edema. Emergency continuous renal replacement therapy (CRRT) indicated stat.',
  },
  {
    label: 'Severe Polytrauma (SDH)',
    icd: 'NC72',
    text: '34M road traffic accident victim, GCS 7 (E1V2M4), anisocoria with left pupil fixed and dilated. CT shows acute frontotemporoparietal subdural hematoma with 9mm midline shift. Immediate decompressive craniectomy via operative neuro-microscope.',
  },
  {
    label: 'Lung Cancer (Stage IIA)',
    icd: '2C25',
    text: '61M chronic smoker with non-resolving cough and hemoptysis. CT chest reveals 4.2cm peripheral right upper lobe mass. Needs whole-body PET-CT staging, CT-guided core biopsy with immunohistochemistry and surgical thoracic oncological resection.',
  },
];

export const AITriagePanel: React.FC = () => {
  const {
    conditionRequirements,
    triageState,
    activeCondition,
    setActiveConditionIcd,
    setMaxBudgetINR,
    setRequiredScheme,
    setMaxDistanceKm,
    runAITriageReportAnalysis,
    isAiAnalyzing,
    aiAnalysisResult,
  } = useKlinqo();

  const [clinicalInput, setClinicalInput] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleAnalyze = async () => {
    if (!clinicalInput.trim()) return;
    await runAITriageReportAnalysis(clinicalInput);
  };

  const handleApplyPreset = (preset: typeof CLINICAL_PRESETS[0]) => {
    setClinicalInput(preset.text);
    runAITriageReportAnalysis(preset.text);
  };

  return (
    <section className="bg-white rounded-2xl border border-border shadow-clinical p-5 mb-6">
      {/* Golden Hour / Urgency Clinical Protocol Alert Banner */}
      {activeCondition?.urgency_level === 'GOLDEN_HOUR' && (
        <div className="mb-5 bg-rose-50 border-l-4 border-status-coral p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 radar-pulse-danger">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-status-coral flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-rose-900 tracking-wide uppercase">
                  CRITICAL GOLDEN HOUR DISPATCH ACTIVE
                </span>
                <span className="bg-rose-200 text-rose-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded">
                  Window: &le; {activeCondition.golden_hour_window_hours} Hours
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1">
                {activeCondition.clinical_protocol_summary}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-sm text-xs font-mono font-bold text-rose-800">
            <Clock className="w-4 h-4 text-rose-600 animate-spin" />
            <span>Target Door-to-Needle: FAST-TRACK</span>
          </div>
        </div>
      )}

      {/* Header & AI Report Triage Drawer Trigger */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-brand-navy">
              Clinical Triage & Infrastructure Capability Engine
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Relational Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a target diagnosis or parse unstructured clinical notes to dynamically weigh equipment readiness, PM-JAY / Swasthya Sathi coverage, and distance.
          </p>
        </div>

        {/* AI Parse Quick Button */}
        <button
          onClick={() => setShowAiModal(!showAiModal)}
          className="flex items-center gap-2 bg-gradient-to-r from-clinical-dark to-clinical-teal hover:opacity-95 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-teal-200" />
          {showAiModal ? 'Close AI Clinical Ingestion' : 'AI Clinical Report Parser (ICD-11)'}
        </button>
      </div>

      {/* AI Clinical Ingestion Box (Expandable) */}
      {showAiModal && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-teal-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-clinical-teal" />
              Paste Doctor&apos;s Prescription, Discharge Summary, or Diagnostic Impression:
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              Natural Language Clinical NLP
            </span>
          </div>

          <textarea
            value={clinicalInput}
            onChange={(e) => setClinicalInput(e.target.value)}
            rows={3}
            placeholder="e.g., 58yo woman with persistent abnormal vaginal bleeding, cervical biopsy shows squamous cell carcinoma stage IIb. Requires immediate radiation oncology evaluation with external beam LINAC and HDR brachytherapy..."
            className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-clinical-teal focus:border-transparent text-slate-800"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-600 font-medium mr-1 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-slate-500" /> Quick Clinical Vignettes:
            </span>
            {CLINICAL_PRESETS.map((preset) => (
              <button
                key={preset.icd}
                onClick={() => handleApplyPreset(preset)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-clinical-dark font-medium transition-colors shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-600">
              Parses key symptoms, extracts ICD-11 diagnosis, maps required machines, and re-ranks all 15 hospitals.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={isAiAnalyzing || !clinicalInput.trim()}
              className="flex items-center gap-2 bg-clinical-teal hover:bg-clinical-dark text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              {isAiAnalyzing ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Running AI Clinical Parse...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Extract & Re-rank Hospitals
                </>
              )}
            </button>
          </div>

          {/* AI Result Card */}
          {aiAnalysisResult && (
            <div className="mt-3 p-3.5 rounded-lg bg-teal-50/80 border border-teal-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  AI Clinical Match: {aiAnalysisResult.conditionName}
                </span>
                <span className="bg-teal-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                  ICD-11: {aiAnalysisResult.matchedConditionIcd}
                </span>
              </div>
              <p className="text-teal-900 leading-relaxed">
                {aiAnalysisResult.clinicalRationale}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                  Extracted Biomarkers / Terms:
                </span>
                {aiAnalysisResult.detectedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-white text-teal-800 text-[10px] font-mono px-2 py-0.5 rounded border border-teal-200 font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Target Condition Selector Grid (6 Critical Conditions) */}
      <div className="mt-4">
        <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">
          Target Clinical Condition (ICD-11 Multi-Modality Protocol)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {conditionRequirements.map((cond) => {
            const isSelected = cond.condition_icd_code === triageState.activeConditionIcd;
            const isGoldenHour = cond.urgency_level === 'GOLDEN_HOUR';

            return (
              <button
                key={cond.condition_icd_code}
                onClick={() => setActiveConditionIcd(cond.condition_icd_code)}
                className={`text-left p-3 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'border-clinical-teal bg-clinical-subtle/70 shadow-sm ring-1 ring-clinical-teal'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    ICD {cond.condition_icd_code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isGoldenHour
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isGoldenHour ? '⚡ GOLDEN HOUR' : '⏱ URGENT 48H'}
                  </span>
                </div>

                <div className="font-bold text-xs text-brand-navy leading-snug">
                  {cond.condition_name}
                </div>

                <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {cond.specialty_required}
                </div>

                {/* Mandatory equipment tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {cond.mandatory_equipment.map((code) => (
                    <span
                      key={code}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Filter Controls (Budget, Scheme, Radius) */}
      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Maximum Out-of-Pocket Budget */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
              Patient Out-of-Pocket Budget:
            </span>
            <span className="text-xs font-mono font-bold text-brand-navy">
              {formatINR(triageState.maxBudgetINR)}
            </span>
          </div>
          <input
            type="range"
            min={10000}
            max={800000}
            step={10000}
            value={triageState.maxBudgetINR}
            onChange={(e) => setMaxBudgetINR(Number(e.target.value))}
            className="w-full accent-clinical-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
            <span>₹10K (Govt Subsidized)</span>
            <span>₹400K</span>
            <span>₹800K (Corporate)</span>
          </div>
        </div>

        {/* Govt Scheme & Insurance Empanelment */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Empanelment & Cashless Scheme:
          </label>
          <select
            value={triageState.requiredScheme}
            onChange={(e) =>
              setRequiredScheme(e.target.value as UserTriageState['requiredScheme'])
            }
            aria-label="Empanelment & Cashless Scheme"
            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            <option value="ANY">Any Scheme / Private Cash / All Insurers</option>
            <option value="PMJAY">Ayushman Bharat (PM-JAY) Empanelled Only</option>
            <option value="SWASTHYA_SATHI">Swasthya Sathi Cashless Accepted</option>
            <option value="CGHS">Central Govt Health Scheme (CGHS)</option>
            <option value="PRIVATE_INSURANCE">Private TPA (Star, HDFC, Care, ICICI)</option>
          </select>
          <span className="text-[10px] text-slate-600 block mt-1">
            Filters out hospitals lacking cashless tie-up or penalizes out-of-pocket gap.
          </span>
        </div>

        {/* Ambulance Distance Radius */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Navigation2 className="w-3.5 h-3.5 text-slate-500" />
              Transit Radius & Travel Time:
            </span>
            <span className="text-xs font-mono font-bold text-brand-navy">
              &le; {triageState.maxDistanceKm} km
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={triageState.maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
            className="w-full accent-clinical-teal cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
            <span>5 km (Immediate)</span>
            <span>20 km</span>
            <span>40 km (Inter-city)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
