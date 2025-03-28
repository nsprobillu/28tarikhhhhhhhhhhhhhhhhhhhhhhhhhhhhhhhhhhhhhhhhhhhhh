import { create } from 'zustand';
import axios from 'axios';
import { AuthState } from '../types/auth';
import { setUserData } from '../utils/analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAuthStore = create<AuthState>()((set) => {
  // Initialize state from localStorage
  let storedToken = localStorage.getItem('token');
  let storedUser = null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      storedUser = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Failed to parse stored user:', error);
  }

  // Check token expiration
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token has expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, isAuthenticated: false });
          return false;
        }
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  // Check token expiration on initialization
  if (storedToken && !checkTokenExpiration()) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    storedToken = null;
    storedUser = null;
  }

  // If user exists, set analytics data
  if (storedUser) {
    setUserData(storedUser.id, {
      email: storedUser.email,
      isAdmin: storedUser.isAdmin
    });
  }

  // Set up periodic token check (every minute)
  setInterval(checkTokenExpiration, 60000);

  return {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,

    login: async (email: string, password: string) => {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        if (!response.data.token || !response.data.user) {
          throw new Error('Invalid response from server');
        }

        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Track user in analytics
        setUserData(user.id, {
          email: user.email,
          isAdmin: user.isAdmin
        });
        
        set({ user, token, isAuthenticated: true });
        
        return { user, token }; // Return the user and token
      } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(error.response?.data?.error || 'Login failed');
      }
    },

    register: async (email: string, password: string) => {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, {
          email,
          password,
        });

        if (!response.data.token || !response.data.user) {
          throw new Error('Invalid response from server');
        }

        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Track user in analytics
        setUserData(user.id, {
          email: user.email,
          isAdmin: user.isAdmin
        });
        
        set({ user, token, isAuthenticated: true });
        
        return { user, token }; // Return the user and token
      } catch (error: any) {
        console.error('Registration error:', error);
        throw new Error(error.response?.data?.error || 'Registration failed');
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});