import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = t => {
    if (t) { localStorage.setItem('ebf_tok', t); axios.defaults.headers.common['Authorization'] = `Bearer ${t}`; }
    else   { localStorage.removeItem('ebf_tok');  delete axios.defaults.headers.common['Authorization']; }
  };

  useEffect(() => {
    (async () => {
      const tok = localStorage.getItem('ebf_tok');
      if (tok) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
        try { const { data } = await axios.get('/api/auth/me'); setUser(data.user); }
        catch { setToken(null); }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    if (data.success) { setToken(data.token); setUser(data.user); }
    return data;
  };

  const register = async (payload) => {
    const { data } = await axios.post('/api/auth/register', payload);
    if (data.success) { setToken(data.token); setUser(data.user); }
    return data;
  };

  const logout = () => { setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
