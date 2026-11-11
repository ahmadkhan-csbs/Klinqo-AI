export type HospitalType =
  | 'Government'
  | 'Trust'
  | 'Corporate'
  | 'Nursing_Home'
  | 'Diagnostic_Clinic';

export type KolkataZone =
  | 'ZONE_SALT_LAKE_NEW_TOWN'
  | 'ZONE_EM_BYPASS'
  | 'ZONE_CENTRAL_ALIPORE'
  | 'ZONE_NORTH_DUMDUM_BARASAT'
  | 'ZONE_SOUTH_BEHALA_GARIA'
  | 'ZONE_HOWRAH_KALYANI';

export type TierCategory = 'Primary' | 'Secondary' | 'Tertiary_SuperSpecialty';
export type OperationalStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'UNAVAILABLE';
export type UrgencyLevel = 'GOLDEN_HOUR' | 'URGENT_48H' | 'PLANNED';

export type EquipmentCode =
  | 'PET_CT'
  | 'LINAC_RADIATION'
  | 'BRACHYTHERAPY'
  | 'CATH_LAB'
  | 'ECMO'
  | 'MRI_3T'
  | 'DIALYSIS_CRRT'
  | 'BIOPSY_HISTOPATH'
  | 'NEURO_MICRO'
  | 'VENTILATOR_ICU';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HospitalEquipment {
  id: string;
  hospital_id: string;
  equipment_code: EquipmentCode;
  equipment_name: string;
  brand_model: string;
  operational_status: OperationalStatus;
  total_units: number;
  available_units: number;
  avg_wait_time_hours: number;
  maintenance_reason?: string;
  expected_restoration?: string;
}

export interface Hospital {
  hospital_id: string;
  name: string;
  hospital_type: HospitalType;
  tier_category: TierCategory;
  address: string;
  city: string;
  pincode: string;
  zone?: KolkataZone;
  locality?: string;
  coordinates: Coordinates;
  distance_km: number;
  eta_minutes: number;
  abdm_hfr_id: string;
  nabh_accredited: boolean;
  pmjay_empanelled: boolean;
  swasthya_sathi_accepted: boolean;
  emergency_24x7: boolean;
  contact_phone: string;
  last_verified_at: string;
  // Extra clinical capacity indicators
  icu_beds_total: number;
  icu_beds_available: number;
  blood_bank_active: boolean;
  trauma_level: 'Level 1' | 'Level 2' | 'Level 3' | 'N/A';
  burn_unit: boolean;
  rating: number;
  established_year?: number;
  description?: string;
  key_specialties?: string[];
  clinical_highlights?: string;
  opd_timings?: string;
  free_statutory_care?: boolean;
}

export interface ConditionRequirement {
  condition_icd_code: string;
  condition_name: string;
  specialty_required: string;
  mandatory_equipment: EquipmentCode[];
  optional_equipment: EquipmentCode[];
  required_specialists: string[];
  urgency_level: UrgencyLevel;
  cghs_base_rate: number;
  clinical_protocol_summary: string;
  golden_hour_window_hours?: number;
}

export interface TreatmentCost {
  package_id: string;
  hospital_id: string;
  condition_icd_code: string;
  procedure_name: string;
  min_estimated_cost: number;
  max_estimated_cost: number;
  pmjay_package_rate: number;
  cashless_insurers: string[];
}

export interface UserTriageState {
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  activeConditionIcd: string;
  selectedCity: string;
  maxBudgetINR: number;
  requiredScheme: 'ANY' | 'PMJAY' | 'SWASTHYA_SATHI' | 'CGHS' | 'PRIVATE_INSURANCE';
  maxDistanceKm: number;
  selectedZone?: KolkataZone | 'ALL_ZONES';
  selectedFacilityType?: HospitalType | 'ALL_TYPES';
  selectedLocalityId?: string;
  urgencyOverride?: UrgencyLevel;
  aiTriageQuery?: string;
}

export interface CapabilityScoreBreakdown {
  equipmentScore: number;       // 50% max (0 to 50)
  financialScore: number;       // 25% max (0 to 25)
  logisticsQualityScore: number;// 25% max (0 to 25)
  totalScore: number;           // 0 to 100
  mandatoryEquipmentAvailable: number;
  mandatoryEquipmentTotal: number;
  missingEquipment: EquipmentCode[];
  maintenanceEquipment: EquipmentCode[];
  clinicalWarning?: string;
  referralRiskLevel: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL_BLOCKER';
  financialMatchVerdict: 'FULL_COVERAGE' | 'PARTIAL_GAP' | 'OUT_OF_BUDGET';
}

export interface HospitalWithScore {
  hospital: Hospital;
  equipment: HospitalEquipment[];
  treatmentCost?: TreatmentCost;
  scoreBreakdown: CapabilityScoreBreakdown;
}
