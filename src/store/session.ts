import { create } from 'zustand';
import type { Role } from '../lib/permissions';

export interface Session {
  uid: string | null;
  email: string | null;
  plantIds: string[];
  roles: Role[];
  plantId: string | null;
  period: string; // yyyymm
  setSession: (s: Partial<Session>) => void;
  signOut: () => void;
}

const DEFAULT_PERIOD = '202610';

export const useSession = create<Session>((set) => ({
  uid: null,
  email: null,
  plantIds: ['mehsana'],
  roles: ['management'],
  plantId: 'mehsana',
  period: DEFAULT_PERIOD,
  setSession: (s) => set(s),
  signOut: () => set({ uid: null, email: null, plantIds: [], roles: [], plantId: null }),
}));
