import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [f, setF]         = useState({ email: '', password: '' });
  const [err, setErr]     = useState({});
  const [loading, setL]   = useState(false);
  const { login }         = useAuth();
  const navigate          = useNavigate();

  const set = k => e => { setF(p => ({ ...p, [k]: e.target.value })); setErr(p => ({ ...p, [k]: '' })); };

  const submit = async e => {
    e.preventDefault();
    const er = {};
    if (!f.email)    er.email    = 'Email is required';
    if (!f.password) er.password = 'Password is required';
    if (Object.keys(er).length) return setErr(er);
    setL(true);
    try {
      const d = await login(f.email.trim(), f.password);
      if (d.success) { toast.success(`Welcome back, ${d.user.name}! 👋`); navigate('/'); }
    } catch (ex) {
      const msg = ex.response?.data?.message || 'Login failed';
      toast.error(msg);
      msg.toLowerCase().includes('password') ? setErr({ password: msg }) : setErr({ email: msg });
    } finally { setL(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div>
          <div style={{ fontSize: '3rem' }}>⚡</div>
          <h1>Electro Bill Flow</h1>
          <p>Complete billing management for your cloth store. Track items, generate bills, manage discount & tax — all in one place.</p>
          <div className="auth-feats">
            {[['👕','Manage cloth store inventory'],['🧾','Generate professional bills'],['💰','Discount & Tax auto-calculation'],['📊','Real-time dashboard analytics']].map(([i,t]) => (
              <div className="auth-feat" key={t}><span>{i}</span><span>{t}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="ico">⚡</div>
            <h2>Electro Bill Flow</h2>
            <p>Cloth Store Billing System</p>
          </div>

          <h3>Sign In</h3>
          <p className="auth-sub">Enter your credentials to continue</p>

          <form onSubmit={submit} noValidate>
            <div className="fg">
              <label className="fl">Email Address</label>
              <input className="fi" type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} autoFocus />
              {err.email && <p className="ferr">⚠ {err.email}</p>}
            </div>
            <div className="fg">
              <label className="fl">Password</label>
              <input className="fi" type="password" placeholder="Enter password" value={f.password} onChange={set('password')} />
              {err.password && <p className="ferr">⚠ {err.password}</p>}
            </div>
            <button type="submit" className="btn btn-p btn-fw btn-lg" disabled={loading}>
              {loading ? '⏳ Signing in…' : '🔐 Sign In'}
            </button>
          </form>

          <div className="auth-foot">Don't have an account? <Link to="/register">Create Account</Link></div>
          <div className="demo-box"><strong>Note:</strong> Register a new account or use credentials you already registered with MongoDB.</div>
        </div>
      </div>
    </div>
  );
}
