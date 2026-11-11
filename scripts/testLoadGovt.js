const fs = require('fs');

const rawTs = fs.readFileSync('src/data/kolkataGovtHospitalsData.ts', 'utf8');
const cleanedJs = rawTs
  .replace("import { Hospital, HospitalEquipment } from '@/types/medical';", '')
  .replace('export const KOLKATA_GOVT_HOSPITALS_DATA: Hospital[] =', 'const data =') + '\nmodule.exports = data;\n';

fs.writeFileSync('scripts/tempGovtData.js', cleanedJs);
const govtHospitals = require('./tempGovtData.js');
console.log('Successfully loaded ' + govtHospitals.length + ' govt hospitals');

// Clean up temp file
fs.unlinkSync('scripts/tempGovtData.js');
