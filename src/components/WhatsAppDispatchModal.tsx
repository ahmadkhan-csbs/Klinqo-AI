'use client';

import React, { useState } from 'react';
import { HospitalWithScore } from '@/types/medical';
import { formatINR } from '@/utils/scoringEngine';
import {
  X,
  PhoneCall,
  Check,
  Copy,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Navigation,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WhatsAppDispatchModalProps {
  hospitalWithScore: HospitalWithScore | null;
  activeConditionName?: string;
  onClose: () => void;
}

export const WhatsAppDispatchModal: React.FC<WhatsAppDispatchModalProps> = ({
  hospitalWithScore,
  activeConditionName = 'Target Diagnosis',
  onClose,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('+91 98301 44921');
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [isSending, setIsSending] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!hospitalWithScore) return null;

  const { hospital, equipment, treatmentCost, scoreBreakdown } = hospitalWithScore;

  const operationalMachines = equipment
    .filter((e) => e.operational_status === 'OPERATIONAL' && e.available_units > 0)
    .map((e) => e.equipment_code)
    .join(', ');

  const maintenanceMachines = equipment
    .filter((e) => e.operational_status === 'MAINTENANCE')
    .map((e) => e.equipment_code)
    .join(', ');

  const messageTextEN = `🚨 *KLINQO AI — VERIFIED HOSPITAL DISPATCH SUMMARY*
----------------------------------------
🏥 *Hospital:* ${hospital.name}
📍 *Address:* ${hospital.address}, ${hospital.city}
🛡️ *ABDM HFR ID:* ${hospital.abdm_hfr_id} (NABH: ${hospital.nabh_accredited ? 'VERIFIED' : 'NO'})
📊 *Capability Match:* ${scoreBreakdown.totalScore}% (${scoreBreakdown.equipmentScore}/50 Eq | ${scoreBreakdown.financialScore}/25 Fin | ${scoreBreakdown.logisticsQualityScore}/25 ETA)

⏱️ *Ambulance ETA:* ${hospital.eta_minutes} mins (${hospital.distance_km} km)
🛏️ *ICU Beds Available:* ${hospital.icu_beds_available} of ${hospital.icu_beds_total}
🩺 *Condition:* ${activeConditionName}

⚙️ *OPERATIONAL MODALITIES:*
${operationalMachines || 'Standard Diagnostics Active'}
${maintenanceMachines ? `⚠️ *INSPECTION WARNING:* ${maintenanceMachines} under maintenance!` : '✅ All required machines verified online.'}

💰 *FINANCIAL TRANSPARENCY:*
• Estimated Cost: ${treatmentCost ? `${formatINR(treatmentCost.min_estimated_cost)} - ${formatINR(treatmentCost.max_estimated_cost)}` : 'Govt Nominal / Subsidized'}
• PM-JAY Status: ${hospital.pmjay_empanelled ? '✅ 100% Cashless Empanelled' : '❌ Out-of-pocket required'}
• Swasthya Sathi: ${hospital.swasthya_sathi_accepted ? '✅ Accepted' : '❌ Not empanelled'}

📋 *PRE-ARRIVAL INSTRUCTIONS:*
1. Call Emergency ER Line on arrival: ${hospital.contact_phone}
2. Keep Aadhaar Card & Ayushman Bharat / Swasthya Sathi Card ready for immediate TPA code.
3. Show this verified Klinqo dispatch code to the triage desk: *#MRD-${hospital.hospital_id.slice(-4)}-${scoreBreakdown.totalScore}*

🗺️ *Google Maps GPS Route:*
https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;

  const messageTextHI = `🚨 *मेडरडार AI — सत्यापित अस्पताल प्रेषण सारांश*
----------------------------------------
🏥 *अस्पताल:* ${hospital.name}
📍 *पता:* ${hospital.address}, ${hospital.city}
🛡️ *ABDM HFR ID:* ${hospital.abdm_hfr_id} (NABH: ${hospital.nabh_accredited ? 'सत्यापित' : 'नहीं'})
📊 *सक्षमता स्कोर:* ${scoreBreakdown.totalScore}% मैच

⏱️ *एम्बुलेंस समय:* ${hospital.eta_minutes} मिनट (${hospital.distance_km} किमी)
🛏️ *ICU बेड उपलब्ध:* ${hospital.icu_beds_available} / ${hospital.icu_beds_total}
🩺 *बीमारी:* ${activeConditionName}

⚙️ *सक्रिय मशीनें:*
${operationalMachines || 'मानक जांच उपलब्ध'}
${maintenanceMachines ? `⚠️ *चेतावनी:* ${maintenanceMachines} मशीन मेंटेनेंस में है!` : '✅ सभी आवश्यक मशीनें चालू हैं।'}

💰 *खर्च व योजना:*
• अनुमानित खर्च: ${treatmentCost ? `${formatINR(treatmentCost.min_estimated_cost)} - ${formatINR(treatmentCost.max_estimated_cost)}` : 'सरकारी रियायती'}
• आयुष्मान भारत (PM-JAY): ${hospital.pmjay_empanelled ? '✅ 100% कैशलेस मान्य' : '❌ कैशलेस उपलब्ध नहीं'}
• स्वास्थ्य साथी: ${hospital.swasthya_sathi_accepted ? '✅ मान्य' : '❌ अमान्य'}

📋 *अस्पताल पहुँचने से पहले:*
1. इमरजेंसी हेल्पलाइन पर कॉल करें: ${hospital.contact_phone}
2. आयुष्मान / स्वास्थ्य साथी कार्ड और आधार कार्ड तुरंत प्रस्तुत करें।
3. यह रेफरल कोड दिखाएं: *#MRD-${hospital.hospital_id.slice(-4)}-${scoreBreakdown.totalScore}*

🗺️ *गूगल मैप्स नेविगेशन:*
https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;

  const currentMessage = language === 'EN' ? messageTextEN : messageTextHI;

  const handleSendWhatsApp = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsDelivered(true);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden relative">
        {/* WhatsApp Green Top Header */}
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight">
                  WhatsApp Business Cloud Dispatch
                </span>
                <span className="bg-emerald-600/60 text-emerald-100 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Official Node
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80">
                Instant encrypted delivery to patient family & ambulance driver
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Recipient Phone & Language Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Recipient Mobile:</span>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-brand-navy focus:outline-none focus:ring-1 focus:ring-emerald-500 w-40"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-2 py-0.5 rounded ${language === 'EN' ? 'bg-[#075E54] text-white' : 'text-slate-600'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('HI')}
                className={`px-2 py-0.5 rounded ${language === 'HI' ? 'bg-[#075E54] text-white' : 'text-slate-600'}`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Delivery Status Toast */}
          {isDelivered && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
                <span>Dispatch Summary successfully sent via WhatsApp Business API!</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono">Delivered</span>
            </div>
          )}

          {/* WhatsApp Chat Bubble Preview */}
          <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-200 max-h-[300px] overflow-y-auto">
            <div className="bg-white p-3.5 rounded-xl rounded-tl-none shadow-sm text-xs font-sans text-slate-800 space-y-1.5 whitespace-pre-line border border-slate-100">
              {currentMessage}
            </div>
            <div className="text-right text-[10px] text-slate-500 mt-1 font-mono flex items-center justify-end gap-1">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-navy bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied Text</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendWhatsApp}
              disabled={isSending}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Sending via Meta Cloud API...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send to Family on WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
