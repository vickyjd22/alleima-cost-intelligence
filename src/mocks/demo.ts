/**
 * Mock domain dataset — single SAMPLE source shared by all review screens.
 * IDs are stable across screens. resetDemo() restores initial state.
 */
import type { SopicRow } from '../lib/reconciliation';

export interface Heat { id: string; material: string; qty: number; kg: number; loc: string }
export interface WorkOrder { id: string; product: string; qty: number; status: string }
export interface Traveller { id: string; wo: string; pass: string; machine: string; cc: string; heat: string; inputKg: number; outputKg: number }
export interface Inspection { id: string; traveller: string; code: string; qty: number; disp: 'rework' | 'reject' | 'hold' }
export interface Approval { id: string; kind: string; ref: string; maker: string; status: 'pending' | 'approved' | 'rejected' }

const INITIAL = {
  heats: [
    { id: 'H-771', material: 'SAMPLE Billet 304', qty: 40, kg: 5200, loc: 'RM-YARD-A' },
    { id: 'H-772', material: 'SAMPLE Billet 2205', qty: 22, kg: 3100, loc: 'RM-YARD-A' },
  ] as Heat[],
  workOrders: [
    { id: 'WO-881', product: 'SAMPLE-TUBE-304-50', qty: 1200, status: 'released' },
    { id: 'WO-882', product: 'SAMPLE-TUBE-2205-38', qty: 800, status: 'in-progress' },
  ] as WorkOrder[],
  travellers: [
    { id: 'T-501', wo: 'WO-881', pass: 'HF-3', machine: 'PRESS-151', cc: '820410151', heat: 'H-771', inputKg: 1000, outputKg: 942 },
    { id: 'T-502', wo: 'WO-882', pass: 'CF-2', machine: 'PILGER-309', cc: '820410309', heat: 'H-772', inputKg: 800, outputKg: 764 },
  ] as Traveller[],
  sopic: [
    { invoiceNo: 'INV-1001', date: '2026-10-05', customerId: 'C-01', orderNo: 'SO-1042', productId: 'SAMPLE-TUBE-304-50', productAccount: 'PA-11', qty: 100, netWeight: 2400, value: 980000, profitCentre: '514' },
    { invoiceNo: '0', date: '2026-10-06', customerId: 'C-02', orderNo: 'SO-1043', productId: 'SAMPLE-TUBE-2205-38', productAccount: 'PA-12', qty: 40, netWeight: 900, value: 410000, profitCentre: '514' },
    { invoiceNo: 'INV-1003', date: '2026-10-07', customerId: 'C-03', orderNo: 'SO-1044', productId: 'SAMPLE-TUBE-304-50', productAccount: 'PA-11', qty: 60, netWeight: 1500, value: 620000, profitCentre: '999' },
  ] as SopicRow[],
  inspections: [
    { id: 'Q-901', traveller: 'T-501', code: 'ECT-LINE', qty: 8, disp: 'rework' },
    { id: 'Q-902', traveller: 'T-502', code: 'DIM-OD', qty: 5, disp: 'reject' },
  ] as Inspection[],
  approvals: [
    { id: 'AP-01', kind: 'WIP adjust', ref: 'T-501', maker: 'stores.clerk', status: 'pending' },
    { id: 'AP-02', kind: 'PC reallocation 514→517', ref: 'INV-1001', maker: 'finance.exec', status: 'pending' },
    { id: 'AP-03', kind: 'Rate change MHR', ref: 'PRESS-151 v4', maker: 'costing.mgr', status: 'pending' },
  ] as Approval[],
  plans: [
    { id: 'PLAN-OCT-HF', flow: 'HF', qty: 420, state: 'confirmed' },
    { id: 'PLAN-OCT-CF', flow: 'CF', qty: 380, state: 'draft' },
  ],
};

export const demoDb = {
  heats: [...INITIAL.heats],
  workOrders: [...INITIAL.workOrders],
  travellers: [...INITIAL.travellers],
  sopic: [...INITIAL.sopic],
  inspections: [...INITIAL.inspections],
  approvals: [...INITIAL.approvals],
  plans: [...INITIAL.plans],
};

export function resetDemo(): void {
  demoDb.heats = [...INITIAL.heats];
  demoDb.workOrders = [...INITIAL.workOrders];
  demoDb.travellers = [...INITIAL.travellers];
  demoDb.sopic = [...INITIAL.sopic];
  demoDb.inspections = [...INITIAL.inspections];
  demoDb.approvals = INITIAL.approvals.map((a) => ({ ...a }));
  demoDb.plans = [...INITIAL.plans];
}
