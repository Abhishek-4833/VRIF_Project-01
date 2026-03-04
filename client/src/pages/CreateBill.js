import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CreateBill() {
  const nav = useNavigate();
  const [allItems, setAI]  = useState([]);
  const [cust, setCust]    = useState({ name:'', phone:'', email:'', address:'' });
  const [rows, setRows]    = useState([{ itemId:'', quantity:1 }]);
  const [pMethod, setPM]   = useState('Cash');
  const [pStatus, setPS]   = useState('Paid');
  const [paid, setPaid]    = useState('');
  const [notes, setNotes]  = useState('');
  const [busy, setBusy]    = useState(false);
  const [iLoad, setILoad]  = useState(true);

  useEffect(() => { axios.get('/api/items').then(r=>{setAI(r.data.items);setILoad(false);}).catch(console.error); }, []);

  const gi  = id => allItems.find(i=>i._id===id);
  const sc  = k => e => setCust(p=>({...p,[k]:e.target.value}));
  const add = ()  => setRows(p=>[...p,{itemId:'',quantity:1}]);
  const rm  = i  => setRows(p=>p.filter((_,idx)=>idx!==i));
  const ur  = (i,k,v) => setRows(p=>p.map((r,idx)=>idx===i?{...r,[k]:v}:r));

  const calc = row => {
    const it = gi(row.itemId); if (!it||!row.quantity) return {sub:0,da:0,ta:0,tot:0};
    const q=+row.quantity, sub=it.price*q, da=(sub*it.discount)/100, ad=sub-da, ta=(ad*it.tax)/100;
    return {sub,da,ta,tot:ad+ta};
  };

  const subTotal  = rows.reduce((s,r)=>s+calc(r).sub,0);
  const totDisc   = rows.reduce((s,r)=>s+calc(r).da,0);
  const totTax    = rows.reduce((s,r)=>s+calc(r).ta,0);
  const grand     = subTotal-totDisc+totTax;

  const submit = async e => {
    e.preventDefault();
    if (!cust.name.trim()) return toast.error('Customer name is required');
    const valid = rows.filter(r=>r.itemId&&r.quantity>0);
    if (!valid.length) return toast.error('Add at least one item');
    for (const r of valid) { const it=gi(r.itemId); if(it&&it.quantity<r.quantity){toast.error(`Insufficient stock for "${it.itemName}" (available: ${it.quantity})`);return;} }
    setBusy(true);
    try {
      const { data } = await axios.post('/api/bills',{customer:cust,items:valid.map(r=>({itemId:r.itemId,quantity:+r.quantity})),paymentMethod:pMethod,paymentStatus:pStatus,amountPaid:paid?+paid:0,notes});
      toast.success(`🧾 ${data.bill.billNo} created!`);
      nav('/bills');
    } catch(ex){toast.error(ex.response?.data?.message||'Failed to create bill');}
    finally{setBusy(false);}
  };

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">🧾 Create New Bill</div><div className="ps">Add customer details and select items</div></div>
        <button className="btn btn-gh" onClick={()=>nav('/bills')}>← Back</button>
      </div>

      <form onSubmit={submit}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>
          {/* Customer */}
          <div className="card">
            <div className="card-h"><h3>👤 Customer Details</h3></div>
            <div className="card-b">
              <div className="fg"><label className="fl">Customer Name *</label><input className="fi" placeholder="Full name" required value={cust.name} onChange={sc('name')} /></div>
              <div className="row2">
                <div className="fg"><label className="fl">Phone</label><input className="fi" placeholder="+91 98765 43210" value={cust.phone} onChange={sc('phone')} /></div>
                <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="email@example.com" value={cust.email} onChange={sc('email')} /></div>
              </div>
              <div className="fg"><label className="fl">Address</label><textarea className="fta" placeholder="Optional address…" style={{minHeight:56}} value={cust.address} onChange={sc('address')} /></div>
            </div>
          </div>
          {/* Payment */}
          <div className="card">
            <div className="card-h"><h3>💳 Payment</h3></div>
            <div className="card-b">
              <div className="row2">
                <div className="fg"><label className="fl">Method</label><select className="fs" value={pMethod} onChange={e=>setPM(e.target.value)}>{['Cash','Card','UPI','Bank Transfer','Other'].map(m=><option key={m}>{m}</option>)}</select></div>
                <div className="fg"><label className="fl">Status</label><select className="fs" value={pStatus} onChange={e=>setPS(e.target.value)}>{['Paid','Pending','Partial'].map(s=><option key={s}>{s}</option>)}</select></div>
              </div>
              {pStatus==='Partial'&&<div className="fg"><label className="fl">Amount Paid (₹)</label><input className="fi" type="number" min="0" step="0.01" placeholder="0.00" value={paid} onChange={e=>setPaid(e.target.value)} /></div>}
              <div className="fg"><label className="fl">Notes</label><textarea className="fta" placeholder="Any note about this bill…" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card" style={{marginBottom:18}}>
          <div className="card-h"><h3>🛒 Bill Items</h3><button type="button" className="btn btn-out btn-sm" onClick={add}>+ Add Row</button></div>
          <div className="card-b">
            {/* Header */}
            <div className="bill-hd"><span>Item</span><span>Qty</span><span>Unit Price</span><span>Discount</span><span>Tax</span><span>Row Total</span><span/></div>

            {iLoad ? <div style={{padding:'18px 0',textAlign:'center',color:'var(--g5)'}}>Loading items…</div> : rows.map((row,i) => {
              const it=gi(row.itemId), c=calc(row);
              return (
                <div className="bill-row" key={i}>
                  <div>
                    <select className="fs" value={row.itemId} onChange={e=>ur(i,'itemId',e.target.value)}>
                      <option value="">— Select Item —</option>
                      {allItems.map(it=><option key={it._id} value={it._id}>[{it.itemNo}] {it.itemName} (Stock:{it.quantity})</option>)}
                    </select>
                    {it&&<div className="muted" style={{fontSize:'.73rem',marginTop:2}}>{it.category}{it.brand?` · ${it.brand}`:''}{it.size?` · ${it.size}`:''}</div>}
                  </div>
                  <input className="fi" type="number" min="1" max={it?.quantity||999} value={row.quantity} onChange={e=>ur(i,'quantity',e.target.value)} />
                  <div style={{fontSize:'.86rem',fontWeight:600,paddingTop:7}}>{it?`₹${it.price.toFixed(2)}`:'—'}</div>
                  <div style={{fontSize:'.82rem',paddingTop:7}}>{it&&it.discount>0?<><span className="bd bd-or">{it.discount}%</span><br/><small>-₹{c.da.toFixed(2)}</small></>:<span className="muted">—</span>}</div>
                  <div style={{fontSize:'.82rem',paddingTop:7}}>{it&&it.tax>0?<><span className="bd bd-bl">{it.tax}%</span><br/><small>+₹{c.ta.toFixed(2)}</small></>:<span className="muted">—</span>}</div>
                  <div style={{fontSize:'.93rem',fontWeight:700,color:'var(--p)',paddingTop:7}}>{it?`₹${c.tot.toFixed(2)}`:'—'}</div>
                  <button type="button" style={{background:'#ffebee',border:'none',borderRadius:6,width:30,height:30,cursor:'pointer',color:'#b71c1c',fontSize:'.95rem'}} onClick={()=>rm(i)} disabled={rows.length===1}>✕</button>
                </div>
              );
            })}

            {/* Summary */}
            <div className="sumbox">
              <div className="sumrow"><span className="sum-lbl">Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
              <div className="sumrow"><span className="sum-lbl" style={{color:'var(--ok)'}}>Total Discount</span><span style={{color:'var(--ok)'}}>- ₹{totDisc.toFixed(2)}</span></div>
              <div className="sumrow"><span className="sum-lbl" style={{color:'var(--p)'}}>Total Tax / GST</span><span style={{color:'var(--p)'}}>+ ₹{totTax.toFixed(2)}</span></div>
              <div className="sumrow sum-grand"><span>Grand Total</span><span>₹{grand.toFixed(2)}</span></div>
              {pStatus==='Partial'&&paid&&<div className="sumrow"><span className="sum-lbl">Balance Due</span><span style={{color:'var(--err)',fontWeight:700}}>₹{(grand-+paid).toFixed(2)}</span></div>}
            </div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
          <button type="button" className="btn btn-gh btn-lg" onClick={()=>nav('/bills')}>Cancel</button>
          <button type="submit" className="btn btn-p btn-lg" disabled={busy}>{busy?'⏳ Generating…':'🧾 Generate Bill'}</button>
        </div>
      </form>
    </div>
  );
}
