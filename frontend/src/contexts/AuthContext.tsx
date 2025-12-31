// Global authentication context for managing user state across the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthContextType, UserInfo } from '../types/auth';
import { tokenManager } from '../utils/tokenManager';

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component to wrap the app and provide auth state
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state on component mount
  // Check if token exists and fetch user info
  useEffect(() => {
    const initAuth = async () => {
      if (tokenManager.hasToken()) {
        try {
          // Fetch current user info using stored token
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user info:', error);
          // If token is invalid, remove it
          tokenManager.removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param email - User's email
   * @param password - User's password
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout function
   * Clears user state and redirects to login page
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  /**
   * Check if current user is an admin
   * @returns true if user is admin (role_id = 1), false otherwise
   */
  const isAdmin = () => {
    return user?.role_id === 1; // Assuming role_id=1 is admin
  };

  // Context value to be provided to children
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};