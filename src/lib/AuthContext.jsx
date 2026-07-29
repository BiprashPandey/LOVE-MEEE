import React, { createContext, useState, useContext, useEffect } from 'react';
import { storageClient } from '@/api/storageClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const localUser = storageClient.getUser();
      setUser(localUser || { id: 'local_user', name: 'Champion', email: 'champion@lovemeee.app' });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('User auth check error:', error);
      setUser({ id: 'local_user', name: 'Champion', email: 'champion@lovemeee.app' });
      setIsAuthenticated(true);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const login = (email, password) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0] || 'User',
      email: email,
    };
    storageClient.setUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  const logout = () => {
    const guestUser = { id: 'guest_' + Date.now(), name: 'Guest', email: 'guest@lovemeee.app' };
    storageClient.setUser(guestUser);
    setUser(guestUser);
    setIsAuthenticated(true);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      login,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
