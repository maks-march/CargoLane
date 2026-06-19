import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type LoginCommand, type RegisterCommand } from '../services/auth.service';

interface AuthState {
  user: {
    id: string;
    name: string | null;
    role: string;
    displayName?: string;
    companyName?: string;
    avatarUrl?: string;
    email?: string;
    timezone?: number; // ИСПРАВЛЕНО: Сохраняем таймзону глобально
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginCommand) => Promise<void>;
  register: (data: RegisterCommand) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  updateUser: (data: Partial<AuthState['user']>) => void;
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
          user: { 
            id: tokens.userId, 
            name: tokens.username, 
            role: tokens.role,
            email: data.email || data.login,
            timezone: 0 // Дефолтное значение до загрузки профиля
          },
          isAuthenticated: !!tokens.token,
          isLoading: false,
        });
      },

      register: async (data: RegisterCommand) => {
        await authService.register(data);
      },
      
      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      
      initialize: () => {
        const tokens = authService.getCurrentUserTokens();
        if (tokens && tokens.token) {
          set((state) => ({
            user: { 
              id: tokens.userId, 
              name: tokens.username, 
              role: tokens.role,
              ...state.user 
            },
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (data: Partial<AuthState['user']>) => {
          set((state) => ({
              user: state.user ? { ...state.user, ...data } : null
          }));
      }
    }),
    { name: 'auth-storage' }
  )
);

export default useAuthStore;