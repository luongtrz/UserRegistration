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

  // Silent Token Refresh: Automatically refresh before expiration
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    if (token && user) {
      const refreshTime = ACCESS_TOKEN_EXPIRATION - REFRESH_BUFFER;
      
      refreshTimerRef.current = setTimeout(async () => {
        try {
          await refreshAccessToken();
        } catch (error) {
          console.error('Silent refresh failed:', error);
        }
      }, refreshTime);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [token, user]);

  // Multi-Tab Synchronization: Sync auth state across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'refreshToken' && e.newValue === null) {
        setAccessToken(null);
        setUser(null);
        setToken(null);
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
      
      if (e.key === 'refreshToken' && e.oldValue === null && e.newValue !== null) {
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
