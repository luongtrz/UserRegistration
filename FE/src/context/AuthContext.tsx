import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import apiClient, { setAccessToken, setRefreshToken, getRefreshToken } from '../lib/axios';

interface User {
  id: number;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

// Token expiration configuration
const ACCESS_TOKEN_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const REFRESH_BUFFER = 30 * 1000; // Refresh 30 seconds before expiry

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize: Check if refresh token exists and restore session
  useEffect(() => {
    const initializeAuth = async () => {
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          // Restore session by refreshing token and fetching user data
          await refreshAccessToken();
          console.log('Session restored successfully');
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Clear invalid tokens
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // 🔥 STRETCH GOAL 1: Silent Token Refresh
  // Automatically refresh token before it expires
  useEffect(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Only set timer if user is authenticated
    if (token && user) {
      const refreshTime = ACCESS_TOKEN_EXPIRATION - REFRESH_BUFFER;
      
      console.log(`🔄 Silent refresh scheduled in ${refreshTime / 1000} seconds`);
      
      refreshTimerRef.current = setTimeout(async () => {
        try {
          console.log('🔄 Performing silent token refresh...');
          await refreshAccessToken();
          console.log('✅ Silent refresh successful');
        } catch (error) {
          console.error('❌ Silent refresh failed:', error);
          // Don't logout on silent refresh failure - let 401 interceptor handle it
        }
      }, refreshTime);
    }

    // Cleanup timer on unmount or token change
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [token, user]); // Re-run when token changes

  // 🔥 STRETCH GOAL 2: Multi-Tab Synchronization
  // Listen for logout events in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Detect when refreshToken is removed in another tab
      if (e.key === 'refreshToken' && e.newValue === null) {
        console.log('🔄 Logout detected in another tab, syncing...');
        // Clear local state to sync logout across tabs
        setAccessToken(null);
        setUser(null);
        setToken(null);
        
        // Optionally redirect to login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
      
      // Detect when refreshToken is added in another tab (login sync)
      if (e.key === 'refreshToken' && e.oldValue === null && e.newValue !== null) {
        console.log('🔄 Login detected in another tab, syncing...');
        // Restore session in this tab
        refreshAccessToken().catch(console.error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      // Store tokens
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      
      // Update state
      setUser(userData);
      setToken(accessToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        // Call logout endpoint to revoke refresh token
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user data regardless of API call result
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setToken(null);
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Step 1: Refresh the access token
      const refreshResponse = await apiClient.post('/auth/refresh', { refreshToken });
      const { accessToken: newAccessToken } = refreshResponse.data.data;

      // Step 2: Update access token in memory
      setAccessToken(newAccessToken);
      setToken(newAccessToken);

      // Step 3: Fetch user data using the new access token
      // This ensures user state is always in sync after refresh
      const userResponse = await apiClient.get('/auth/me');
      const userData = userResponse.data.data;
      
      // Update user state
      setUser(userData);
    } catch (error) {
      // If refresh fails, logout
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    accessToken: token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
