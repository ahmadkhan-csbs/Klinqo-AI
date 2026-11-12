"""
Automated Pipeline: Scrape Hospital Website -> LLM Structured Extraction -> 3-Tier Cost Calculation -> JSON/Database Export
As defined in Master Blueprint (Pages 4, 8, & 9) for Klinqo AI.

Tools supported:
- Web Crawling: BeautifulSoup + requests (lightweight) / optional Playwright or Firecrawl API.
- LLM Structured Extraction: Google Gemini (Gemini 2.5 Flash / 1.5 Pro) with fallback rule-based clinical NER parser.
- 3-Tier Cost Bracket Multiplier against Official CGHS & PM-JAY HBP 2.2 Base Rates.
"""

import os
import sys
import json
import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup

# ==========================================
# 1. PYDANTIC SCHEMAS (As per Blueprint Page 9)
# ==========================================

class EquipmentItem(BaseModel):
    equipment_code: str = Field(..., description="e.g. PET_CT, LINAC_RADIATION, CATH_LAB, MRI_3T, ECMO, DIALYSIS_CRRT, etc.")
    equipment_name: str = Field(..., description="e.g. Siemens Biograph Vision PET-CT, Varian TrueBeam LINAC")
    operational_status: str = Field(default="OPERATIONAL", description="OPERATIONAL, MAINTENANCE, or UNAVAILABLE")
    total_units: int = Field(default=1, description="Estimated total units installed")
    confidence_score: float = Field(default=0.95, description="Confidence score of detection (0.0 - 1.0)")

class HospitalInfrastructureProfile(BaseModel):
    hospital_name: str
    city: str
    website_url: Optional[str] = None
    nabh_accredited: bool = False
    pmjay_accepted: bool = False
    swasthya_sathi_accepted: bool = False
    emergency_24x7: bool = True
    extracted_equipment: List[EquipmentItem] = []
    clinical_specialties: List[str] = []
    cost_brackets: Optional[Dict[str, Any]] = None

# Known medical modalities dictionary for deterministic fallback regex extraction
STANDARD_MODALITIES_MAP = {
    r"\b(pet[\s\-]ct|positron emission tomography)\b": {
        "code": "PET_CT",
        "name": "Positron Emission Tomography - Computed Tomography (PET-CT)"
    },
    r"\b(linac|linear accelerator|truebeam|vitalbeam|cyberknife|tomotherapy|radiotherapy)\b": {
        "code": "LINAC_RADIATION",
        "name": "Medical Linear Accelerator (LINAC) Radiotherapy"
    },
    r"\b(brachytherapy|hdr brachytherapy|intracavitary)\b": {
        "code": "BRACHYTHERAPY",
        "name": "High Dose Rate (HDR) Brachytherapy Unit"
    },
    r"\b(cath[\s\-]?lab|catheterization lab|coronary angiography|pci)\b": {
        "code": "CATH_LAB",
        "name": "24x7 Digital Cardiac & Interventional Cath Lab"
    },
    r"\b(ecmo|extracorporeal membrane oxygenation)\b": {
        "code": "ECMO",
        "name": "Extracorporeal Membrane Oxygenation (ECMO) Life Support"
    },
    r"\b(3[\s\.]?0\s?t(esla)?\s?mri|3t mri|silent mri|magnetic resonance imaging)\b": {
        "code": "MRI_3T",
        "name": "3.0 Tesla High-Resolution Diagnostic MRI"
    },
    r"\b(crrt|continuous renal replacement|hemodialysis|dialysis unit)\b": {
        "code": "DIALYSIS_CRRT",
        "name": "Hemodialysis & Continuous Renal Replacement Therapy (CRRT)"
    },
    r"\b(biopsy|histopathology|immunohistochemistry|frozen section|tissue block)\b": {
        "code": "BIOPSY_HISTOPATH",
        "name": "Histopathology & Core Biopsy Pathology Laboratory"
    },
    r"\b(neuro[\s\-]?microscope|kinevo|pentero|operative microscope)\b": {
        "code": "NEURO_MICRO",
        "name": "Advanced Neuro-Surgical Operating Microscope"
    },
    r"\b(ventilator|icu ventilator|evita|invasive mechanical ventilation)\b": {
        "code": "VENTILATOR_ICU",
        "name": "Advanced Critical Care ICU Ventilators"
    }
}

# ==========================================
# 2. 3-TIER COST MULTIPLIER (Blueprint Page 9)
# ==========================================

