'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useKlinqo } from '@/context/KlinqoContext';
import { formatINR } from '@/utils/scoringEngine';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  Camera,
  MapPin,
  CheckCheck,
  Building2,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  voiceDuration?: string;
  hasMedia?: boolean;
  mediaType?: 'pdf' | 'photo' | 'location';
  hospitals?: {
    name: string;
    score: number;
    eta: number;
    costRange: string;
    schemes: string[];
    machineStatus: string;
  }[];
}

export const WhatsAppBotSimulator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { rankedHospitals, activeCondition, triageState, setActiveTab } = useKlinqo();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: '🙏 *Namaste! Welcome to Klinqo (ArogyaPath AI) WhatsApp Assistant.*\n\nMain aapki bhasha (Hindi, Hinglish, Bengali, English) mein right hospital aur operational machine dhundhne mein madad kar sakta hoon.\n\nAap niche diye gaye quick options chun sakte hain ya direct message/voice note bhej sakte hain.',
      timestamp: '12:00 PM',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const topHospitals = rankedHospitals.slice(0, 3).map((rh) => ({
    name: rh.hospital.name,
    score: rh.scoreBreakdown.totalScore,
    eta: rh.hospital.eta_minutes,
    costRange: rh.treatmentCost
      ? `${formatINR(rh.treatmentCost.min_estimated_cost)} - ${formatINR(
          rh.treatmentCost.max_estimated_cost
        )}`
      : '₹35,000 - ₹1,80,000',
    schemes: [
      ...(rh.hospital.pmjay_empanelled ? ['PM-JAY Free'] : []),
      ...(rh.hospital.swasthya_sathi_accepted ? ['Swasthya Sathi'] : []),
    ],
    machineStatus:
      rh.scoreBreakdown.maintenanceEquipment.length > 0
        ? '⚠️ 1 Machine in Maintenance'
        : '🟢 100% Machines Operational',
  }));

  const simulateBotResponse = (userPromptText: string, delayMs = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      let botReply = '';
      let hospitalsData: ChatMessage['hospitals'] = undefined;

      const lower = userPromptText.toLowerCase();

      if (lower.includes('radiation') || lower.includes('cancer') || lower.includes('biopsy')) {
        botReply = `🎯 *AI Report Triage Complete (DPDP Privacy Redacted)*\n\n📌 *Diagnosis Detected:* Cervical / Lung Carcinoma\n⚙️ *Mandatory Equipment:* Linear Accelerator (LINAC) + PET-CT Scan\n\nAapke najdeek ke Top 3 Equipped Hospitals jahan machines active hain:`;
        hospitalsData = topHospitals;
      } else if (lower.includes('heart') || lower.includes('stemi') || lower.includes('attack') || lower.includes('chest')) {
        botReply = `🚨 *EMERGENCY GOLDEN HOUR ALERT: STEMI Protocol Activated*\n\n📌 *Door-to-balloon Window:* < 90 mins\n⚙️ *Required:* 24x7 Cath Lab + On-duty Interventional Cardiologist\n\nNearest Operational Cath Labs:`;
        hospitalsData = topHospitals;
      } else if (lower.includes('location') || lower.includes('gps')) {
        botReply = `📍 *Location Received: Salt Lake, Sector V, Kolkata*\n\nScanning 15 hospitals within 30 km radius on ABDM HFR grid... Yahan sabse tez ambulance ETA aur verified equipment wale hospitals hain:`;
        hospitalsData = topHospitals;
      } else {
        botReply = `✅ Aapka message mil gaya hai. Klinqo AI grid scan kar raha hai...\n\nAapke region (${triageState.selectedCity}) mein top capability-verified facilities:`;
        hospitalsData = topHospitals;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hospitals: hospitalsData,
        },
      ]);
      setIsTyping(false);
    }, delayMs);
  };

  const handleSendMessage = (textToSend?: string, isVoice = false, voiceText = '') => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: isVoice ? voiceText : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice,
      voiceDuration: isVoice ? '0:07' : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    simulateBotResponse(text);
  };

  const handlePresetVoicePrompt = () => {
    handleSendMessage(
      'Mere papa ko saans lene mein takleef hai aur doctor ne biopsy ke baad PET-CT aur radiation therapy boli hai',
      true,
      '🎤 Voice Note (Hindi): "Mere papa ko saans lene mein takleef hai aur doctor ne biopsy ke baad PET-CT aur radiation boli hai..."'
    );
  };

  const handlePresetBiopsyPhoto = () => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: '📄 [Image Attached]: histopath_biopsy_cervix_stage2b.pdf (DPDP Redacted)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasMedia: true,
      mediaType: 'photo',
    };
    setMessages((prev) => [...prev, newMsg]);
    simulateBotResponse('biopsy radiation cancer');
  };

  const handlePresetLocation = () => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: '📍 [Live Location Shared]: 22.5726° N, 88.4311° E (Sector V, Salt Lake, Kolkata)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasMedia: true,
      mediaType: 'location',
    };
    setMessages((prev) => [...prev, newMsg]);
    simulateBotResponse('location gps');
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON IN BOTTOM RIGHT */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pointer-events-auto">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-clinical-md border border-slate-200 hover:border-emerald-300 transition-all text-xs font-bold text-slate-800 hover:text-emerald-700"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>WhatsApp Hindi / Voice Bot</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-xl transition-transform transform hover:scale-105 active:scale-95 border-2 border-white focus:outline-hidden"
          title="Open WhatsApp Triage Bot Simulator"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 fill-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* WHATSAPP CHAT WINDOW SIMULATOR */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[410px] bg-[#EFEAE2] rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col h-[580px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white p-3.5 px-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-base border border-white/40">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075E54]"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm tracking-tight">Klinqo AI Official</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span>Verified Bhashini Bot</span> • <span>online</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Privacy Banner */}
          <div className="bg-[#128C7E] text-white/90 text-[10px] py-1 px-3 text-center font-mono">
            🔒 DPDP Act 2023 End-to-End Encrypted • ABDM Telemetry Live
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[radial-gradient(#d4cdbe_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-xs relative ${
                      isUser
                        ? 'bg-[#E7FFDB] text-slate-900 rounded-tr-none'
                        : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                    }`}
                  >
                    {/* Media attachments */}
                    {msg.isVoice && (
                      <div className="flex items-center gap-2 mb-1.5 p-1.5 rounded-lg bg-emerald-100/70 border border-emerald-200">
                        <Mic className="w-4 h-4 text-emerald-700 animate-pulse" />
                        <span className="font-mono text-[10px] font-bold text-emerald-900">
                          Voice Note ({msg.voiceDuration})
                        </span>
                      </div>
                    )}

                    {/* Message Text */}
                    <div className="whitespace-pre-line leading-relaxed font-sans">
                      {msg.text}
                    </div>

                    {/* Hospital Cards if present */}
                    {msg.hospitals && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-200">
                        {msg.hospitals.map((h, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-brand-navy text-[11px] truncate max-w-[190px]">
                                {i + 1}. {h.name}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {h.score}% Match
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-600 flex items-center justify-between font-mono">
                              <span>⏱️ ETA: {h.eta} mins</span>
                              <span>💰 {h.costRange}</span>
                            </div>

                            <div className="text-[10px] font-semibold text-emerald-700">
                              {h.machineStatus}
                            </div>

                            {h.schemes.length > 0 && (
                              <div className="text-[9px] text-slate-500 font-mono">
                                ✓ Cashless: {h.schemes.join(' • ')}
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            setActiveTab('finder');
                            setIsOpen(false);
                          }}
                          className="w-full mt-2 py-1.5 bg-clinical-teal hover:bg-clinical-dark text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Open Full Web Discovery Grid</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Timestamp & double tick */}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1 font-mono">
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck className="w-3 h-3 text-sky-500" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl rounded-tl-none w-fit border border-slate-200 shadow-xs text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] ml-1 font-mono">Klinqo is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Demo Action Chips */}
          <div className="bg-slate-100 p-2 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 text-[10px] whitespace-nowrap">
            <button
              onClick={handlePresetVoicePrompt}
              className="bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs transition-colors shrink-0"
            >
              <Mic className="w-3 h-3 text-emerald-600" />
              <span>🎤 Hindi Voice (Cancer)</span>
            </button>

            <button
              onClick={handlePresetBiopsyPhoto}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs transition-colors shrink-0"
            >
              <Camera className="w-3 h-3 text-slate-600" />
              <span>📄 Send Biopsy PDF</span>
            </button>

            <button
              onClick={handlePresetLocation}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs transition-colors shrink-0"
            >
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>📍 Share GPS</span>
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="bg-white p-2.5 flex items-center gap-2 border-t border-slate-200"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message in Hindi or English..."
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full bg-[#128C7E] disabled:opacity-40 text-white flex items-center justify-center transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
