import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SB = { Paid: 'bd-gr', Pending: 'bd-or', Partial: 'bd-bl' };
const R  = n => '₹' + (n||0).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 });

export default function Dashboard() {
  const { user }          = useAuth();
  const [stats, setStats] = useState(null);
  const [bills, setBills] = useState([]);
  const [busy,  setBusy]  = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/bills/stats'), axios.get('/api/bills?limit=8')])
      .then(([s, b]) => { setStats(s.data.stats); setBills(b.data.bills); })
      .catch(console.error)
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <div className="loader"><div className="spin"/></div>;

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">📊 Dashboard</div><div className="ps">Welcome, {user?.name} · {user?.storeName||'My Cloth Store'}</div></div>
        <Link to="/bills/new" className="btn btn-p">➕ New Bill</Link>
      </div>

      <div className="stats">
        {[
          ['ico-pu','👕','Total Items',  stats?.totalItems??0,         false],
          ['ico-bl','🧾','Total Bills',  stats?.totalBills??0,         false],
          ['ico-gr','💰','Revenue',      R(stats?.totalRevenue),       false],
          ['ico-or','⏳','Pending Bills',stats?.pendingCount??0,       false],
          ['ico-te','📅','Today Sales',  R(stats?.todayRevenue),       false],
        ].map(([cls, ico, lbl, val]) => (
          <div className="sc" key={lbl}>
            <div className={`sc-ico ${cls}`}>{ico}</div>
            <div><div className="sc-lbl">{lbl}</div><div className="sc-val">{val}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-h">
          <h3>🧾 Recent Bills</h3>
          <div style={{ display:'flex', gap:8 }}>
            <Link to="/bills"     className="btn btn-gh btn-sm">View All</Link>
            <Link to="/bills/new" className="btn btn-p  btn-sm">+ New Bill</Link>
          </div>
        </div>
        <div className="tbl-wrap">
          {bills.length === 0 ? (
            <div className="empty">
              <div className="empty-ico">🧾</div>
              <h4>No bills yet</h4>
              <p><Link to="/bills/new">Create your first bill</Link></p>
            </div>
          ) : (
            <table>
              <thead><tr>
                <th>Bill No</th><th>Customer</th><th>Phone</th><th>Items</th>
                <th>Grand Total</th><th>Payment</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td><span className="ino">{b.billNo}</span></td>
                    <td className="fw7">{b.customer?.name}</td>
                    <td className="muted">{b.customer?.phone||'—'}</td>
                    <td><span className="bd bd-pu">{b.items?.length} item(s)</span></td>
                    <td className="fw7">{R(b.grandTotal)}</td>
                    <td>{b.paymentMethod}</td>
                    <td><span className={`bd ${SB[b.paymentStatus]||'bd-gy'}`}>{b.paymentStatus}</span></td>
                    <td className="muted">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
