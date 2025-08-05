import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
  };
  error_message: string | null;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'creative';
  default_view: 'list' | 'board';
  notification_preferences: {
    email_notifications: boolean;
    in_app_notifications: boolean;
  };
}

export interface Task {
  id: string;
  name: string;
  description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  category_id: string | null;
  is_completed: boolean;
  reminders: string[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color_code: string;
  created_at: string;
  updated_at: string;
}

export interface AppState {
  authentication_state: AuthenticationState;
  user_preferences: UserPreferences;
  task_state: { tasks: Task[] };
  category_state: { categories: Category[] };

  // Actions
  login_user: (email: string, password: string) => Promise<void>;
  logout_user: () => void;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
}

// Store
export const useAppStore = create<AppState>(
  persist(
    (set, get) => ({
      // Initial state
      authentication_state: {
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: true,
        },
        error_message: null,
      },
      user_preferences: {
        theme: 'light',
        default_view: 'list',
        notification_preferences: {
          email_notifications: true,
          in_app_notifications: true,
        },
      },
      task_state: {
        tasks: [],
      },
      category_state: {
        categories: [],
      },
      // Actions
      login_user: async (email, password) => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: { ...state.authentication_state.authentication_status, is_loading: true },
            error_message: null,
          },
        }));
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/login`,
            { email, password }
          );
          const { user, auth_token } = response.data;
          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token,
              authentication_status: { is_authenticated: Boolean(user && auth_token), is_loading: false },
              error_message: null,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: { is_authenticated: false, is_loading: false },
              error_message: error.message || 'Failed to login',
            },
          }));
          throw new Error(error.message || 'Failed to login');
        }
      },
      logout_user: () => {
        set((state) => ({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: { is_authenticated: false, is_loading: false },
            error_message: null,
          },
        }));
      },
      register_user: async (email, password, name) => {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/register`,
            { email, password, name }
          );
        } catch (error: any) {
          throw new Error(error.message || 'Registration failed');
        }
      },
      initialize_auth: async () => {
        const { authentication_state } = get();
        if (!authentication_state.auth_token) {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: { ...state.authentication_state.authentication_status, is_loading: false },
            },
          }));
          return;
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/verify`,
            { headers: { Authorization: `Bearer ${authentication_state.auth_token}` } }
          );
          const { user } = response.data;

          set((state) => ({
            authentication_state: {
              current_user: user,
              auth_token: authentication_state.auth_token,
              authentication_status: { is_authenticated: true, is_loading: false },
              error_message: null,
            },
          }));
        } catch {
          set((state) => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: { is_authenticated: false, is_loading: false },
              error_message: null,
            },
          }));
        }
      },
      clear_auth_error: () => {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            error_message: null,
          },
        }));
      },
    }),
    {
      name: 'creative-todo-auth-store',
      partialize: (state) => ({
        authentication_state: {
          current_user: state.authentication_state.current_user,
          auth_token: state.authentication_state.auth_token,
          authentication_status: {
            is_authenticated: state.authentication_state.authentication_status.is_authenticated,
          },
        },
      }),
    }
  )
);