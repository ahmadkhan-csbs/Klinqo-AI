# 🏥 Klinqo AI (Formerly ArogyaPath / MedRadar)
### **India's First Capability & Infrastructure-Centric Healthcare Dispatch Engine**
> **Right Hospital. Right Machine. Right Cost — Before You Leave Home.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![ABDM HFR Aligned](https://img.shields.io/badge/ABDM-HFR%20Verified-teal)](https://abdm.gov.in/)
[![DPDP Act 2023](https://img.shields.io/badge/Compliance-DPDP%20Act%202023-blueviolet)](#-data-privacy--dpdp-act-2023-compliance)

---

## ⚡ The Healthcare Blindspot in India
In India, families facing critical medical conditions (such as **Cancer, Acute STEMI Heart Attacks, Neurotrauma, or End-Stage Renal Disease**) waste precious hours and lakhs of rupees travelling to hospitals that lack operational machines:
- **Equipment Deficits**: A patient travels 2 hours to a private nursing home only to discover its Linear Accelerator (LINAC) or Cath Lab is broken down or non-existent.
- **Lost Golden Hour**: Transfers between secondary and tertiary hospitals lead to preventable morbidity and mortality.
- **Financial Ambush**: Opaque billing, non-refundable admission deposits, and surprise non-empanelment under government schemes (**Ayushman Bharat PM-JAY / Swasthya Sathi**).

**Klinqo AI** solves this with an **Infrastructure-First Triage & Geospatial Routing Engine**.

---

## 🌟 Key Architectural Pillars

### 1. 🩻 Multimodal AI Clinical Triage Studio
- **DPDP Act 2023 Auto-Redaction**: Automatic client-side masking of patient PII (Name, Aadhaar, Phone number) prior to AI OCR and condition inference.
- **Clinical Report Parser**: Parses biopsy histopathology, 12-lead ECGs, and renal function panels with ICD-11 mapping (`2C25`, `2C77`, `BA41`, `GB61`).
- **Vernacular Voice Input**: Speech-to-text input ready for Bhashini/Whisper in Hindi, Hinglish, Bengali, and English.

### 2. 🛰️ 50-25-25 Capability-Centric Matching Algorithm
Unlike traditional aggregators that sort by reviews or marketing spend, Klinqo AI scores hospitals via a rigorous mathematical formula:
```math
\text{Total Score} = (0.50 \times \text{Equipment Match}) + (0.25 \times \text{ETA Score}) + (0.25 \times \text{Financial Match})
```
- **Equipment Match (50%)**: Mandatory and supporting modalities verified (PET-CT, LINAC, Cath Lab, 3T MRI, CRRT, ECMO, ICU Ventilators).
- **ETA & Golden Hour Score (25%)**: Dynamic distance and traffic travel time calculated via Haversine and city rush-hour coefficients.
- **Financial & Scheme Match (25%)**: Real-time evaluation against PM-JAY, Swasthya Sathi (West Bengal ₹5L Cashless), CGHS, and private insurers.

### 3. 📍 100% Hyperlocal Kolkata Metropolitan Healthcare Grid
Engineered with real GPS coordinates, Overpass API OpenStreetMap harvest, and verified ABDM HFR facilities across 6 Kolkata Zones:
1. **Salt Lake & New Town**: Tata Medical Center, CNCI New Town, Manipal Salt Lake, ILS Salt Lake, Charnock Hospital, Ohio Hospital.
2. **EM Bypass Health Corridor**: Apollo Multispeciality, Fortis Anandapur, Medica Superspecialty, RTIICS Mukundapur, Desun Hospital, Ruby General, Peerless Hospital.
3. **Central & Alipore**: IPGMER & SSKM Hospital, I-NK (Institute of Neurosciences Kolkata), BM Birla Heart Research Centre, CMRI, Woodlands, Belle Vue Clinic.
4. **North Kolkata & Dum Dum / Barasat**: Medical College Kolkata (MCH), RG Kar Medical College, NRS Medical College, ILS Dum Dum, Barasat Govt Medical College, Ghosh Medicare.
5. **South Kolkata & Behala / Garia**: Saroj Gupta Cancer Centre (Thakurpukur), KPC Medical College, MR Bangur Hospital, BP Poddar Hospital.
6. **Howrah & Kalyani**: Narayana Superspeciality Howrah, ILS Howrah, AIIMS Kalyani.

### 4. 🗺️ Geospatial Smart Rerouter & Vector Map
- **Hazard Avoidance**: Visualizes deficit nursing homes (Pin A) that waste ₹8,000–₹25,000 in duplicate admission deposits.
- **Direct Tertiary Dispatch**: Directs ambulances to verified tertiary centers (Pin B) with 100% operational equipment.
- **Budget Non-Profit Alternative**: Surfaces subsidized apex trust hospitals (Pin C) like SSKM or Saroj Gupta Cancer Centre.
- **Green Ambulance Corridor Simulator**: Real-time traffic signal preemption preview saving critical transit minutes.

### 5. 💰 3-Tier Algorithmic Cost Transparency Calculator
Calculates accurate procedure expenses using **Official PM-JAY HBP 2.2 and CGHS Rate Schedules**:
- **Tier 1 (Government / Subsidized)**: 0.15x – 0.35x baseline (often ₹0 under PM-JAY / Swasthya Sathi).
- **Tier 2 (NABH Charitable Trust)**: 0.60x – 0.85x baseline.
- **Tier 3 (Corporate SuperSpecialty)**: 1.00x – 2.10x baseline with room category modifiers (General Ward, Semi-Private, Single AC).

### 6. 📱 Omnichannel Access & B2B Telemetry
- **WhatsApp Cloud Triage Simulator**: Vernacular conversational bot for low-connectivity rural citizens.
- **B2B Hospital Telemetry Dashboard**: Enables hospital admins to toggle equipment state (`OPERATIONAL`, `MAINTENANCE`, `UNAVAILABLE`) and available ICU beds, instantly updating the global clinical grid.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript 5 (Strict Mode)](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Clinical Palette (`slate-950`, `teal-600`, `emerald-500`, `rose-600`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API (`KlinqoContext`) with reactive distance recalculation and telemetry sync.
- **Mapping**: Interactive SVG Vector GIS with coordinate transforms.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17.0 or higher
- npm or yarn or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmadkhan-csbs/Klinqo-AI.git
   cd Klinqo-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Project Directory Structure

```text
Klinqo-AI/
├── src/
│   ├── app/                          # Next.js App Router (Layout & Page)
│   ├── components/                   # Core Clinical UI Modules
│   │   ├── TopEmergencyBar.tsx       # Live ABDM status & Admin switch
│   │   ├── Navbar.tsx                # Glassmorphic header & SOS trigger
│   │   ├── InteractiveHero.tsx       # Command center & locality selector
│   │   ├── AiTriageStudio.tsx        # Multimodal OCR & DPDP privacy shield
│   │   ├── HospitalDiscoveryGrid.tsx # 50-25-25 search & capability filters
│   │   ├── CostTransparencyEngine.tsx# 3-tier PM-JAY/CGHS pricing model
│   │   ├── GeospatialRerouteMap.tsx  # Vector GIS smart rerouter & checklist
│   │   ├── HospitalAdminModal.tsx    # B2B equipment telemetry control
│   │   ├── HospitalDetailModal.tsx   # Machine-level audit inspection
│   │   ├── WhatsAppBotSimulator.tsx  # WhatsApp voice/text triage widget
│   │   ├── SosGoldenHourModal.tsx    # Critical emergency dispatch modal
│   │   └── ComplianceFooter.tsx      # DPDP Act & ABDM Layer-4 data trust
│   ├── context/
│   │   └── KlinqoContext.tsx         # Central reactive state & scoring engine
│   ├── data/
│   │   ├── medicalDatabase.ts        # Comprehensive 25+ Kolkata facilities & machines
│   │   ├── kolkataLocalities.ts      # 18 Kolkata localities & pin codes
│   │   └── osm_kolkata_harvest.json  # Raw OpenStreetMap Overpass harvest
│   ├── types/
│   │   └── medical.ts                # TypeScript domain models
│   └── utils/
│       ├── scoringEngine.ts          # 50-25-25 algorithm & INR formatter
│       └── translations.ts           # Multilingual (English, Hindi, Bengali)
├── scripts/
│   └── harvest_kolkata_hospitals.mjs # OpenStreetMap Overpass Harvester
├── tailwind.config.ts                # Custom clinical theme tokens
└── tsconfig.json                     # Strict TypeScript config
```

---

## 🔒 Data Privacy & DPDP Act 2023 Compliance
Klinqo AI is built following India's **Digital Personal Data Protection (DPDP) Act 2023**:
- Zero server-side persistence of uploaded medical reports.
- Client-side regex and canvas PII masking for names, phone numbers, and Aadhaar identifiers prior to clinical triage.
- Explicit purpose-limited patient consent checkboxes before running AI inference.

---

## 👥 Contributors & Acknowledgements
- **Author**: Ahmad Khan ([@ahmadkhan-csbs](https://github.com/ahmadkhan-csbs))
- **Data Sources**: OpenStreetMap Contributors, ABDM Health Facility Registry (HFR) Guidelines, National Health Authority (NHA) PM-JAY HBP 2.2, West Bengal Health Scheme (Swasthya Sathi).

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
