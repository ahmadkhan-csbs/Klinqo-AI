const fs = require('fs');

// 1. Load the new 21 verified Kolkata government hospitals
const rawTs = fs.readFileSync('src/data/kolkataGovtHospitalsData.ts', 'utf8');
const cleanedJs = rawTs
  .replace("import { Hospital, HospitalEquipment } from '@/types/medical';", '')
  .replace('export const KOLKATA_GOVT_HOSPITALS_DATA: Hospital[] =', 'const data =') + '\nmodule.exports = data;\n';

fs.writeFileSync('scripts/tempGovtData.js', cleanedJs);
const govtHospitals = require('./tempGovtData.js');
fs.unlinkSync('scripts/tempGovtData.js');

const govtMap = new Map();
govtHospitals.forEach(h => govtMap.set(h.hospital_id, h));

// 2. Read medicalDatabase.ts
let dbText = fs.readFileSync('src/data/medicalDatabase.ts', 'utf8');

// Locate INITIAL_HOSPITALS and INITIAL_EQUIPMENT
const hospitalsStartMatch = dbText.indexOf('export const INITIAL_HOSPITALS: Hospital[] = [');
const hospitalsEndMatch = dbText.indexOf('export const INITIAL_EQUIPMENT: HospitalEquipment[] = [');

if (hospitalsStartMatch === -1 || hospitalsEndMatch === -1) {
  console.error('Could not find hospital boundary in medicalDatabase.ts');
  process.exit(1);
}

// Extract hospitals array code
const hospitalsDeclaration = 'export const INITIAL_HOSPITALS: Hospital[] = ';
const hospitalsCode = dbText.substring(hospitalsStartMatch + hospitalsDeclaration.length, hospitalsEndMatch).trim();

// Convert to valid JS for evaluation
// Remove trailing semicolon if any
let cleanedHospitalsCode = hospitalsCode;
if (cleanedHospitalsCode.endsWith(';')) {
  cleanedHospitalsCode = cleanedHospitalsCode.slice(0, -1);
}

fs.writeFileSync('scripts/tempHospitals.js', 'module.exports = ' + cleanedHospitalsCode + ';\n');
const existingHospitals = require('./tempHospitals.js');
fs.unlinkSync('scripts/tempHospitals.js');

console.log('Existing hospitals count:', existingHospitals.length);

// Merge or update
const mergedHospitals = [];
const processedIds = new Set();

for (const existing of existingHospitals) {
  if (govtMap.has(existing.hospital_id)) {
    const govtUpdate = govtMap.get(existing.hospital_id);
    mergedHospitals.push({ ...existing, ...govtUpdate });
    processedIds.add(existing.hospital_id);
  } else {
    mergedHospitals.push(existing);
    processedIds.add(existing.hospital_id);
  }
}

// Add any new govt hospital that wasn't in existingHospitals
for (const [id, govt] of govtMap.entries()) {
  if (!processedIds.has(id)) {
    mergedHospitals.push(govt);
    processedIds.add(id);
    console.log('Added new government hospital:', govt.name);
  }
}

console.log('Merged hospitals count:', mergedHospitals.length);

// Write back to medicalDatabase.ts
const newHospitalsJson = JSON.stringify(mergedHospitals, null, 2);
const updatedDbText = dbText.substring(0, hospitalsStartMatch) +
  'export const INITIAL_HOSPITALS: Hospital[] = ' + newHospitalsJson + ';\n\n' +
  dbText.substring(hospitalsEndMatch);

fs.writeFileSync('src/data/medicalDatabase.ts', updatedDbText, 'utf8');
console.log('Successfully updated medicalDatabase.ts with all 21 verified Kolkata government hospitals!');
