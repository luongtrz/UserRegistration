import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import apiClient, { setAccessToken } from '../lib/axios';

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
  const broadcastChannel = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for multi-tab sync
  useEffect(() => {
    broadcastChannel.current = new BroadcastChannel('auth-channel');
    
    return () => {
      broadcastChannel.current?.close();
    };
  }, []);

  // Initialize: Try to restore session from HttpOnly cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to restore session by calling refresh endpoint
        // Cookie will be sent automatically
        await refreshAccessToken();
      } catch (error) {
        // No valid session, user needs to login
        setAccessToken(null);
        setUser(null);
        setToken(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Multi-Tab Synchronization using BroadcastChannel
  useEffect(() => {
    if (!broadcastChannel.current) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOGOUT') {
        setAccessToken(null);
        setUser(null);
        setToken(null);
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      } else if (event.data.type === 'LOGIN') {
        refreshAccessToken().catch(console.error);
      }
    };

    broadcastChannel.current.onmessage = handleMessage;
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user: userData, accessToken } = response.data.data;

      setAccessToken(accessToken);
      setUser(userData);
      setToken(accessToken);

      // Notify other tabs about login
      broadcastChannel.current?.postMessage({ type: 'LOGIN' });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint - cookie sent automatically
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setToken(null);

      // Notify other tabs about logout
      broadcastChannel.current?.postMessage({ type: 'LOGOUT' });
    }
  };

  const refreshAccessToken = async () => {
    try {
      // Refresh token sent automatically via HttpOnly cookie
      const refreshResponse = await apiClient.post('/auth/refresh');
      const { accessToken: newAccessToken } = refreshResponse.data.data;

      setAccessToken(newAccessToken);
      setToken(newAccessToken);

      // Fetch user data using the new access token
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