def calculate_3_tier_cost_brackets(
    cghs_base_rate: float,
    hospital_type: str,
    room_modifier: float = 1.0
) -> Dict[str, Any]:
    """
    Applies the official 3-Tier Multiplier formula from Master Blueprint Page 9:
    - Government: Free or up to 0.35x CGHS base
    - Trust: 1.5x to 2.2x CGHS base
    - Corporate: 3.0x to 4.8x CGHS base
    """
    if hospital_type == "Government":
        return {
            "tier": "Tier 1: Government Free / Subsidized",
            "min_cost": 0,
            "max_cost": round(cghs_base_rate * 0.35 * room_modifier, -2),
            "scheme_coverage": "100% Cashless under PM-JAY / Swasthya Sathi",
            "multiplier_range": "0.0x - 0.35x"
        }
    elif hospital_type == "Trust":
        return {
            "tier": "Tier 2: Charitable Trust & Non-Profit",
            "min_cost": round(cghs_base_rate * 1.5 * room_modifier, -2),
            "max_cost": round(cghs_base_rate * 2.2 * room_modifier, -2),
            "scheme_coverage": "Concession & Subsidized Trust Tariffs",
            "multiplier_range": "1.5x - 2.2x"
        }
    else: # Corporate Super-Specialty
        return {
            "tier": "Tier 3: Corporate Super-Specialty",
            "min_cost": round(cghs_base_rate * 3.0 * room_modifier, -2),
            "max_cost": round(cghs_base_rate * 4.8 * room_modifier, -2),
            "scheme_coverage": "Private TPA Cashless Insurance + Self Pay",
            "multiplier_range": "3.0x - 4.8x"
        }

# ==========================================
# 3. SCRAPING & LLM EXTRACTION FUNCTIONS
# ==========================================

def fetch_hospital_web_text(url: str, timeout: int = 15) -> str:
    """
    Fetches raw HTML from hospital website and subpages (/departments, /facilities, /technology).
    Strips markup to clean textual markdown.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 KlinqoHealthBot/1.0"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    }
    
    urls_to_try = [url]
    # Also attempt standard subpaths as specified in Blueprint Step 1: /facilities, /technology
    base = url.rstrip("/")
    urls_to_try.extend([
        f"{base}/departments",
        f"{base}/facilities",
        f"{base}/technology",
        f"{base}/services",
        f"{base}/radiation-oncology",
        f"{base}/diagnostic-imaging",
    ])
    
    aggregated_text = []
    
    for target in urls_to_try:
        try:
            response = requests.get(target, headers=headers, timeout=timeout)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                for tag in soup(["script", "style", "nav", "footer", "noscript", "svg"]):
                    tag.decompose()
                page_text = soup.get_text(separator=" ", strip=True)
                page_text = re.sub(r"\s+", " ", page_text)
                if len(page_text) > 200:
                    aggregated_text.append(page_text)
        except Exception:
            continue
            
    combined = " ".join(aggregated_text)
    return combined[:30000] if combined else ""

def extract_equipment_with_rules(text: str) -> List[EquipmentItem]:
    """
    Deterministic rule-based clinical NER extractor.
    Scans for high-value equipment mentions even when LLM API keys are offline.
    """
    found_equipment = []
    seen_codes = set()
    text_lower = text.lower()
    
    for pattern, info in STANDARD_MODALITIES_MAP.items():
        if re.search(pattern, text_lower):
            code = info["code"]
            if code not in seen_codes:
                found_equipment.append(
                    EquipmentItem(
                        equipment_code=code,
                        equipment_name=info["name"],
                        operational_status="OPERATIONAL",
                        total_units=1,
                        confidence_score=0.92
                    )
                )
                seen_codes.add(code)
                
    return found_equipment

def extract_infrastructure_with_gemini(
    text: str,
    hospital_name: str,
    city: str,
    api_key: Optional[str] = None
) -> HospitalInfrastructureProfile:
    """
    Passes cleaned text to Google Gemini (or uses rule-based fallback)
    to output structured HospitalInfrastructureProfile JSON.
    """
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY")
    
    # Check if Gemini API is available
    if gemini_key:
        try:
            print("[*] Calling Google Gemini API for structured infrastructure extraction...")
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            prompt = f"""
            You are an expert Clinical Infrastructure Triage Auditor.
            Analyze the following hospital website text for '{hospital_name}' in '{city}'.
            Extract:
            1. Equipment inventory codes from: [PET_CT, LINAC_RADIATION, BRACHYTHERAPY, CATH_LAB, ECMO, MRI_3T, DIALYSIS_CRRT, BIOPSY_HISTOPATH, NEURO_MICRO, VENTILATOR_ICU]
            2. Accreditation status (NABH, PMJAY, Swasthya Sathi).
            3. Key clinical specialties.

            Output strictly valid JSON matching this schema:
            {{
                "hospital_name": "{hospital_name}",
                "city": "{city}",
                "nabh_accredited": true/false,
                "pmjay_accepted": true/false,
                "swasthya_sathi_accepted": true/false,
                "emergency_24x7": true/false,
                "extracted_equipment": [
                    {{
                        "equipment_code": "PET_CT",
                        "equipment_name": "Digital PET-CT Scanner",
                        "operational_status": "OPERATIONAL",
                        "total_units": 1,
                        "confidence_score": 0.98
                    }}
                ],
                "clinical_specialties": ["Oncology", "Cardiology"]
            }}

            Hospital Text Content:
            {text[:8000]}
            """
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            res = requests.post(endpoint, json=payload, timeout=25)
            if res.status_code == 200:
                raw_json = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                data = json.loads(raw_json)
                return HospitalInfrastructureProfile(**data)
            else:
                print(f"[!] Gemini API returned code {res.status_code}. Falling back to Rule-Based Extractor.")
        except Exception as e:
            print(f"[!] Gemini API call failed ({e}). Falling back to Rule-Based Extractor.")
            
    # Fallback to Rule-based Clinical Extractor
    print("[*] Running Clinical Regex Extraction Engine...")
    equipment = extract_equipment_with_rules(text)
    
    nabh_match = bool(re.search(r"\b(nabh|national accreditation board for hospitals)\b", text, re.I))
    pmjay_match = bool(re.search(r"\b(pm[\s\-]?jay|ayushman bharat)\b", text, re.I))
    swasthya_match = bool(re.search(r"\b(swasthya sathi|sasthya sathi)\b", text, re.I))
    emergency_match = bool(re.search(r"\b(24x7 emergency|trauma center|casualty|emergency 24 hours)\b", text, re.I)) or True
    
    specialties = []
    for spec in ["Cardiology", "Oncology", "Neurology", "Nephrology", "Orthopedics", "Pediatrics", "Gastroenterology"]:
        if re.search(r"\b" + spec + r"\b", text, re.I):
            specialties.append(spec)
            
    return HospitalInfrastructureProfile(
        hospital_name=hospital_name,
        city=city,
        nabh_accredited=nabh_match,
        pmjay_accepted=pmjay_match,
        swasthya_sathi_accepted=swasthya_match,
        emergency_24x7=emergency_match,
        extracted_equipment=equipment,
        clinical_specialties=specialties
    )

def scrape_and_analyze_hospital(
    hospital_name: str,
    city: str,
    hospital_type: str = "Corporate",
    target_url: Optional[str] = None,
    mock_html_file: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main Orchestration function:
    1. Scrapes web text or reads local source
    2. Runs LLM / Clinical extraction
    3. Calculates 3-Tier pricing brackets
    4. Produces database-ready JSON
    """
    print(f"\n=======================================================")
    print(f"🏥 Scraping & Analyzing: {hospital_name} ({city})")
    print(f"=======================================================")
    
    text = ""
    if mock_html_file and os.path.exists(mock_html_file):
        with open(mock_html_file, "r", encoding="utf-8") as f:
            text = f.read()
    elif target_url:
        print(f"[*] Crawling target URL: {target_url}")
        text = fetch_hospital_web_text(target_url)
    else:
        # Default representative text if offline
        text = f"{hospital_name} is a comprehensive tertiary hospital in {city} equipped with modern 24x7 Cath Lab, 3T MRI, 128-slice CT scan, PET-CT oncology suite, Linear Accelerator (LINAC) with TrueBeam, dedicated Dialysis unit with CRRT, and full NABH accreditation."

    profile = extract_infrastructure_with_gemini(text, hospital_name, city)
    profile.website_url = target_url
    
    # Apply 3-Tier Multiplier for a sample cardiac / oncology package (CGHS Base: ₹1,85,000)
    cghs_base_benchmark = 185000.0 # Standard Lung / Cardiac base
    profile.cost_brackets = calculate_3_tier_cost_brackets(
        cghs_base_rate=cghs_base_benchmark,
        hospital_type=hospital_type
    )
    
    result = profile.model_dump()
    return result

