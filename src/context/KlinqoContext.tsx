'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  Hospital,
  HospitalEquipment,
  ConditionRequirement,
  TreatmentCost,
  UserTriageState,
  HospitalWithScore,
  OperationalStatus,
  EquipmentCode,
  KolkataZone,
  HospitalType,
} from '@/types/medical';
import { KOLKATA_LOCALITIES } from '@/data/kolkataLocalities';
import {
  INITIAL_HOSPITALS,
  INITIAL_EQUIPMENT,
  CONDITION_REQUIREMENTS,
  TREATMENT_COSTS,
} from '@/data/medicalDatabase';
import { calculateHospitalMatchScore } from '@/utils/scoringEngine';
import { Language, TRANSLATIONS } from '@/utils/translations';

export type NavigationTab =
  | 'ai_triage'
  | 'finder'
  | 'cost_calc'
  | 'smart_route'
  | 'verify_portal'
  | 'admin_telemetry';

interface KlinqoContextType {
  hospitals: Hospital[];
  equipment: HospitalEquipment[];
  conditionRequirements: ConditionRequirement[];
  treatmentCosts: TreatmentCost[];
  triageState: UserTriageState;
  activeCondition: ConditionRequirement | undefined;
  rankedHospitals: HospitalWithScore[];
  selectedHospitalForModal: HospitalWithScore | null;
  compareHospitals: HospitalWithScore[];
  activeTab: NavigationTab;
  isAiAnalyzing: boolean;
  aiAnalysisResult: {
    matchedConditionIcd: string;
    conditionName: string;
    detectedKeywords: string[];
    clinicalRationale: string;
    recommendedUrgency: string;
  } | null;

  // New Localization & Admin
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof TRANSLATIONS)['en'];
  isB2BAdminMode: boolean;
  toggleB2BAdminMode: () => void;

  // SOS Emergency Modal
  isSosModalOpen: boolean;
  setIsSosModalOpen: (open: boolean) => void;
  triggerSosTriage: () => void;

  // Dual-mode Search & Machine Filters
  searchMode: 'DISEASE' | 'MACHINE';
  setSearchMode: (mode: 'DISEASE' | 'MACHINE') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  executeTypoTolerantSearch: (query: string) => void;
  selectedEquipmentFilters: EquipmentCode[];
  toggleEquipmentFilter: (code: EquipmentCode) => void;
  clearEquipmentFilters: () => void;

  // Quick Filter Chips
  filterPmjayOnly: boolean;
  toggleFilterPmjay: () => void;
  filterSwasthyaSathiOnly: boolean;
  toggleFilterSwasthyaSathi: () => void;
  filterGovtTrustOnly: boolean;
  toggleFilterGovtTrust: () => void;
  filterEmergencyCathLabOnly: boolean;
  toggleFilterEmergencyCathLab: () => void;

  // Live GPS & Kolkata Zone Simulation
  isGpsSimulated: boolean;
  gpsLabel: string;
  simulateLiveGps: () => void;
  selectedZone: KolkataZone | 'ALL_ZONES';
  setSelectedZone: (zone: KolkataZone | 'ALL_ZONES') => void;
  selectedFacilityType: HospitalType | 'ALL_TYPES';
  setSelectedFacilityType: (type: HospitalType | 'ALL_TYPES') => void;
  selectedLocalityId: string;
  setSelectedLocalityId: (id: string) => void;

  // Actions
  setTriageState: React.Dispatch<React.SetStateAction<UserTriageState>>;
  setActiveConditionIcd: (icd: string) => void;
  setSelectedCity: (city: string) => void;
  setMaxBudgetINR: (budget: number) => void;
  setRequiredScheme: (scheme: UserTriageState['requiredScheme']) => void;
  setMaxDistanceKm: (km: number) => void;
  setSelectedHospitalForModal: (h: HospitalWithScore | null) => void;
  toggleCompareHospital: (h: HospitalWithScore) => void;
  clearCompareHospitals: () => void;
  setActiveTab: (tab: NavigationTab) => void;
  updateEquipmentStatus: (
    equipmentId: string,
    status: OperationalStatus,
    availableUnits?: number,
    maintenanceReason?: string,
    avgWaitTimeHours?: number
  ) => void;
  updateHospitalMetrics?: (
    hospitalId: string,
    updates: {
      icu_beds_available?: number;
      icu_beds_total?: number;
    }
  ) => void;
  toggleEquipmentStatusQuick: (equipmentId: string) => void;
  resetAllEquipmentToDefault: () => void;
  runAITriageReportAnalysis: (reportText: string) => Promise<void>;
  simulateEmergencyCodeBlue: (hospitalId: string) => void;
}

