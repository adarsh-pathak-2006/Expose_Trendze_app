import { create } from 'zustand';

import * as authService from '../services/auth';
import type { AppRole, UserProfile } from '../types/order';

type AuthStore = {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  role: AppRole | null;
  profile: UserProfile | null;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string, variant: AppRole) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isBootstrapping: true,
  isAuthenticated: false,
  isSubmitting: false,
  role: null,
  profile: null,
  error: null,
  bootstrap: async () => {
    set({ isBootstrapping: true, error: null });
    try {
      const session = await authService.getCurrentSession();
      if (!session?.user) {
        set({ isAuthenticated: false, role: null, profile: null, isBootstrapping: false });
        return;
      }

      const profile = await authService.fetchProfile();
      set({ isAuthenticated: true, role: profile.role, profile, isBootstrapping: false });
    } catch (error) {
      set({
        isAuthenticated: false,
        role: null,
        profile: null,
        isBootstrapping: false,
        error: error instanceof Error ? error.message : 'Unable to restore session.',
      });
    }
  },
  login: async (email, password, variant) => {
    set({ isSubmitting: true, error: null });
    try {
      await authService.signIn(email, password, variant);
      const profile = await authService.fetchProfile(variant);
      set({ isAuthenticated: true, role: profile.role, profile, isSubmitting: false });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Login failed.',
      });
      throw error;
    }
  },
  logout: async () => {
    set({ isSubmitting: true, error: null });
    try {
      await authService.signOut();
      set({
        isAuthenticated: false,
        role: null,
        profile: null,
        isSubmitting: false,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Logout failed.',
      });
    }
  },
  clearError: () => set({ error: null }),
}));
