import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // True on initial load
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount, verify if the user has a valid session
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // User is not authenticated; this is a normal state, not an error
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const signup = async (signupData) => {
    const { data } = await axiosInstance.post('/auth/signup', signupData);
    if (data.success) {
      if (data.token) localStorage.setItem('kaamlink_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const login = async (loginData) => {
    const { data } = await axiosInstance.post('/auth/login', loginData);
    if (data.success) {
      if (data.token) localStorage.setItem('kaamlink_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('kaamlink_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    signup,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

