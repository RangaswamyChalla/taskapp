import React, { createContext, useContext, useState, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = useCallback(async () => {
    try {
      const { data } = await API.post('/auth/login', { email: 'demo@app.com', password: 'demo123' });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch {
      try {
        await API.post('/auth/register', { email: 'demo@app.com', password: 'demo123', name: 'Demo User' });
        const { data } = await API.post('/auth/login', { email: 'demo@app.com', password: 'demo123' });
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } catch (err) {
        console.error('Login failed:', err);
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
