import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Items      from './pages/Items';
import Bills      from './pages/Bills';
import CreateBill from './pages/CreateBill';
import Navbar     from './components/Navbar';
import './styles.css';

const Private = ({ children }) => { const { user, loading } = useAuth(); if (loading) return <div className="loader"><div className="spin"/></div>; return user ? children : <Navigate to="/login" replace />; };
const Public  = ({ children }) => { const { user, loading } = useAuth(); if (loading) return <div className="loader"><div className="spin"/></div>; return !user ? children : <Navigate to="/" replace />; };

function Inner() {
  const { user } = useAuth();
  return <>
    {user && <Navbar />}
    <Routes>
      <Route path="/login"    element={<Public><Login /></Public>} />
      <Route path="/register" element={<Public><Register /></Public>} />
      <Route path="/"         element={<Private><Dashboard /></Private>} />
      <Route path="/items"    element={<Private><Items /></Private>} />
      <Route path="/bills"    element={<Private><Bills /></Private>} />
      <Route path="/bills/new" element={<Private><CreateBill /></Private>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter,sans-serif', borderRadius: 10, fontSize: '0.88rem' } }} />
        <Inner />
      </BrowserRouter>
    </AuthProvider>
  );
}
