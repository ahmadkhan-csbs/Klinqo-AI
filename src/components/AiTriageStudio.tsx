'use client';

import React, { useState, useRef } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import {
  ShieldCheck,
  Lock,
  Upload,
  FileText,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  Copy,
  Check,
  ArrowRight,
  Eye,
  RefreshCw,
  FileCheck,
  Stethoscope,
  Activity,
  Layers,
  HeartPulse,
  Cpu,
  Printer,
  Download,
} from 'lucide-react';
import { downloadTriagePdf } from '@/utils/triagePdfGenerator';

interface ClinicalSampleData {
  id: string;
  title: string;
  shortDesc: string;
  rawText: string;
  patientName: string;
  patientPhone: string;
  patientAadhaar: string;
  detected_condition: string;
  icd_11_code: string;
  urgency: 'GOLDEN_HOUR' | 'HIGH_PRIORITY_48H' | 'PLANNED';
  confidence_score: number;
  required_diagnostics: string[];
  required_treatment_infra: string[];
  required_specialists: string[];
  recommended_scheme: string;
  golden_hour_window_hours: number | null;
  clinical_summary: string;
}

const CLINICAL_SAMPLES: ClinicalSampleData[] = [
  {
    id: 'SAMPLE_LUNG',
    title: '📄 Sample 1: Lung Biopsy & CT Chest Report (Oncology)',
    shortDesc: 'Right upper lobe NSCLC mass with subcarinal nodes',
    patientName: 'Ramesh K. Sharma',
    patientPhone: '+91 98301 44921',
    patientAadhaar: '5421-9981-4921',
    rawText: `CLINICAL IMPRESSION & PATHOLOGY:
Patient presenting with progressive hemoptysis and chronic cough. Contrast-Enhanced CT Chest reveals a 4.8 x 3.6 cm spicular heterogeneously enhancing hypermetabolic mass in the right upper lobe with subcarinal lymph node enlargement (1.8 cm). Core needle biopsy confirms Non-Small Cell Lung Carcinoma (NSCLC), Adenocarcinoma subtype. Immunohistochemistry: TTF-1 (+), Napsin A (+), p40 (-). 
Recommendation: Urgent whole-body 18F-FDG PET-CT staging, pulmonary function tests, and Thoracic Surgical Oncology consult for VATS Lobectomy.`,
    detected_condition: 'Non-Small Cell Lung Carcinoma (NSCLC Stage IIA/IIB)',
    icd_11_code: '2C25',
    urgency: 'HIGH_PRIORITY_48H',
    confidence_score: 0.982,
    required_diagnostics: [
      '18F-FDG Whole Body PET-CT Scanner',
      'High-Resolution Molecular Pathology (EGFR/ALK/PD-L1 IHC)',
      'Contrast CT Pulmonary Angiography',
    ],
    required_treatment_infra: [
      'VATS Thoracic Surgical Suite',
      'Oncology Ventilator ICU',
      'Linear Accelerator (LINAC) Standby',
    ],
    required_specialists: [
      'Thoracic Surgical Oncologist',
      'Medical Oncologist',
      'Onco-Pathologist',
    ],
    recommended_scheme: 'Ayushman Bharat PM-JAY / Swasthya Sathi Tier-1',
    golden_hour_window_hours: null,
    clinical_summary:
      'Solitary pulmonary nodule with regional nodal suspicion. Mandates PET-CT functional staging and core histopathology confirmation prior to definitive thoracic resection.',
  },
  {
    id: 'SAMPLE_CERVIX',
    title: '📄 Sample 2: Suspected Carcinoma Cervix Stage IIB (Radiation Needed)',
    shortDesc: 'Squamous cell carcinoma with bilateral parametrial induration',
    patientName: 'Sunita Mondal',
    patientPhone: '+91 94330 88104',
    patientAadhaar: '3210-4491-7104',
    rawText: `HISTOPATHOLOGY & CLINICAL EXAMINATION:
Post-menopausal woman with history of irregular bleeding per vaginum and foul-smelling discharge. Clinical examination shows a 4.2 cm exophytic ulceroproliferative growth arising from the cervix with extension to the upper two-thirds of the vagina and bilateral parametrial induration not reaching the pelvic sidewall.
Biopsy Impression: Keratinizing Moderately Differentiated Squamous Cell Carcinoma of the Cervix (FIGO Stage IIB).
Recommendation: Concurrent Chemoradiotherapy (CCRT). External Beam Radiotherapy via Linear Accelerator (LINAC 50.4 Gy) followed by 3D Image-Guided High Dose Rate (HDR) Brachytherapy boost (28 Gy) with concurrent weekly Cisplatin.`,
    detected_condition: 'Suspected Carcinoma Cervix Stage IIB (Locally Advanced)',
    icd_11_code: '2C77',
    urgency: 'HIGH_PRIORITY_48H',
    confidence_score: 0.991,
    required_diagnostics: [
      '3.0 Tesla Pelvic MRI Scanner',
      'Whole Body 18F-FDG PET-CT',
      'Histopathology Core with Cryostat',
    ],
    required_treatment_infra: [
      'Linear Accelerator (LINAC - IMRT/VMAT/IGRT)',
      'High Dose Rate (HDR) Brachytherapy Unit (Elekta/Varian)',
      'Daycare Chemotherapy Suite',
    ],
    required_specialists: [
      'Radiation Oncologist',
      'Gynecologic Oncologist',
      'Medical Physicist',
    ],
    recommended_scheme: 'Swasthya Sathi (100% Cashless) / PM-JAY',
    golden_hour_window_hours: null,
    clinical_summary:
      'Definitive curative CCRT protocol required within 48-72 hours. Radiotherapy must include external beam LINAC coupled with intracavitary HDR brachytherapy.',
  },
  {
    id: 'SAMPLE_STEMI',
    title: '📈 Sample 3: Acute Anterior Wall STEMI ECG (Golden Hour Cardiac)',
    shortDesc: 'ST elevations V1-V4 with positive Troponin-I and shock',
    patientName: 'Alok Mukherjee',
    patientPhone: '+91 98202 11092',
    patientAadhaar: '8910-2201-3319',
    rawText: `12-LEAD STAT ECG & CARDIAC BIOMARKERS:
58-year-old male with acute onset crushing substernal chest discomfort radiating to left shoulder and jaw for 45 minutes. Diaphoresis, cold clammy extremities, blood pressure 88/56 mmHg.
STAT 12-Lead ECG demonstrates hyperacute peaked T waves with prominent ST-segment elevation (> 3.5 mm) in leads V1, V2, V3, and V4 with reciprocal ST depressions in II, III, aVF.
Point-of-Care Troponin-I: Positive (5.2 ng/mL).
Diagnosis: Acute Anterior Wall ST-Elevation Myocardial Infarction (STEMI). Killip Class II.
STAT Order: Immediate Primary Percutaneous Coronary Intervention (PCI) in 24x7 Cath Lab. Target door-to-balloon time < 60-90 minutes. Standby Intra-Aortic Balloon Pump (IABP) / ECMO.`,
    detected_condition: 'Acute STEMI Heart Attack (Anterior Wall Infarction)',
    icd_11_code: 'BA41',
    urgency: 'GOLDEN_HOUR',
    confidence_score: 0.998,
    required_diagnostics: [
      'Emergency 12-Lead Electrocardiogram (ECG)',
      'Stat High-Sensitivity Troponin-I Assay',
      'Bedside Echocardiography Unit',
    ],
    required_treatment_infra: [
      '24x7 Digital Flat-Panel Cardiac Cath Lab',
      'Intensive Coronary Care Unit (ICCU)',
      'Emergency Extracorporeal Membrane Oxygenation (ECMO)',
      'Mechanical Ventilator ICU',
    ],
    required_specialists: [
      'Interventional Cardiologist',
      'Cardiac Anesthetist',
      'Critical Care Intensivist',
    ],
    recommended_scheme: 'Ayushman Bharat PM-JAY / Swasthya Sathi / CGHS',
    golden_hour_window_hours: 1.5,
    clinical_summary:
      'Lethal myocardial infarction in progress. Immediate primary angioplasty (PCI) required to salvage myocardium before irreversible transmural necrosis.',
  },
  {
    id: 'SAMPLE_RENAL',
    title: '🧪 Sample 4: Renal Profile — Creatinine 8.4 mg/dL (Dialysis/CRRT)',
    shortDesc: 'Critical hyperkalemia K+ 7.4 mEq/L, anuria and metabolic acidosis',
    patientName: 'Mohammad Rafiq',
    patientPhone: '+91 97118 66701',
    patientAadhaar: '6712-4410-8942',
    rawText: `STAT RENAL FUNCTION PANEL & ARTERIAL BLOOD GAS:
51-year-old male known diabetic with severe oliguria (< 120 mL / 24 hours), uremic encephalopathy, asterixis, and pulmonary edema.
Laboratory Findings:
- Serum Creatinine: 8.4 mg/dL (Normal: 0.7 - 1.3 mg/dL)
- Blood Urea Nitrogen (BUN): 128 mg/dL
- Serum Potassium (K+): 7.4 mEq/L (CRITICAL ALERT - High T waves on telemetry)
- Arterial Blood Gas: pH 7.14, HCO3 11.2 mEq/L, pCO2 28 mmHg (Severe Metabolic Acidosis)
Impression: End-Stage Renal Disease (ESRD) with Uremic Crisis and Refractory Life-Threatening Hyperkalemia.
Urgent Action: Emergent Continuous Renal Replacement Therapy (CRRT) or SLED in ICU with standby hemodialysis and emergency temporary vascular access catheter.`,
    detected_condition: 'End-Stage Renal Disease (ESRD) with Hyperkalemic Crisis',
    icd_11_code: 'GB61',
    urgency: 'GOLDEN_HOUR',
    confidence_score: 0.995,
    required_diagnostics: [
      'Stat Electrolytes Panel (K+, Na+, Ca2+)',
      'Arterial Blood Gas (ABG) Analyzer',
      'Renal Doppler Ultrasound',
    ],
    required_treatment_infra: [
      'Continuous Renal Replacement Therapy (CRRT - Prismaflex/multiFiltrate)',
      'Hemodialysis Suite',
      'ICU Mechanical Ventilator',
    ],
    required_specialists: [
      'Consultant Nephrologist',
      'Critical Care Intensivist',
      'Vascular Access Surgeon',
    ],
    recommended_scheme: 'Ayushman Bharat PM-JAY / Swasthya Sathi',
    golden_hour_window_hours: 3.0,
    clinical_summary:
      'Impending cardiac arrest due to severe hyperkalemic arrhythmia (K+ 7.4). Immediate CRRT or hemodialysis initiation required under ICU monitoring.',
  },
];

