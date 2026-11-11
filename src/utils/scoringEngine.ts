import {
  Hospital,
  HospitalEquipment,
  ConditionRequirement,
  TreatmentCost,
  UserTriageState,
  CapabilityScoreBreakdown,
  EquipmentCode,
} from '@/types/medical';

export function calculateHospitalMatchScore(
  hospital: Hospital,
  condition: ConditionRequirement | undefined,
  userFilters: UserTriageState,
  allEquipment: HospitalEquipment[],
  treatmentCost?: TreatmentCost
): CapabilityScoreBreakdown {
  // If no condition selected, return neutral default score
  if (!condition) {
    return {
      equipmentScore: 50,
      financialScore: 25,
      logisticsQualityScore: 20,
      totalScore: 95,
      mandatoryEquipmentAvailable: 0,
      mandatoryEquipmentTotal: 0,
      missingEquipment: [],
      maintenanceEquipment: [],
      referralRiskLevel: 'NONE',
      financialMatchVerdict: 'FULL_COVERAGE',
    };
  }

  // 1. Equipment Evaluation (50% max)
  const hospitalEquipment = allEquipment.filter(
    (eq) => eq.hospital_id === hospital.hospital_id
  );

  const mandatoryCodes = condition.mandatory_equipment;
  const missingEquipment: EquipmentCode[] = [];
  const maintenanceEquipment: EquipmentCode[] = [];
  let operationalCount = 0;

  for (const code of mandatoryCodes) {
    const matched = hospitalEquipment.find((eq) => eq.equipment_code === code);
    if (!matched) {
      missingEquipment.push(code);
    } else if (matched.operational_status === 'MAINTENANCE') {
      maintenanceEquipment.push(code);
    } else if (matched.operational_status === 'OPERATIONAL' && matched.available_units > 0) {
      operationalCount += 1;
    } else {
      // unavailable / zero available units
      missingEquipment.push(code);
    }
  }

  const mandatoryRatio =
    mandatoryCodes.length > 0 ? operationalCount / mandatoryCodes.length : 1;

  // Severe penalty if any mandatory machine is missing or down
  let equipmentScore = mandatoryRatio * 50;
  if (maintenanceEquipment.length > 0) {
    equipmentScore = Math.max(0, equipmentScore - 15 * maintenanceEquipment.length);
  }
  if (missingEquipment.length > 0) {
    equipmentScore = Math.max(0, equipmentScore - 20 * missingEquipment.length);
  }

  // Determine Referral Risk Level and Clinical Warnings
  let referralRiskLevel: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL_BLOCKER' = 'NONE';
  let clinicalWarning: string | undefined = undefined;

  if (operationalCount === 0 && mandatoryCodes.length > 0) {
    referralRiskLevel = 'CRITICAL_BLOCKER';
    clinicalWarning = `CRITICAL DEFICIT: Hospital lacks all required active clinical modalities (${mandatoryCodes.join(
      ', '
    )}) for ${condition.condition_name}. Immediate diversion recommended.`;
  } else if (maintenanceEquipment.length > 0) {
    referralRiskLevel = 'HIGH';
    const downNames = maintenanceEquipment.join(', ');
    clinicalWarning = `REFERRAL ALERT: Key diagnostic/therapeutic modality (${downNames}) is currently under MAINTENANCE. Therapeutic delay will exceed clinical protocol threshold.`;
  } else if (missingEquipment.length > 0) {
    referralRiskLevel = 'HIGH';
    clinicalWarning = `INCOMPLETE INFRASTRUCTURE: Lacks mandatory equipment (${missingEquipment.join(
      ', '
    )}). Patient transfer may be necessary for definitive care.`;
  } else {
    // Check optional equipment for minor notes
    const missingOptional = condition.optional_equipment.filter(
      (code) => !hospitalEquipment.some((eq) => eq.equipment_code === code && eq.operational_status === 'OPERATIONAL')
    );
    if (missingOptional.length > 0) {
      referralRiskLevel = 'LOW';
    }
  }

  // 2. Financial & Scheme Evaluation (25% max)
  let financialScore = 0;
  let financialMatchVerdict: 'FULL_COVERAGE' | 'PARTIAL_GAP' | 'OUT_OF_BUDGET' =
    'FULL_COVERAGE';

  const isGovtHospital = hospital.hospital_type === 'Government';
  const selectedScheme = userFilters.requiredScheme;

  // Scheme eligibility check
  let schemeMatches = false;
  if (selectedScheme === 'ANY') {
    schemeMatches = true;
  } else if (selectedScheme === 'PMJAY') {
    schemeMatches = hospital.pmjay_empanelled || (treatmentCost?.cashless_insurers.some((ins) => ins.toLowerCase().includes('ayushman') || ins.toLowerCase().includes('pm-jay')) ?? false);
  } else if (selectedScheme === 'SWASTHYA_SATHI') {
    schemeMatches = hospital.swasthya_sathi_accepted || (treatmentCost?.cashless_insurers.some((ins) => ins.toLowerCase().includes('swasthya sathi')) ?? false);
  } else if (selectedScheme === 'CGHS') {
    schemeMatches = isGovtHospital || (treatmentCost?.cashless_insurers.some((ins) => ins.toLowerCase().includes('cghs')) ?? false);
  } else if (selectedScheme === 'PRIVATE_INSURANCE') {
    schemeMatches = (treatmentCost?.cashless_insurers.some((ins) => ins.toLowerCase().includes('star') || ins.toLowerCase().includes('hdfc') || ins.toLowerCase().includes('care') || ins.toLowerCase().includes('icici')) ?? false);
  }

  // Calculate budget points
  const minCost = treatmentCost ? treatmentCost.min_estimated_cost : (isGovtHospital ? 2000 : 150000);
  const maxCost = treatmentCost ? treatmentCost.max_estimated_cost : (isGovtHospital ? 20000 : 350000);

  if (schemeMatches && (isGovtHospital || (selectedScheme === 'PMJAY' && hospital.pmjay_empanelled) || (selectedScheme === 'SWASTHYA_SATHI' && hospital.swasthya_sathi_accepted))) {
    // 100% cashless coverage under government schemes
    financialScore = 25;
    financialMatchVerdict = 'FULL_COVERAGE';
  } else if (schemeMatches) {
    // Scheme matches private insurance
    if (userFilters.maxBudgetINR >= maxCost) {
      financialScore = 24;
      financialMatchVerdict = 'FULL_COVERAGE';
    } else if (userFilters.maxBudgetINR >= minCost) {
      financialScore = 18;
      financialMatchVerdict = 'PARTIAL_GAP';
    } else {
      const budgetRatio = userFilters.maxBudgetINR / Math.max(1, minCost);
      financialScore = Math.max(6, Math.round(budgetRatio * 15));
      financialMatchVerdict = 'OUT_OF_BUDGET';
    }
  } else {
    // Scheme mismatch penalty
    if (userFilters.maxBudgetINR >= maxCost) {
      financialScore = 14;
      financialMatchVerdict = 'PARTIAL_GAP';
    } else if (userFilters.maxBudgetINR >= minCost) {
      financialScore = 9;
      financialMatchVerdict = 'PARTIAL_GAP';
    } else {
      financialScore = 3;
      financialMatchVerdict = 'OUT_OF_BUDGET';
    }
  }

  // 3. Travel ETA & Logistics/Accreditation Evaluation (25% max)
  let logisticsQualityScore = 0;
  const isGoldenHour = condition.urgency_level === 'GOLDEN_HOUR';

  // Base travel points (up to 20 pts)
  const eta = hospital.eta_minutes;
  if (isGoldenHour) {
    // In Golden hour, ETA is life-critical
    if (eta <= 15) {
      logisticsQualityScore += 20;
    } else if (eta <= 25) {
      logisticsQualityScore += 16;
    } else if (eta <= 35) {
      logisticsQualityScore += 11;
    } else if (eta <= 50) {
      logisticsQualityScore += 6;
    } else {
      logisticsQualityScore += 2;
    }
  } else {
    // Urgent 48h or Planned
    if (eta <= 20) {
      logisticsQualityScore += 18;
    } else if (eta <= 40) {
      logisticsQualityScore += 15;
    } else if (eta <= 60) {
      logisticsQualityScore += 11;
    } else {
      logisticsQualityScore += 6;
    }
  }

  // NABH Accreditation bonus (up to 5 pts)
  if (hospital.nabh_accredited) {
    logisticsQualityScore += 5;
  } else if (isGovtHospital) {
    // Apex govt institutions get quality parity
    logisticsQualityScore += 3;
  }

  logisticsQualityScore = Math.min(25, logisticsQualityScore);

  // Total Capability Score (0 to 100)
  const totalScore = Math.min(
    100,
    Math.max(0, Math.round(equipmentScore + financialScore + logisticsQualityScore))
  );

  return {
    equipmentScore: Math.round(equipmentScore),
    financialScore: Math.round(financialScore),
    logisticsQualityScore: Math.round(logisticsQualityScore),
    totalScore,
    mandatoryEquipmentAvailable: operationalCount,
    mandatoryEquipmentTotal: mandatoryCodes.length,
    missingEquipment,
    maintenanceEquipment,
    clinicalWarning,
    referralRiskLevel,
    financialMatchVerdict,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