const KlinqoContext = createContext<KlinqoContextType | undefined>(undefined);

const DEFAULT_TRIAGE_STATE: UserTriageState = {
  patientAge: 58,
  patientGender: 'Female',
  activeConditionIcd: '2C77', // Carcinoma Cervix Stage IIB (shows interesting LINAC maintenance contrast between SSKM & TMC/Apollo)
  selectedCity: 'Kolkata',
  maxBudgetINR: 250000,
  requiredScheme: 'ANY',
  maxDistanceKm: 30,
  aiTriageQuery: '',
};

export const KlinqoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [equipment, setEquipment] = useState<HospitalEquipment[]>(INITIAL_EQUIPMENT);
  const [triageState, setTriageState] = useState<UserTriageState>(DEFAULT_TRIAGE_STATE);
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState<HospitalWithScore | null>(null);
  const [compareHospitals, setCompareHospitals] = useState<HospitalWithScore[]>([]);
  const [activeTab, setActiveTab] = useState<NavigationTab>('finder');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    matchedConditionIcd: string;
    conditionName: string;
    detectedKeywords: string[];
    clinicalRationale: string;
    recommendedUrgency: string;
  } | null>(null);

  // Localization & Admin States
  const [language, setLanguage] = useState<Language>('en');
  const [isB2BAdminMode, setIsB2BAdminMode] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  // Search & Filters
  const [searchMode, setSearchMode] = useState<'DISEASE' | 'MACHINE'>('DISEASE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipmentFilters, setSelectedEquipmentFilters] = useState<EquipmentCode[]>([]);

  // Quick Chips
  const [filterPmjayOnly, setFilterPmjayOnly] = useState(false);
  const [filterSwasthyaSathiOnly, setFilterSwasthyaSathiOnly] = useState(false);
  const [filterGovtTrustOnly, setFilterGovtTrustOnly] = useState(false);
  const [filterEmergencyCathLabOnly, setFilterEmergencyCathLabOnly] = useState(false);

  // GPS Simulation & Kolkata Hyperlocal Locality State
  const [isGpsSimulated, setIsGpsSimulated] = useState(true);
  const [gpsLabel, setGpsLabel] = useState('Salt Lake, Sector V, Kolkata (700091)');
  const [selectedZone, setSelectedZone] = useState<KolkataZone | 'ALL_ZONES'>('ALL_ZONES');
  const [selectedFacilityType, setSelectedFacilityType] = useState<HospitalType | 'ALL_TYPES'>('ALL_TYPES');
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('LOC_SALT_LAKE_SEC5');

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  const toggleB2BAdminMode = useCallback(() => {
    setIsB2BAdminMode((prev) => !prev);
  }, []);

  const toggleFilterPmjay = useCallback(() => {
    setFilterPmjayOnly((prev) => !prev);
  }, []);

  const toggleFilterSwasthyaSathi = useCallback(() => {
    setFilterSwasthyaSathiOnly((prev) => !prev);
  }, []);

  const toggleFilterGovtTrust = useCallback(() => {
    setFilterGovtTrustOnly((prev) => !prev);
  }, []);

  const toggleFilterEmergencyCathLab = useCallback(() => {
    setFilterEmergencyCathLabOnly((prev) => !prev);
  }, []);

  const toggleEquipmentFilter = useCallback((code: EquipmentCode) => {
    setSelectedEquipmentFilters((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }, []);

  const clearEquipmentFilters = useCallback(() => {
    setSelectedEquipmentFilters([]);
  }, []);

  // GPS Simulation toggle with Locality selection
  const simulateLiveGps = useCallback(() => {
    setIsGpsSimulated((prev) => {
      const next = !prev;
      if (next) {
        setGpsLabel('📍 Live GPS: Salt Lake, Sector V, Kolkata (700091)');
      } else {
        setGpsLabel('Kolkata Metropolitan Area Central (700001)');
      }
      return next;
    });
  }, []);

  const handleSelectLocality = useCallback((locId: string) => {
    setSelectedLocalityId(locId);
    const loc = KOLKATA_LOCALITIES.find((l) => l.id === locId);
    if (!loc) return;

    setGpsLabel(`📍 Selected Area: ${loc.name} (${loc.pincode})`);

    // Recalculate dynamic distance & ambulance ETA from selected locality
    setHospitals((currentHospitals) =>
      currentHospitals.map((h) => {
        // Haversine approx
        const dLat = (h.coordinates.lat - loc.lat) * 111;
        const dLng = (h.coordinates.lng - loc.lng) * 102;
        const distKm = Math.max(0.8, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10);
        // Approx Kolkata traffic ETA: 2.3 mins per km in city + 4 mins base dispatch
        const etaMins = Math.max(5, Math.round(distKm * 2.3 + 4));
        return {
          ...h,
          distance_km: distKm,
          eta_minutes: etaMins,
        };
      })
    );
  }, []);

  // SOS Emergency Triage Trigger
  const triggerSosTriage = useCallback(() => {
    setTriageState((prev) => ({
      ...prev,
      activeConditionIcd: 'BA41',
      selectedCity: 'Kolkata',
    }));
    setActiveTab('finder');
    setIsSosModalOpen(true);
  }, []);

  // Typo-tolerant disease search
  const executeTypoTolerantSearch = useCallback((rawQuery: string) => {
    setSearchQuery(rawQuery);
    const q = rawQuery.toLowerCase().trim();
    if (!q) return;

    if (
      q.includes('hart') ||
      q.includes('heart') ||
      q.includes('atack') ||
      q.includes('attack') ||
      q.includes('stemi') ||
      q.includes('chest pain') ||
      q.includes('angina') ||
      q.includes('dil ka daura')
    ) {
      setTriageState((prev) => ({ ...prev, activeConditionIcd: 'BA41' }));
    } else if (
      q.includes('cervix') ||
      q.includes('cervical') ||
      q.includes('bleeding') ||
      q.includes('uterus') ||
      q.includes('brachy')
    ) {
      setTriageState((prev) => ({ ...prev, activeConditionIcd: '2C77' }));
    } else if (
      q.includes('kanser') ||
      q.includes('cancer') ||
      q.includes('lung') ||
      q.includes('tumor') ||
      q.includes('pet-ct') ||
      q.includes('cough blood')
    ) {
      setTriageState((prev) => ({ ...prev, activeConditionIcd: '2C25' }));
    } else if (
      q.includes('strok') ||
      q.includes('stroke') ||
      q.includes('paralysis') ||
      q.includes('slur') ||
      q.includes('lakwa') ||
      q.includes('brain')
    ) {
      setTriageState((prev) => ({ ...prev, activeConditionIcd: '8B11' }));
    } else if (
      q.includes('kidney') ||
      q.includes('dialysis') ||
      q.includes('crrt') ||
      q.includes('creatinine') ||
      q.includes('potassium') ||
      q.includes('renal')
    ) {
      setTriageState((prev) => ({ ...prev, activeConditionIcd: 'GB61' }));
    } else if (
      q.includes('trauma') ||
      q.includes('accident') ||
      q.includes('head injury') ||
      q.includes('sdh') ||
      q.includes('chot')
    ) {
      setTriageState((prev) => ({ ...prev, activeConditionIcd: 'NC72' }));
    }
  }, []);

  // Active condition object
  const activeCondition = useMemo(() => {
    return CONDITION_REQUIREMENTS.find(
      (c) => c.condition_icd_code === triageState.activeConditionIcd
    );
  }, [triageState.activeConditionIcd]);

  // Ranked hospitals with dynamic scoring & chips filtering
  const rankedHospitals = useMemo(() => {
    // 1. Filter by city if selected
    let list = hospitals.filter((h) => {
      if (triageState.selectedCity === 'All Cities') return true;
      return h.city.toLowerCase() === triageState.selectedCity.toLowerCase();
    });

    // 2. Filter by Kolkata Zone if selected
    if (selectedZone !== 'ALL_ZONES') {
      list = list.filter((h) => h.zone === selectedZone);
    }

    // 2b. Filter by Facility Type if selected
    if (selectedFacilityType !== 'ALL_TYPES') {
      list = list.filter((h) => h.hospital_type === selectedFacilityType);
    }

    // 2c. Filter by distance
    list = list.filter((h) => h.distance_km <= triageState.maxDistanceKm);

    // 3. Quick Chips filters
    if (filterPmjayOnly) {
      list = list.filter((h) => h.pmjay_empanelled);
    }
    if (filterSwasthyaSathiOnly) {
      list = list.filter((h) => h.swasthya_sathi_accepted);
    }
    if (filterGovtTrustOnly) {
      list = list.filter((h) => h.hospital_type === 'Government' || h.hospital_type === 'Trust');
    }
    if (filterEmergencyCathLabOnly) {
      list = list.filter((h) =>
        equipment.some(
          (eq) =>
            eq.hospital_id === h.hospital_id &&
            eq.equipment_code === 'CATH_LAB' &&
            eq.operational_status === 'OPERATIONAL' &&
            eq.available_units > 0
        )
      );
    }

    // 4. Equipment multi-checkbox filter (Mode 2)
    if (selectedEquipmentFilters.length > 0) {
      list = list.filter((h) => {
        return selectedEquipmentFilters.every((reqCode) =>
          equipment.some(
            (eq) =>
              eq.hospital_id === h.hospital_id &&
              eq.equipment_code === reqCode &&
              eq.operational_status === 'OPERATIONAL' &&
              eq.available_units > 0
          )
        );
      });
    }

    // 5. Compute score for each hospital
    const scoredList: HospitalWithScore[] = list.map((hospital) => {
      const hospitalEquipmentList = equipment.filter(
        (eq) => eq.hospital_id === hospital.hospital_id
      );

      const cost = TREATMENT_COSTS.find(
        (tc) =>
          tc.hospital_id === hospital.hospital_id &&
          tc.condition_icd_code === triageState.activeConditionIcd
      );

      const scoreBreakdown = calculateHospitalMatchScore(
        hospital,
        activeCondition,
        triageState,
        equipment,
        cost
      );

      return {
        hospital,
        equipment: hospitalEquipmentList,
        treatmentCost: cost,
        scoreBreakdown,
      };
    });

    // 6. Sort by totalScore descending, then by ETA ascending
    return scoredList.sort((a, b) => {
      if (b.scoreBreakdown.totalScore !== a.scoreBreakdown.totalScore) {
        return b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore;
      }
      return a.hospital.eta_minutes - b.hospital.eta_minutes;
    });
  }, [
    hospitals,
    equipment,
    triageState,
    activeCondition,
    filterPmjayOnly,
    filterSwasthyaSathiOnly,
    filterGovtTrustOnly,
    filterEmergencyCathLabOnly,
    selectedEquipmentFilters,
  ]);

  // Quick Action Setters
  const setActiveConditionIcd = useCallback((icd: string) => {
    setTriageState((prev) => ({ ...prev, activeConditionIcd: icd }));
  }, []);

  const setSelectedCity = useCallback((city: string) => {
    setTriageState((prev) => ({ ...prev, selectedCity: city }));
  }, []);

  const setMaxBudgetINR = useCallback((budget: number) => {
    setTriageState((prev) => ({ ...prev, maxBudgetINR: budget }));
  }, []);

  const setRequiredScheme = useCallback((scheme: UserTriageState['requiredScheme']) => {
    setTriageState((prev) => ({ ...prev, requiredScheme: scheme }));
  }, []);

  const setMaxDistanceKm = useCallback((km: number) => {
    setTriageState((prev) => ({ ...prev, maxDistanceKm: km }));
  }, []);

  const toggleCompareHospital = useCallback((h: HospitalWithScore) => {
    setCompareHospitals((prev) => {
      const exists = prev.some((item) => item.hospital.hospital_id === h.hospital.hospital_id);
      if (exists) {
        return prev.filter((item) => item.hospital.hospital_id !== h.hospital.hospital_id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), h];
      }
      return [...prev, h];
    });
  }, []);

  const clearCompareHospitals = useCallback(() => {
    setCompareHospitals([]);
  }, []);

  // Equipment mutation (Core for Admin Telemetry & Real-Time Recalculation)
  const updateEquipmentStatus = useCallback(
    (
      equipmentId: string,
      status: OperationalStatus,
      availableUnits?: number,
      maintenanceReason?: string,
      avgWaitTimeHours?: number
    ) => {
      setEquipment((prev) =>
        prev.map((eq) => {
          if (eq.id !== equipmentId) return eq;
          const newUnits =
            availableUnits !== undefined
              ? availableUnits
              : status === 'OPERATIONAL'
              ? Math.max(1, eq.total_units)
              : 0;

          return {
            ...eq,
            operational_status: status,
            available_units: newUnits,
            avg_wait_time_hours:
              avgWaitTimeHours !== undefined ? avgWaitTimeHours : eq.avg_wait_time_hours,
            maintenance_reason:
              status === 'MAINTENANCE'
                ? maintenanceReason || 'Routine calibration & engineering diagnostic cycle'
                : undefined,
            expected_restoration:
              status === 'MAINTENANCE' ? 'Estimated 24-48 hours' : undefined,
          };
        })
      );
    },
    []
  );

  const updateHospitalMetrics = useCallback(
    (
      hospitalId: string,
      updates: {
        icu_beds_available?: number;
        icu_beds_total?: number;
      }
    ) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.hospital_id !== hospitalId) return h;
          return {
            ...h,
            icu_beds_available:
              updates.icu_beds_available !== undefined
                ? updates.icu_beds_available
                : h.icu_beds_available,
            icu_beds_total:
              updates.icu_beds_total !== undefined
                ? updates.icu_beds_total
                : h.icu_beds_total,
          };
        })
      );
    },
    []
  );

  const toggleEquipmentStatusQuick = useCallback((equipmentId: string) => {
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== equipmentId) return eq;
        const nextStatus: OperationalStatus =
          eq.operational_status === 'OPERATIONAL'
            ? 'MAINTENANCE'
            : eq.operational_status === 'MAINTENANCE'
            ? 'UNAVAILABLE'
            : 'OPERATIONAL';
        const nextAvailable =
          nextStatus === 'OPERATIONAL' ? Math.max(1, eq.total_units) : 0;
        return {
          ...eq,
          operational_status: nextStatus,
          available_units: nextAvailable,
          maintenance_reason:
            nextStatus === 'MAINTENANCE'
              ? 'Unscheduled emergency downtime / engineering service'
              : undefined,
        };
      })
    );
  }, []);

  const resetAllEquipmentToDefault = useCallback(() => {
    setEquipment(INITIAL_EQUIPMENT);
  }, []);

  const simulateEmergencyCodeBlue = useCallback((hospitalId: string) => {
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.hospital_id === hospitalId && eq.equipment_code === 'CATH_LAB') {
          return {
            ...eq,
            operational_status: 'MAINTENANCE',
            available_units: 0,
            maintenance_reason: 'EMERGENCY: Tube overheating during emergency angioplasty. System cooling down.',
          };
        }
        return eq;
      })
    );
  }, []);

  // AI Clinical Report Triage Engine
  const runAITriageReportAnalysis = useCallback(
    async (reportText: string) => {
      setIsAiAnalyzing(true);
      await new Promise((r) => setTimeout(r, 900));

      const lower = reportText.toLowerCase();
      let matchedIcd = 'BA41';
      let name = 'Acute STEMI Heart Attack';
      let keywords: string[] = [];
      let rationale = '';
      let urgency = 'GOLDEN_HOUR';

      if (lower.includes('cervix') || lower.includes('cervical') || lower.includes('bleeding per vaginum') || lower.includes('parametrial') || lower.includes('brachytherapy') || lower.includes('hpv')) {
        matchedIcd = '2C77';
        name = 'Carcinoma Cervix Stage IIB (Locally Advanced)';
        keywords = ['cervical lesion', 'parametrial involvement', 'HDR brachytherapy indicated', 'radiation oncology'];
        rationale = 'Clinical history and biopsy indicate locally advanced cervical neoplasm requiring dual external beam LINAC and intracavitary brachytherapy boost within 48-72 hours.';
        urgency = 'URGENT_48H';
      } else if (lower.includes('lung') || lower.includes('pulmonary nodule') || lower.includes('hemoptysis') || lower.includes('pet-ct') || lower.includes('nsclc') || lower.includes('lobectomy')) {
        matchedIcd = '2C25';
        name = 'Lung Cancer Stage IIA (Non-Small Cell Carcinoma)';
        keywords = ['hypermetabolic mass', 'FDG avidity', 'histopathology confirmation', 'surgical lobectomy candidate'];
        rationale = 'Imaging findings demonstrate solitary pulmonary nodule with regional nodal suspicion. Immediate PET-CT staging and core histopathology required.';
        urgency = 'URGENT_48H';
      } else if (lower.includes('stroke') || lower.includes('hemiparesis') || lower.includes('slurred speech') || lower.includes('facial droop') || lower.includes('nihss') || lower.includes('mca')) {
        matchedIcd = '8B11';
        name = 'Acute Ischemic Stroke (Middle Cerebral Artery Occlusion)';
        keywords = ['sudden focal neurological deficit', 'facial asymmetry', 'DWI restriction', 'thrombectomy window'];
        rationale = 'Hyperacute focal neuro-deficit detected. Patient is within critical 4.5h IV thrombolysis and 24h mechanical thrombectomy window. Requires 3T MRI & Biplane Cath Lab.';
        urgency = 'GOLDEN_HOUR';
      } else if (lower.includes('creatinine') || lower.includes('potassium') || lower.includes('hyperkalemia') || lower.includes('dialysis') || lower.includes('kidney') || lower.includes('renal failure') || lower.includes('anuria')) {
        matchedIcd = 'GB61';
        name = 'End-Stage Renal Disease (ESRD) with Hyperkalemic Crisis';
        keywords = ['severe metabolic acidosis', 'serum K+ > 6.8 mEq/L', 'anuria', 'CRRT required'];
        rationale = 'Life-threatening refractory hyperkalemia and uremia. Immediate continuous renal replacement therapy (CRRT) or emergency hemodialysis required under ICU monitoring.';
        urgency = 'GOLDEN_HOUR';
      } else if (lower.includes('trauma') || lower.includes('accident') || lower.includes('head injury') || lower.includes('subdural') || lower.includes('gcs') || lower.includes('craniectomy')) {
        matchedIcd = 'NC72';
        name = 'Severe Polytrauma with Acute Subdural Hematoma & Herniation';
        keywords = ['blunt cranial trauma', 'GCS < 8', 'midline shift > 7mm', 'operative neuro-microscope'];
        rationale = 'Impending uncal herniation with severe traumatic brain injury. Requires immediate decompressive craniectomy with Zeiss/Leica operative neuro-microscope in Level-1 Trauma Center.';
        urgency = 'GOLDEN_HOUR';
      } else {
        matchedIcd = 'BA41';
        name = 'Acute STEMI Heart Attack (Anterior Wall Infarction)';
        keywords = ['substernal chest pain', 'ST elevations V1-V4', 'Troponin-I elevated', 'door-to-balloon < 90m'];
        rationale = 'Acute ST-elevation myocardial infarction confirmed. Emergency activation of 24x7 Digital Cath Lab for primary percutaneous coronary intervention (PCI).';
        urgency = 'GOLDEN_HOUR';
      }

      setAiAnalysisResult({
        matchedConditionIcd: matchedIcd,
        conditionName: name,
        detectedKeywords: keywords,
        clinicalRationale: rationale,
        recommendedUrgency: urgency,
      });

      setTriageState((prev) => ({
        ...prev,
        activeConditionIcd: matchedIcd,
      }));

      setIsAiAnalyzing(false);
    },
    []
  );

  return (
    <KlinqoContext.Provider
      value={{
        hospitals,
        equipment,
        conditionRequirements: CONDITION_REQUIREMENTS,
        treatmentCosts: TREATMENT_COSTS,
        triageState,
        activeCondition,
        rankedHospitals,
        selectedHospitalForModal,
        compareHospitals,
        activeTab,
        isAiAnalyzing,
        aiAnalysisResult,
        language,
        setLanguage,
        t,
        isB2BAdminMode,
        toggleB2BAdminMode,
        isSosModalOpen,
        setIsSosModalOpen,
        triggerSosTriage,
        searchMode,
        setSearchMode,
        searchQuery,
        setSearchQuery,
        executeTypoTolerantSearch,
        selectedEquipmentFilters,
        toggleEquipmentFilter,
        clearEquipmentFilters,
        filterPmjayOnly,
        toggleFilterPmjay,
        filterSwasthyaSathiOnly,
        toggleFilterSwasthyaSathi,
        filterGovtTrustOnly,
        toggleFilterGovtTrust,
        filterEmergencyCathLabOnly,
        toggleFilterEmergencyCathLab,
        isGpsSimulated,
        gpsLabel,
        simulateLiveGps,
        selectedZone,
        setSelectedZone,
        selectedFacilityType,
        setSelectedFacilityType,
        selectedLocalityId,
        setSelectedLocalityId: handleSelectLocality,
        setTriageState,
        setActiveConditionIcd,
        setSelectedCity,
        setMaxBudgetINR,
        setRequiredScheme,
        setMaxDistanceKm,
        setSelectedHospitalForModal,
        toggleCompareHospital,
        clearCompareHospitals,
        setActiveTab,
        updateEquipmentStatus,
        updateHospitalMetrics,
        toggleEquipmentStatusQuick,
        resetAllEquipmentToDefault,
        runAITriageReportAnalysis,
        simulateEmergencyCodeBlue,
      }}
    >
      {children}
    </KlinqoContext.Provider>
  );
};

export const useKlinqo = () => {
  const context = useContext(KlinqoContext);
  if (!context) {
    throw new Error('useKlinqo must be used within a KlinqoProvider');
  }
  return context;
};
