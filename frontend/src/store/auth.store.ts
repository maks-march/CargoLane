import { create } from 'zustand';
import type { AuthResponse } from '../api/types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: {
    id: string;
    name: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthResponse) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (tokens: AuthResponse) => {
    set({
      user: tokens.userId ? { id: tokens.userId, name: tokens.userName } : null,
      isAuthenticated: !!tokens.accessToken,
      isLoading: false,
    });
  },
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  initialize: () => {
    const tokens = authService.getCurrentUserTokens();
    if (tokens && tokens.accessToken) {
      set({
        user: { id: tokens.userId, name: tokens.userName },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
