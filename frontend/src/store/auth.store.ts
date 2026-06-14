import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type LoginCommand } from '../services/auth.service';

interface AuthState {
  user: {
    id: string;
    name: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginCommand) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (data: LoginCommand) => {
        const tokens = await authService.login(data);
        set({
          user: tokens.userId ? { id: tokens.userId, name: tokens.username } : null,
          isAuthenticated: !!tokens.token,
          isLoading: false,
        });
      },
      
      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      
      initialize: () => {
        const tokens = authService.getCurrentUserTokens();
        if (tokens && tokens.token) {
          set({
            user: { id: tokens.userId, name: tokens.username },
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    { name: 'auth-storage' }
  )
);

export default useAuthStore;