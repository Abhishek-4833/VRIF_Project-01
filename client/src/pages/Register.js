import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [f, setF] = useState({ name:'', email:'', password:'', confirm:'', storeName:'', role:'admin' });
  const [err, setErr] = useState({});
  const [loading, setL] = useState(false);
  const { register }    = useAuth();
  const navigate        = useNavigate();

  const set = k => e => { setF(p => ({ ...p, [k]: e.target.value })); setErr(p => ({ ...p, [k]: '' })); };

  const submit = async e => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim())   er.name = 'Name is required';
    if (!f.email.trim())  er.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(f.email)) er.email = 'Enter a valid email';
    if (!f.password)      er.password = 'Password is required';
    else if (f.password.length < 6) er.password = 'Minimum 6 characters';
    if (f.password !== f.confirm) er.confirm = 'Passwords do not match';
    if (Object.keys(er).length) return setErr(er);
    setL(true);
    try {
      const { confirm, ...payload } = f;
      const d = await register(payload);
      if (d.success) { toast.success('Account created! 🎉'); navigate('/'); }
    } catch (ex) {
      const msg = ex.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErr({ email: msg });
    } finally { setL(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div>
          <div style={{ fontSize: '3rem' }}>⚡</div>
          <h1>Start for Free</h1>
          <p>Create your account and manage your cloth store billing in minutes.</p>
          <div className="auth-feats">
            {[['✅','Free to get started'],['🔒','Secure JWT + MongoDB'],['⚡','Instant bill generation'],['📱','Mobile responsive']].map(([i,t]) => (
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
            <p>Create your account</p>
          </div>

          <h3>Register</h3>
          <p className="auth-sub">Fill in the details to get started</p>

          <form onSubmit={submit} noValidate>
            <div className="row2">
              <div className="fg">
                <label className="fl">Full Name *</label>
                <input className="fi" placeholder="John Doe" value={f.name} onChange={set('name')} autoFocus />
                {err.name && <p className="ferr">⚠ {err.name}</p>}
              </div>
              <div className="fg">
                <label className="fl">Store Name</label>
                <input className="fi" placeholder="My Cloth Store" value={f.storeName} onChange={set('storeName')} />
              </div>
            </div>
            <div className="fg">
              <label className="fl">Email Address *</label>
              <input className="fi" type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} />
              {err.email && <p className="ferr">⚠ {err.email}</p>}
            </div>
            <div className="fg">
              <label className="fl">Role</label>
              <select className="fs" value={f.role} onChange={set('role')}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            <div className="row2">
              <div className="fg">
                <label className="fl">Password *</label>
                <input className="fi" type="password" placeholder="Min 6 chars" value={f.password} onChange={set('password')} />
                {err.password && <p className="ferr">⚠ {err.password}</p>}
              </div>
              <div className="fg">
                <label className="fl">Confirm *</label>
                <input className="fi" type="password" placeholder="Re-enter" value={f.confirm} onChange={set('confirm')} />
                {err.confirm && <p className="ferr">⚠ {err.confirm}</p>}
              </div>
            </div>
            <button type="submit" className="btn btn-p btn-fw btn-lg" disabled={loading}>
              {loading ? '⏳ Creating…' : '✨ Create Account'}
            </button>
          </form>

          <div className="auth-foot">Already have an account? <Link to="/login">Sign In</Link></div>
        </div>
      </div>
    </div>
  );
}
