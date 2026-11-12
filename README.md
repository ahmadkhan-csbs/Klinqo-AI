<div align="center">

# 🏥 Klinqo AI 
### **India's First Capability & Infrastructure-Centric Healthcare Dispatch Engine**
#### *Right Hospital. Right Machine. Right Cost — Before You Leave Home.*

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini Flash](https://img.shields.io/badge/Google_Gemini-1.5_Flash_Vision-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Bhashini ULCA](https://img.shields.io/badge/Bhashini_ULCA-Govt_of_India-FF9933?style=for-the-badge)](https://bhashini.gov.in/)
[![ABDM HFR Aligned](https://img.shields.io/badge/ABDM-National_Health_Registry-008080?style=for-the-badge)](https://abdm.gov.in/)
[![DPDP Act 2023](https://img.shields.io/badge/Compliance-DPDP_Act_2023-7B1FA2?style=for-the-badge)](#-data-privacy--dpdp-act-2023-compliance)

---

**[🌐 Live Demo on Vercel](https://github.com/ahmadkhan-csbs/Klinqo-AI)** • **[📑 API Documentation](#-full-stack-api-architecture)** • **[🏛️ Kolkata Health Grid](#-kolkata-hyperlocal-healthcare-infrastructure)** • **[🚀 Quickstart](#-getting-started--local-development)**

---

</div>

## 📌 Executive Summary & The Problem (Asli Dikkhat)

In India, when a family member suffers an acute or life-threatening medical emergency (e.g., **STEMI Heart Attack, Acute Brain Stroke, Trauma, or Oncology Cancer Crisis**), families face a catastrophic blindspot:

1. **The Equipment Void**: Families rush in a panic to the nearest hospital or nursing home, only to learn after 90 crucial minutes that the **Cath Lab, 3T MRI, or Linear Accelerator (LINAC) is broken down, under maintenance, or completely missing**.
2. **The Golden Hour Tragedy**: Secondary inter-hospital ambulance transfers during emergency windows cause irreversible organ failure, brain necrosis, or preventable mortality.
3. **Financial Ambush & Lack of Scheme Empanelment**: Patients are slapped with non-refundable admission deposits of ₹25,000–₹80,000 in facilities that don't accept **Ayushman Bharat (PM-JAY)** or **Swasthya Sathi**, forcing families into medical bankruptcy.

> **Klinqo AI changes this paradigm.** Instead of ranking hospitals by sponsored marketing or star reviews, Klinqo AI runs an **Infrastructure-First Triage Engine** that checks real-time machine telemetry, bed status, scheme empanelment, and ambulance duration in traffic **before** the patient steps out of their door.

---

## 🌟 Core System Capabilities

```
                                      KLINQO AI DISPATCH PIPELINE
                                      
  [ Patient Report / Prescription ]       [ Vernacular Voice Note ]         [ Live Area / Pin Code ]
  (PDF / Biopsy / DICOM / Image)         (Hindi / Bengali / Hinglish)       (18 Kolkata Pin Codes)
                 │                                    │                               │
                 ▼                                    ▼                               ▼
       ┌───────────────────┐               ┌───────────────────┐           ┌───────────────────┐
       │   DPDP Act 2023   │               │   Bhashini ULCA   │           │ Dynamic Routing   │
       │ Client PII Masker │               │  Inference & NMT  │           │ Google / Mappls   │
       └─────────┬─────────┘               └─────────┬─────────┘           └─────────┬─────────┘
                 │                                   │                               │
                 ▼                                   ▼                               │
       ┌────────────────────────────────────────────────────────┐                    │
       │       Google Gemini 1.5 Flash Multimodal OCR          │                    │
       │      ICD-11 Ontology + Mandatory Equipment RAG        │                    │
       └───────────────────────────┬────────────────────────────┘                    │
                                   │                                                 │
                                   ▼                                                 │
                 ┌──────────────────────────────────────────────────┐                │
                 │     50-25-25 Capability-Centric Match Scoring    │◄───────────────┘
                 │  50% Equipment | 25% ETA Traffic | 25% Financial  │
                 └─────────────────────────┬────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
           [ Equipped Hospital Finder ]          [ Real PDF Referral Dossier ]
           • Live Machine Audits                 • Token #KL-2026-XXXX
           • 3-Tier CGHS / PM-JAY Tariffs        • 7-Point Pre-Arrival Kit
           • Green Corridor Dispatch             • Reception Fast-Track Pass
```

---

## 🚀 Key Feature Breakdown

### 1. 🤖 Live Multimodal AI Clinical Triage Studio (`/api/triage`)
- **Google Gemini 1.5 Flash Vision OCR**: Directly ingests diagnostic reports (PDF, PNG, JPEG) such as lung biopsies, CT pulmonary angiograms, 12-lead ECGs, and renal panels.
- **DPDP Act 2023 Edge Redaction**: Automatically identifies and scrubs patient names, 10-digit mobile numbers, and 12-digit Aadhaar credentials before transmitting data to the LLM.
- **Structured ICD-11 Extraction**: Maps clinical conditions to standard ICD-11 codes (`2C25` Lung NSCLC, `2C77` Cervix Carcinoma, `BA41` Acute STEMI, `GB61` End-stage Renal Failure) and identifies required tertiary machines.

### 2. 🎙️ Vernacular Voice Recognition (Bhashini ULCA & Whisper) (`/api/voice`)
- **Direct Microphone Speech Capture**: Leverages the browser's native `SpeechRecognition` API.
- **Govt. of India Bhashini ULCA (Dhruva) Pipeline**: Ingests vernacular audio complaints in Hindi, Hinglish, and Bengali (*"Mere papa ko saans lene mein takleef hai aur doctor ne biopsy ke baad radiation boli hai"*, *"Amar mar buk e byatha"*).
- **Clinical Semantic Translation**: Converts regional phrases into high-precision clinical queries for immediate hospital capability ranking.

### 3. 🗺️ Dynamic Traffic Routing API (Google Routes / Mappls) (`/api/routing`)
- **Dynamic Duration in Traffic**: Calculates realistic road travel times across Kolkata's 18 PIN codes using Google Distance Matrix API and Mappls (MapmyIndia).
- **Calibrated Rush-Hour Traffic Matrix**: Employs an emergency dispatch coefficient:
  $$\text{Ambulance ETA (Mins)} = \max(5, \text{round}(\text{Distance (km)} \times 2.3 + 4))$$
- **Green Ambulance Corridor Simulator**: Real-time traffic signal preemption preview, saving up to 18 critical minutes during STEMI and stroke Golden Hours.

### 4. 🖨️ Real PDF Triage Dossier & Verified Referral Slip Generator
- **Zero-Dependency Vector PDF Engine**: Produces an authentic ISO-32000 compliant PDF document with vector formatting, headers, tables, and triage passes.
- **Triage Slip Contents**:
  - Official Verified Referral Token (e.g., `KL-2026-8819-TRIAGE`).
  - Target Tertiary Hospital details, emergency desk phone numbers, and National Health Facility Registry (HFR ID).
  - Condition Urgency Tier (`GOLDEN_HOUR` / `URGENT_48H`) and required machines.
  - Mandatory **7-Point Pre-Arrival Family Checklist** (Original Aadhaar, PM-JAY/Swasthya Sathi card, biopsy slides, recent radiology scans).

### 5. 🏥 50-25-25 Capability-Centric Matching Algorithm
Unlike traditional healthcare aggregators that prioritize paid listings or star ratings, Klinqo AI determines hospital suitability using an objective mathematical score:
$$\text{Total Match Score} = (0.50 \times \text{Equipment Match}) + (0.25 \times \text{Ambulance ETA}) + (0.25 \times \text{Financial Scheme Match})$$
- **50% Equipment Operationality**: Verifies whether mandatory machines (e.g., LINAC, 3T MRI, Cath Lab) are active without downtime.
- **25% Golden Hour ETA**: Measures travel distance and traffic latency.
- **25% Scheme & Budget Match**: Validates whether the facility accepts **Ayushman Bharat PM-JAY** or **Swasthya Sathi** for 100% cashless treatment.

### 6. 💰 3-Tier CGHS & PM-JAY HBP 2.2 Cost Transparency Engine
Provides accurate, upfront procedure estimates with transparent price ranges:
- **Tier 1 (Government Apex & Teaching Hospitals)**: ₹0 (100% statutory free treatment under West Bengal Govt & Swasthya Sathi).
- **Tier 2 (NABH Charitable Trust & Subsidized Centers)**: Base CGHS rate × 1.2x – 1.8x.
- **Tier 3 (Corporate Super-Specialty Hospitals)**: Base CGHS rate × 2.8x – 4.5x with room category modifiers (General Ward, Semi-Private, Single Deluxe).

### 7. 📱 Omnichannel WhatsApp Cloud Bot Simulator
- Floating bottom-right WhatsApp Web simulator for rural and tier-2/3 families.
- Provides 1-click presets for **Voice Note Triage**, **Biopsy Document Upload**, and **Live GPS Sharing**.

### 8. 🚨 B2B Hospital Admin Portal & SOS Emergency Mode
- **Live Telemetry Mutation**: Hospital administrators can toggle machine states (`OPERATIONAL` 🟢, `MAINTENANCE` 🟡, `UNAVAILABLE` 🔴).
- **Immediate Reactive Recalculation**: Putting a mandatory machine in maintenance immediately drops the hospital's match score across all search results and displays an amber reroute alert.

---

## 🏛️ Kolkata Hyperlocal Healthcare Infrastructure

Klinqo AI incorporates a verified database of Kolkata's apex healthcare institutions mapped across the official **5 KMC Administrative Zones (144 Wards, 16 Boroughs, 140+ UPHCs)**:

| Hospital Name | Established | Type | Mandatory Modalities Present | Scheme Acceptance |
|---|:---:|---|---|:---:|
| **Medical College Kolkata (MCH)** | 1835 | Govt Apex Medical College | Cath Lab, LINAC, 3T MRI, 24x7 Trauma ICU | 100% Free / Swasthya Sathi |
| **IPGMER & SSKM Hospital** | 1707 | Govt Apex Super-Specialty | 24x7 Cath Lab, LINAC, 3T MRI, CRRT, Level-1 Trauma | 100% Free / PM-JAY |
| **R.G. Kar Medical College** | 1916 | Govt Medical College | Cath Lab, CT Scan, Dialysis, 24x7 Emergency | 100% Free / Swasthya Sathi |
| **N.R.S. Medical College** | 1873 | Govt Medical College | Interventional Cardiology, Dialysis, NICU | 100% Free / Swasthya Sathi |
| **Chittaranjan National Cancer Institute (CNCI)** | 1950 | Apex Govt Cancer Center | Elekta LINAC, PET-CT, Brachytherapy, Surgical Oncology | PM-JAY / Swasthya Sathi |
| **Tata Medical Center, Rajarhat** | 2011 | Comprehensive Cancer Trust | TrueBeam LINAC, PET-CT, Bone Marrow Transplant | Trust Tariffs / Subsidized |
| **Apollo Multispeciality Hospital** | 2003 | Corporate Super-Specialty | Novalis Tx LINAC, PET-CT, Biplane Cath Lab, 3T MRI | Cashless TPA / Private |
| **Fortis Hospital, Anandapur** | 2011 | Corporate Super-Specialty | Advanced Cath Lab, ECMO, High-End Critical ICU | Cashless TPA / Private |
| **RN Tagore (Narayana Health)** | 2000 | Corporate Cardiac & Multispecialty | 3 Cath Labs, Heart Transplant, ECMO, Dialysis | PM-JAY / Swasthya Sathi / TPA |
| **Saroj Gupta Cancer Centre (SGCCRI)** | 1973 | Non-Profit Cancer Trust | Cobalt-60, LINAC, Brachytherapy, Pediatric Oncology | Charitable / Subsidized |

---

## 🔌 Full-Stack API Architecture

Klinqo AI functions as a modern, self-contained full-stack application with zero requirement for an external Python server.

### 1. `POST /api/triage`
Processes multimodal diagnostic reports and vernacular transcripts.
```bash
curl -X POST http://localhost:3000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "reportText": "CT Chest: 4.8 cm mass in RUL with subcarinal nodes. Biopsy confirms NSCLC Adenocarcinoma.",
    "maskPii": true
  }'
```
**Response:**
```json
{
  "success": true,
  "detected_condition": "Non-Small Cell Lung Carcinoma (NSCLC Stage IIA/IIB)",
  "icd_11_code": "2C25",
  "urgency": "HIGH_PRIORITY_48H",
  "required_treatment_infra": ["LINAC_RADIATION", "PET_CT", "BIOPSY_HISTOPATH"],
  "required_specialists": ["Thoracic Surgical Oncologist", "Radiation Oncologist"],
  "confidence_score": 0.98,
  "engine": "GEMINI_FLASH_VISION_DPDP"
}
```

### 2. `POST /api/voice`
Handles speech-to-text and vernacular medical translation via Bhashini ULCA.
```bash
curl -X POST http://localhost:3000/api/voice \
  -H "Content-Type: application/json" \
  -d '{
    "transcriptionText": "Mere papa ko chhati mein tej dard hai aur paseena aa raha hai",
    "language": "hi"
  }'
```

### 3. `POST /api/routing`
Calculates dynamic duration in traffic across destination hospitals.
```bash
curl -X POST http://localhost:3000/api/routing \
  -H "Content-Type: application/json" \
  -d '{
    "origin": { "lat": 22.5726, "lng": 88.4311 },
    "destinations": [
      { "hospitalId": "HOSP_SSKM", "lat": 22.5392, "lng": 88.3432 }
    ]
  }'
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Serverless Route Handlers) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with Clinical Design System |
| **AI / Multimodal LLM** | [Google Gemini 1.5 Flash Vision](https://ai.google.dev/) (OCR & Clinical Extraction) |
| **Speech & Translation** | [Bhashini ULCA (Dhruva API)](https://bhashini.gov.in/) & Web Speech API |
| **Geospatial & Traffic** | Google Routes / Distance Matrix API + Mappls (MapmyIndia) + Vector GIS |
| **Document Generation** | Client-Side Vector PDF Engine (ISO-32000 Standard) |
| **Icons & UI Elements** | [Lucide React](https://lucide.dev/) |
| **State Management** | React Context (`KlinqoContext`) with Reactive Mutation & Telemetry Sync |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js `18.17.0` or higher
- npm, yarn, or pnpm
- Google Gemini API key (optional, deterministic clinical fallback included)

### 1. Clone the Repository
```bash
git clone https://github.com/ahmadkhan-csbs/Klinqo-AI.git
cd Klinqo-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Google Gemini Flash API Key (for Multimodal Triage OCR)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Google Maps or Mappls API Key (Vector traffic engine used as fallback)
GOOGLE_MAPS_API_KEY=
MAPPLS_API_KEY=

NEXT_PUBLIC_APP_ENV=production
```

### 4. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## ☁️ Deployment on Vercel

The application is pre-configured for 1-click deployment on [Vercel](https://vercel.com/):

1. Push your code to your GitHub repository.
2. Go to **Vercel Dashboard** $\rightarrow$ **Add New Project** $\rightarrow$ Import `ahmadkhan-csbs/Klinqo-AI`.
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Key)*
4. Click **Deploy**. Vercel will automatically build the Next.js static pages and provision the serverless API routes (`/api/triage`, `/api/voice`, `/api/routing`).

---

## 🔒 Data Privacy & DPDP Act 2023 Compliance

Klinqo AI strictly adheres to India's **Digital Personal Data Protection (DPDP) Act, 2023**:
- **Zero Raw PII Storage**: Patient Aadhaar numbers, phone numbers, and names are scrubbed client-side before report strings are dispatched to inference pipelines.
- **Ephemerality**: Medical report files are processed in-memory and are never written to permanent disk storage.
- **Clinical Decision Support Notice**: Klinqo AI provides algorithmic infrastructure discovery and triage coordination; it does not replace certified physician orders.

---

## 📄 License & Attribution

This project is licensed under the **MIT License**.

- **Datasets & Schemas**: Aligned with the **National Health Authority (NHA)** Ayushman Bharat Digital Mission (ABDM) Health Facility Registry standards.
- **Tariff Baselines**: Derived from official **CGHS 2023** and **PM-JAY Health Benefit Package (HBP 2.2)** public rate disclosures.

---

<div align="center">

**Built with ❤️ for Indian Healthcare Access & Golden Hour Survival**

*Transforming Emergency Healthcare Dispatch across India.*

</div>
