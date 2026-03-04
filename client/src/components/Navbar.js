import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();

  const doLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  return (
    <nav className="nav">
      <div className="nav-brand">⚡ Electro Bill Flow</div>
      <div className="nav-links">
        {[['/', '📊', 'Dashboard'], ['/items', '👕', 'Items'], ['/bills', '🧾', 'Bills']].map(([to, ico, lbl]) => (
          <Link key={to} to={to} className={`nav-lnk${pathname === to ? ' act' : ''}`}>{ico} {lbl}</Link>
        ))}
      </div>
      <div className="nav-r">
        <div className="nav-user">
          <div className="nav-av">👤</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.82rem', color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: '.7rem', opacity: .65 }}>{user?.storeName || user?.role}</div>
          </div>
        </div>
        <button className="btn-lo" onClick={doLogout}>🚪 Logout</button>
      </div>
    </nav>
  );
}
