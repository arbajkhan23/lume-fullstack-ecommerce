import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lume_admin_user');
    const token = localStorage.getItem('lume_admin_token');
    if (stored && token) {
      setAdmin(JSON.parse(stored));
      // Verify token is still valid in the background
      api
        .get('/admin/auth/me')
        .then((res) => setAdmin(res.data.data))
        .catch(() => {
          localStorage.removeItem('lume_admin_token');
          localStorage.removeItem('lume_admin_user');
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/auth/login', { email, password });
    const data = res.data.data;
    localStorage.setItem('lume_admin_token', data.token);
    localStorage.setItem('lume_admin_user', JSON.stringify(data));
    setAdmin(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lume_admin_token');
    localStorage.removeItem('lume_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