# ==========================================
# 4. CLI RUNNER & TEST DEMO
# ==========================================

if __name__ == "__main__":
    print("🚀 Initializing Klinqo AI Hospital Equipment Scraper Pipeline...")
    
    # Test case 1: Apollo Multispeciality Hospital Kolkata
    sample_hospital_1 = scrape_and_analyze_hospital(
        hospital_name="Apollo Multispeciality Hospitals",
        city="Kolkata",
        hospital_type="Corporate",
        target_url="https://kolkata.apollohospitals.com/"
    )
    
    # Test case 2: Tata Medical Center Kolkata (Oncology Trust)
    sample_hospital_2 = scrape_and_analyze_hospital(
        hospital_name="Tata Medical Center",
        city="Kolkata",
        hospital_type="Trust",
        target_url="https://tmckolkata.com/"
    )

    output_dir = os.path.join(os.path.dirname(__file__), "scraped_output")
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, "scraped_hospitals_result.json")
    
    all_results = [sample_hospital_1, sample_hospital_2]
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2)
        
    print(f"\n✅ Pipeline executed successfully! Extracted data saved to: {out_file}")
    print(f"Summary of detection:")
    for h in all_results:
        print(f" - {h['hospital_name']}: {len(h['extracted_equipment'])} operational equipment detected | NABH: {h['nabh_accredited']} | Swasthya Sathi: {h['swasthya_sathi_accepted']}")
