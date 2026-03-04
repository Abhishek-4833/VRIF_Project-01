import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SB = { Paid:'bd-gr', Pending:'bd-or', Partial:'bd-bl' };
const R  = n => '₹'+(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});

function ViewModal({ bill, onClose, onRefresh }) {
  const [upd, setUpd] = useState(false);

  const markAs = async status => {
    setUpd(true);
    try {
      await axios.put(`/api/bills/${bill._id}/status`,{paymentStatus:status,amountPaid:status==='Paid'?bill.grandTotal:bill.amountPaid});
      toast.success(`Marked as ${status}`); onRefresh(); onClose();
    } catch { toast.error('Update failed'); } finally { setUpd(false); }
  };

  return (
    <div className="mbd" onClick={onClose}>
      <div className="mo mo-xl" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="bill-vhd">
          <div><div style={{fontSize:'1.35rem',fontWeight:800}}>⚡ Electro Bill Flow</div><div style={{opacity:.68,fontSize:'.82rem',marginTop:4}}>Cloth Store Billing Management</div></div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'1.2rem',fontWeight:800}}>{bill.billNo}</div>
            <div style={{opacity:.7,fontSize:'.8rem',marginTop:3}}>{new Date(bill.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div>
            <span className={`bd ${SB[bill.paymentStatus]||'bd-gy'}`} style={{marginTop:6,display:'inline-block'}}>{bill.paymentStatus}</span>
          </div>
        </div>

        <div style={{padding:22}}>
          {/* Info */}
          <div className="bill-ig">
            <div className="bill-ib">
              <h5>Customer</h5>
              <p className="fw7">{bill.customer?.name}</p>
              {bill.customer?.phone   && <p>📞 {bill.customer.phone}</p>}
              {bill.customer?.email   && <p>✉️ {bill.customer.email}</p>}
              {bill.customer?.address && <p>📍 {bill.customer.address}</p>}
            </div>
            <div className="bill-ib">
              <h5>Bill Info</h5>
              <p><strong>Bill No:</strong> {bill.billNo}</p>
              <p><strong>Payment:</strong> {bill.paymentMethod}</p>
              <p><strong>Status:</strong> <span className={`bd ${SB[bill.paymentStatus]||'bd-gy'}`}>{bill.paymentStatus}</span></p>
              {bill.notes && <p style={{marginTop:6,fontSize:'.8rem',color:'var(--g5)'}}>📝 {bill.notes}</p>}
            </div>
          </div>

          {/* Items table */}
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>#</th><th>Item No</th><th>Item Name</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Tax</th><th>Total</th></tr></thead>
              <tbody>
                {bill.items?.map((it,i)=>(
                  <tr key={i}>
                    <td className="muted">{i+1}</td>
                    <td><span className="ino">{it.itemNo}</span></td>
                    <td className="fw7">{it.itemName}</td>
                    <td><span className="bd bd-pu">{it.category}</span></td>
                    <td>{it.quantity}</td>
                    <td>{R(it.unitPrice)}</td>
                    <td>{it.discount>0?<><span className="bd bd-or">{it.discount}%</span> <small>(-{R(it.discountAmt)})</small></>:<span className="muted">—</span>}</td>
                    <td>{it.tax>0?<><span className="bd bd-bl">{it.tax}%</span> <small>(+{R(it.taxAmt)})</small></>:<span className="muted">—</span>}</td>
                    <td className="fw7" style={{color:'var(--p)'}}>{R(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
            <div className="sumbox" style={{width:330}}>
              <div className="sumrow"><span className="sum-lbl">Sub Total</span><span>{R(bill.subTotal)}</span></div>
              <div className="sumrow"><span className="sum-lbl" style={{color:'var(--ok)'}}>Discount</span><span style={{color:'var(--ok)'}}>- {R(bill.totalDiscount)}</span></div>
              <div className="sumrow"><span className="sum-lbl" style={{color:'var(--p)'}}>Tax / GST</span><span style={{color:'var(--p)'}}>+ {R(bill.totalTax)}</span></div>
              <div className="sumrow sum-grand"><span>Grand Total</span><span>{R(bill.grandTotal)}</span></div>
              {bill.amountPaid>0&&bill.paymentStatus!=='Paid'&&<div className="sumrow"><span className="sum-lbl">Paid</span><span>{R(bill.amountPaid)}</span></div>}
              {bill.paymentStatus==='Partial'&&<div className="sumrow"><span style={{color:'var(--err)'}}>Balance Due</span><span style={{color:'var(--err)',fontWeight:700}}>{R(bill.grandTotal-(bill.amountPaid||0))}</span></div>}
            </div>
          </div>
        </div>

        <div className="mo-f" style={{justifyContent:'space-between'}}>
          <div style={{display:'flex',gap:8}}>
            {bill.paymentStatus!=='Paid'&&<button className="btn btn-ok btn-sm" onClick={()=>markAs('Paid')} disabled={upd}>✅ Mark Paid</button>}
            {bill.paymentStatus==='Paid'&&<button className="btn btn-gh btn-sm" onClick={()=>markAs('Pending')} disabled={upd}>⏳ Mark Pending</button>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-gh btn-sm" onClick={()=>window.print()}>🖨️ Print</button>
            <button className="btn btn-p btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [busy, setBusy]   = useState(true);
  const [view, setView]   = useState(null);
  const [search, setS]    = useState('');
  const [status, setSt]   = useState('');
  const [del, setDel]     = useState(null);

  const load = useCallback(async () => {
    try {
      const p={}; if(search) p.search=search; if(status) p.status=status;
      const {data} = await axios.get('/api/bills',{params:p});
      setBills(data.bills);
    } catch { toast.error('Failed to load bills'); } finally { setBusy(false); }
  }, [search, status]);

  useEffect(()=>{load();},[load]);

  const remove = async bill => {
    if(!window.confirm(`Delete bill "${bill.billNo}"?`)) return;
    setDel(bill._id);
    try { await axios.delete(`/api/bills/${bill._id}`); toast.success('Bill deleted'); load(); }
    catch { toast.error('Delete failed'); } finally { setDel(null); }
  };

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">🧾 Bills</div><div className="ps">View and manage all customer bills</div></div>
        <Link to="/bills/new" className="btn btn-p">➕ New Bill</Link>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>All Bills <span className="bd bd-pu" style={{marginLeft:6}}>{bills.length}</span></h3>
          <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
            <div className="srch"><span className="si">🔍</span><input className="fi srch-inp" placeholder="Search bill no, customer…" value={search} onChange={e=>setS(e.target.value)} /></div>
            <select className="fs" style={{width:130}} value={status} onChange={e=>setSt(e.target.value)}>
              <option value="">All Status</option><option>Paid</option><option>Pending</option><option>Partial</option>
            </select>
          </div>
        </div>

        <div className="tbl-wrap">
          {busy ? <div className="loader" style={{minHeight:200}}><div className="spin"/></div>
          : bills.length===0 ? (
            <div className="empty"><div className="empty-ico">🧾</div><h4>No bills found</h4>
              <p>{search||status?'Try different filters.':'Start creating bills!'}</p>
              <Link to="/bills/new" className="btn btn-p mt">➕ Create First Bill</Link>
            </div>
          ) : (
            <table>
              <thead><tr>
                <th>#</th><th>Bill No</th><th>Customer Name</th><th>Phone</th>
                <th>Items</th><th>Sub Total</th><th>Discount</th><th>Tax</th>
                <th>Grand Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {bills.map((b,i)=>(
                  <tr key={b._id}>
                    <td className="muted">{i+1}</td>
                    <td><span className="ino">{b.billNo}</span></td>
                    <td className="fw7">{b.customer?.name}</td>
                    <td className="muted">{b.customer?.phone||'—'}</td>
                    <td><span className="bd bd-pu">{b.items?.length}</span></td>
                    <td>₹{b.subTotal?.toFixed(2)}</td>
                    <td><span className="bd bd-or">-₹{b.totalDiscount?.toFixed(2)}</span></td>
                    <td><span className="bd bd-bl">+₹{b.totalTax?.toFixed(2)}</span></td>
                    <td className="fw7" style={{color:'var(--p)'}}>₹{b.grandTotal?.toFixed(2)}</td>
                    <td>{b.paymentMethod}</td>
                    <td><span className={`bd ${SB[b.paymentStatus]||'bd-gy'}`}>{b.paymentStatus}</span></td>
                    <td className="muted">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><div className="actions-cell">
                      <button className="btn btn-out btn-xs" onClick={()=>setView(b)}>👁️ View</button>
                      <button className="btn btn-err btn-xs" disabled={del===b._id} onClick={()=>remove(b)}>{del===b._id?'…':'🗑️'}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {view && <ViewModal bill={view} onClose={()=>setView(null)} onRefresh={load} />}
    </div>
  );
}
