/**
 * SAMPLE DATA ONLY — clearly labelled, never real company values.
 * Used for dev/emulator seeds and empty-state demos.
 */
export const SAMPLE_COST_CENTRES = [
  { code: '820410300', description: 'SAMPLE Circular Saw', department: 'Hot Flow', type: 'production', driver: 'machine-hrs', uom: 'hr', active: true },
  { code: '820410151', description: 'SAMPLE Hot Extrusion Press', department: 'Hot Flow', type: 'production', driver: 'machine-hrs', uom: 'hr', active: true },
  { code: '820410309', description: 'SAMPLE Pilgering', department: 'Cold Flow', type: 'production', driver: 'machine-hrs', uom: 'hr', active: true },
  { code: '820410352', description: 'SAMPLE U-Bending', department: 'U-Bend', type: 'production', driver: 'machine-hrs', uom: 'hr', active: true },
  { code: '820410415', description: 'SAMPLE Quality', department: 'Quality', type: 'service', driver: 'test-hrs', uom: 'hr', active: true },
  { code: '82049VARM', description: 'SAMPLE Variance RM (reporting)', department: 'Finance', type: 'reporting', driver: 'n/a', uom: 'n/a', active: true },
];

export const SAMPLE_PROFIT_CENTRES = [
  { code: '513', entity: '8911', desc: 'SAMPLE PC 513', active: true },
  { code: '514', entity: '8911', desc: 'SAMPLE PC 514 (interim-controlled)', active: true },
  { code: '517', entity: '8911', desc: 'SAMPLE PC 517', active: true },
];

export const SAMPLE_PRODUCTS = [
  { id: 'SAMPLE-TUBE-304-50', grade: '304', gradeGroup: 'Austenitic', od: 50.8, wt: 2.0, uom: 'kg' },
  { id: 'SAMPLE-TUBE-2205-38', grade: '2205', gradeGroup: 'Duplex', od: 38.1, wt: 2.11, uom: 'kg' },
];

export const KNOWN_PCS = ['513', '514', '517'];