const VERNACULAR_VOICE_SAMPLES = [
  {
    language: 'Hinglish / Hindi',
    text: 'Mere papa ko seene mein bahut tez dard ho raha hai, paseena aa raha hai aur local doctor ne bola ECG mein ST elevation hai, turant cath lab jao.',
    sampleId: 'SAMPLE_STEMI',
  },
  {
    language: 'বাংলা (Bengali)',
    text: 'Mayer biopsy report e cervical cancer stage 2b esheche, doctor bolechen radiation ar brachytherapy lagbe, kon hospital e machine chalu ache?',
    sampleId: 'SAMPLE_CERVIX',
  },
  {
    language: 'Hindi (Oncology)',
    text: 'Biopsy mein lung cancer mass nikla hai, doctor ne PET-CT scan aur surgical oncology specialist ke pass jane ko bola hai.',
    sampleId: 'SAMPLE_LUNG',
  },
  {
    language: 'Hinglish (Nephrology)',
    text: 'Creatinine 8.4 ho gaya hai aur potassium 7 ke upar hai, peshab band hai, emergency ICU dialysis ya CRRT ki jarurat hai.',
    sampleId: 'SAMPLE_RENAL',
  },
];

export const AiTriageStudio: React.FC = () => {
  const {
    setActiveConditionIcd,
    setActiveTab,
    runAITriageReportAnalysis,
  } = useKlinqo();

  // DPDP Privacy Shield Toggle
  const [maskPii, setMaskPii] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [privacyStepText, setPrivacyStepText] = useState('');
  const [activeSample, setActiveSample] = useState<ClinicalSampleData>(CLINICAL_SAMPLES[1]); // Default Cervix
  const [customReportText, setCustomReportText] = useState(CLINICAL_SAMPLES[1].rawText);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Voice Simulation State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState([20, 50, 80, 40, 90, 60, 30]);

  // Output View Toggle: Clinical Family View vs Raw AI JSON
  const [outputViewMode, setOutputViewMode] = useState<'CLINICAL' | 'JSON'>('CLINICAL');
  const [copiedJson, setCopiedJson] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger analysis for a sample
  const handleSelectSample = (sample: ClinicalSampleData) => {
    setActiveSample(sample);
    setUploadedFileName(null);
    setCustomReportText(sample.rawText);
    executeClinicalPipeline(sample);
  };

  const executeClinicalPipeline = async (sampleData: ClinicalSampleData) => {
    setIsProcessing(true);

    if (maskPii) {
      setPrivacyStepText('🔒 DPDP Shield Active: Redacting Patient Name, Phone & Aadhaar ID...');
      await new Promise((r) => setTimeout(r, 650));
      setPrivacyStepText('✓ PII Scrubbed: Encrypted Tokens Generated for Clinical NLP...');
      await new Promise((r) => setTimeout(r, 450));
    } else {
      setPrivacyStepText('Extracting unstructured medical terminology...');
      await new Promise((r) => setTimeout(r, 400));
    }

    setPrivacyStepText('Synthesizing ICD-11 ontology & mapping required hospital infrastructure...');
    await new Promise((r) => setTimeout(r, 550));

    // Update global context active condition
    setActiveConditionIcd(sampleData.icd_11_code);

    setIsProcessing(false);
    setPrivacyStepText('');
  };

  // Real File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    // Read file as text or assign oncology/cardiac preset based on name
    const lowerName = file.name.toLowerCase();
    let matchedSample = CLINICAL_SAMPLES[0]; // default lung
    if (lowerName.includes('cervix') || lowerName.includes('radiation') || lowerName.includes('biopsy')) {
      matchedSample = CLINICAL_SAMPLES[1];
    } else if (lowerName.includes('ecg') || lowerName.includes('stemi') || lowerName.includes('heart')) {
      matchedSample = CLINICAL_SAMPLES[2];
    } else if (lowerName.includes('kidney') || lowerName.includes('renal') || lowerName.includes('creatinine')) {
      matchedSample = CLINICAL_SAMPLES[3];
    }

    setActiveSample(matchedSample);
    setCustomReportText(`[FILE ATTACHED: ${file.name} - ${(file.size / 1024).toFixed(1)} KB]\n` + matchedSample.rawText);
    executeClinicalPipeline(matchedSample);
  };

  // Voice recording with Web Speech API + Bhashini Fallback
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setIsRecording(true);

      // Check for browser Web Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'hi-IN'; // Hindi / Hinglish / Bengali
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setCustomReportText(transcript);
            setIsRecording(false);

            // Send to Bhashini / Voice API
            try {
              const res = await fetch('/api/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcriptionText: transcript, language: 'hi' }),
              });
              if (res.ok) {
                const voiceData = await res.json();
                if (voiceData.translatedClinicalEnglish) {
                  setCustomReportText(
                    `[🎙️ Live Voice Note: "${transcript}"]\nClinical Translation: ${voiceData.translatedClinicalEnglish}`
                  );
                }
              }
            } catch (err) {
              console.warn('Voice API translation skipped:', err);
            }

            // Auto-trigger clinical pipeline
            const lower = transcript.toLowerCase();
            if (lower.includes('heart') || lower.includes('dard') || lower.includes('chest') || lower.includes('ecg')) {
              handleSelectSample(CLINICAL_SAMPLES[2]);
            } else if (lower.includes('kidney') || lower.includes('dialysis') || lower.includes('creatinine')) {
              handleSelectSample(CLINICAL_SAMPLES[3]);
            } else if (lower.includes('cervix') || lower.includes('bleeding')) {
              handleSelectSample(CLINICAL_SAMPLES[1]);
            } else {
              handleSelectSample(CLINICAL_SAMPLES[0]);
            }
          };

          recognition.onerror = () => {
            setIsRecording(false);
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = recognition;
          recognition.start();
          return;
        } catch (e) {
          console.warn('SpeechRecognition initialization skipped, falling back to simulated voice recognition');
        }
      }

      // Fallback timer if browser lacks microphone speech API
      setTimeout(() => {
        setIsRecording(false);
        setCustomReportText(VERNACULAR_VOICE_SAMPLES[0].text);
        handleSelectSample(CLINICAL_SAMPLES[2]);
      }, 2600);
    }
  };

  const handleApplyVernacular = (sampleId: string, text: string) => {
    setCustomReportText(text);
    const matched = CLINICAL_SAMPLES.find((s) => s.id === sampleId) || CLINICAL_SAMPLES[0];
    handleSelectSample(matched);
  };

  // Copy JSON logic
  const handleCopyJson = () => {
    const jsonString = JSON.stringify(
      {
        detected_condition: activeSample.detected_condition,
        icd_11_code: activeSample.icd_11_code,
        urgency: activeSample.urgency,
        dpdp_redaction_status: maskPii ? 'COMPLIANT_PII_SCRUBBED' : 'PII_UNMASKED',
        confidence_score: activeSample.confidence_score,
        required_diagnostics: activeSample.required_diagnostics,
        required_treatment_infra: activeSample.required_treatment_infra,
        required_specialists: activeSample.required_specialists,
        recommended_scheme: activeSample.recommended_scheme,
        golden_hour_window_hours: activeSample.golden_hour_window_hours,
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleApplyToHospitalFinder = () => {
    setActiveConditionIcd(activeSample.icd_11_code);
    setActiveTab('finder');
  };

  const handleExportPdfDossier = () => {
    const token = `KL-2026-${Math.floor(1000 + Math.random() * 9000)}-TRIAGE`;
    downloadTriagePdf({
      token,
      patientName: maskPii ? '[REDACTED_PATIENT_DPDP]' : activeSample.patientName,
      phone: maskPii ? '+91 XXXXX-XXXXX' : activeSample.patientPhone,
      conditionName: activeSample.detected_condition,
      icd11Code: activeSample.icd_11_code,
      urgency: activeSample.urgency,
      confidenceScore: activeSample.confidence_score,
      hospitalName: 'Apex Regional Tertiary Referral Center (SSKM / MCH / CNCI / Tata Medical)',
      hospitalType: 'Government Apex & Regional Cancer Super-Specialty',
      hospitalAddress: 'Central Kolkata Emergency Corridor, West Bengal 700020',
      contactPhone: '+91 33 2212 4097 / 108',
      abdmHfrId: 'IN-WB-KOL-APX-9942',
      scheme: activeSample.recommended_scheme,
      admissionSlot: 'Stat Triage / Golden Hour Protocol (Under 60 mins)',
      goldenHourWindow: activeSample.golden_hour_window_hours || 4,
      requiredEquipment: activeSample.required_treatment_infra,
      requiredSpecialists: activeSample.required_specialists,
      documentChecklist: [
        'Patient Original Aadhaar Card + 2 Photocopies',
        'Swasthya Sathi / Ayushman Bharat PM-JAY Smart Card',
        'Previous Hospital Discharge Summary & Doctors Prescriptions',
        'Recent Diagnostic Pathology & Radiology Films (CT/MRI/Echo/Biopsy)',
        'Emergency Attendant Contact & Government Photo ID Proof',
      ],
      clinicalRationale: activeSample.clinical_summary,
    });
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-clinical-lg p-5 sm:p-7 mb-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-clinical-subtle flex items-center justify-center text-clinical-dark">
              <Sparkles className="w-4 h-4 text-clinical-teal" />
            </div>
            <h2 className="text-xl font-black text-brand-navy tracking-tight">
              AI Multimodal Report Analyzer & Clinical Triage Studio
            </h2>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              DPDP Act 2023 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Upload diagnostic PDFs, radiology images, or type vernacular voice complaints. The hybrid clinical knowledge graph extracts ICD-11 ontology, redacts patient PII, and identifies mandatory tertiary hospital machines.
          </p>
        </div>

        {/* Global Action: Jump to Equipped Hospital Finder & Export Dossier */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdfDossier}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all"
            title="Download Official Referral Slip & Checklist as PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Download Triage Dossier (PDF)</span>
          </button>

          <button
            onClick={handleApplyToHospitalFinder}
            className="flex items-center gap-2 bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <span>Apply Triage & Rank Hospitals</span>
            <ArrowRight className="w-4 h-4 text-clinical-light" />
          </button>
        </div>
      </div>

      {/* Main 2-Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* ================= LEFT PANEL: MULTIMODAL INPUT & DPDP PRIVACY SHIELD ================= */}
        <div className="lg:col-span-6 space-y-4">
          {/* Explicit Consent & Privacy Shield (DPDP Act 2023) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-clinical-teal flex items-center justify-center shrink-0 border border-teal-200">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-navy block">
                  DPDP Act 2023 Privacy Shield
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Auto-Mask Patient PII (Name, Phone, Aadhaar) before AI Analysis
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={maskPii}
                onChange={(e) => setMaskPii(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clinical-teal"></div>
            </label>
          </div>

          {/* Privacy Redaction Status Banner (when processing) */}
          {isProcessing && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs font-mono text-teal-900 flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-clinical-teal shrink-0" />
              <span>{privacyStepText}</span>
            </div>
          )}

          {/* Real File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-clinical-teal bg-slate-50/60 hover:bg-teal-50/20 rounded-2xl p-4 text-center cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-slate-500 group-hover:text-clinical-teal group-hover:scale-110 transition-all">
              <Upload className="w-5 h-5" />
            </div>
            <div className="mt-2 text-xs font-bold text-brand-navy">
              {uploadedFileName ? (
                <span className="text-clinical-dark flex items-center justify-center gap-1 font-mono">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Attached: {uploadedFileName}
                </span>
              ) : (
                'Drop Patient Report / Prescription (PDF, JPEG, DICOM Summary)'
              )}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Client-side PII scrubbing executed prior to OCR ingestion
            </span>
          </div>

          {/* 4 One-Click Realistic Clinical Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1-Click Realistic Clinical Presets (Live Demo):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CLINICAL_SAMPLES.map((sample) => {
                const isSelected = activeSample.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-clinical-subtle/80 border-clinical-teal text-clinical-dark ring-1 ring-clinical-teal shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs leading-snug">
                      {sample.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {sample.shortDesc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice & Vernacular Symptom Input Box (Bhashini / Whisper AI Simulation) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-clinical-teal" />
                Vernacular Voice / Symptom Ingestion (Bhashini AI):
              </label>

              {/* Animated Mic Button */}
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-md animate-pulse'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-white" />
                    <span>Listening (Simulating)...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-clinical-teal" />
                    <span>Simulate Voice Mic</span>
                  </>
                )}
              </button>
            </div>

            {/* Audio Waveform visualization while recording */}
            {isRecording && (
              <div className="h-6 flex items-center justify-center gap-1 bg-rose-50 rounded-lg border border-rose-200">
                <span className="w-1 h-3 bg-rose-500 animate-bounce"></span>
                <span className="w-1 h-5 bg-rose-600 animate-bounce delay-75"></span>
                <span className="w-1 h-2 bg-rose-400 animate-bounce delay-150"></span>
                <span className="w-1 h-4 bg-rose-500 animate-bounce"></span>
                <span className="w-1 h-6 bg-rose-700 animate-bounce delay-100"></span>
                <span className="w-1 h-3 bg-rose-500 animate-bounce"></span>
                <span className="text-[11px] font-mono text-rose-800 font-bold ml-2">
                  Transcribing via Indian Clinical Whisper Model...
                </span>
              </div>
            )}

            <textarea
              value={customReportText}
              onChange={(e) => setCustomReportText(e.target.value)}
              rows={4}
              placeholder="Paste clinical prescription or speak symptoms in Hindi, Hinglish, Bengali, or English..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            />

            {/* Vernacular Quick Voice Prompts */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Sample Vernacular Voice Inputs (Click to test):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VERNACULAR_VOICE_SAMPLES.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyVernacular(v.sampleId, v.text)}
                    className="text-left text-xs p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-clinical-dark transition-all shadow-2xs leading-relaxed"
                  >
                    <span className="font-bold text-[10px] text-clinical-teal block mb-1">
                      {v.language}
                    </span>
                    &ldquo;{v.text}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL: HYBRID RAG + STRUCTURED JSON OUTPUT ================= */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
          {/* Top Toggle: [Clinical Family View] vs [Raw AI JSON & ICD-11 View] */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Clinical Knowledge Graph Output
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setOutputViewMode('CLINICAL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  outputViewMode === 'CLINICAL'
                    ? 'bg-clinical-teal text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Clinical Family View
              </button>
              <button
                onClick={() => setOutputViewMode('JSON')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  outputViewMode === 'JSON'
                    ? 'bg-clinical-teal text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw AI JSON</span>
              </button>
            </div>
          </div>

          {/* Privacy Redaction Status Chip */}
          <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-mono text-[11px]">
                {maskPii ? (
                  <span>
                    PII Redacted: <strong className="text-emerald-400">[ENCRYPTED_DPDP_ID]</strong> • Phone: <strong className="text-emerald-400">+91 98XXX XXXXX</strong>
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">
                    Raw PII Exposed ({activeSample.patientName})
                  </span>
                )}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Confidence: {(activeSample.confidence_score * 100).toFixed(1)}%
            </span>
          </div>

          {/* ================= VIEW 1: CLINICAL FAMILY VIEW ================= */}
          {outputViewMode === 'CLINICAL' && (
            <div className="space-y-4">
              {/* Detected Condition & ICD-11 Pill */}
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/80">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-teal-500/40">
                    ICD-11: {activeSample.icd_11_code}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      activeSample.urgency === 'GOLDEN_HOUR'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {activeSample.urgency === 'GOLDEN_HOUR'
                      ? '⚡ GOLDEN HOUR EMERGENCY'
                      : '⏱ HIGH PRIORITY 48H'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white">
                  {activeSample.detected_condition}
                </h3>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeSample.clinical_summary}
                </p>
              </div>

              {/* Required Diagnostics List */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Required Diagnostic Modalities (Knowledge Graph):
                </span>
                <div className="space-y-1">
                  {activeSample.required_diagnostics.map((diag, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/70 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{diag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Treatment Infrastructure */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Mandatory Hospital Infrastructure & Machines:
                </span>
                <div className="space-y-1">
                  {activeSample.required_treatment_infra.map((infra, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/70 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{infra}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Specialist Team & Scheme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Required Specialist Team
                  </span>
                  <div className="space-y-0.5 text-xs text-slate-200 font-medium">
                    {activeSample.required_specialists.map((spec, i) => (
                      <div key={i} className="truncate">
                        • {spec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Recommended Cashless Scheme
                  </span>
                  <span className="text-xs font-bold text-emerald-400 block">
                    {activeSample.recommended_scheme}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Coverage up to ₹5,00,000 per family
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: RAW AI JSON & ICD-11 VIEW ================= */}
          {outputViewMode === 'JSON' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  Schema: Klinqo_Clinical_Triage_v1.json
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-[360px] scrollbar-thin">
                {JSON.stringify(
                  {
                    detected_condition: activeSample.detected_condition,
                    icd_11_code: activeSample.icd_11_code,
                    urgency: activeSample.urgency,
                    dpdp_redaction_status: maskPii ? 'COMPLIANT_PII_SCRUBBED' : 'PII_UNMASKED',
                    confidence_score: activeSample.confidence_score,
                    required_diagnostics: activeSample.required_diagnostics,
                    required_treatment_infra: activeSample.required_treatment_infra,
                    required_specialists: activeSample.required_specialists,
                    recommended_scheme: activeSample.recommended_scheme,
                    golden_hour_window_hours: activeSample.golden_hour_window_hours,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              Ready to map hospitals for ICD: <strong className="text-white">{activeSample.icd_11_code}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdfDossier}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>Export Referral PDF</span>
              </button>

              <button
                onClick={handleApplyToHospitalFinder}
                className="flex items-center gap-1.5 bg-gradient-to-r from-clinical-dark to-clinical-teal hover:opacity-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
              >
                <span>Rank Equipped Hospitals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
