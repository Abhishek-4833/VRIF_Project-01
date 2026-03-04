import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATS = ['Shirts','T-Shirts','Pants','Jeans','Kurtas','Sarees','Lehengas','Suits','Jackets','Blazers','Accessories','Kids Wear','Sportswear','Other'];
const EF   = { itemNo:'', itemName:'', category:'Shirts', quantity:0, price:0, discount:0, tax:0, brand:'', size:'', color:'', description:'' };

function ItemModal({ item, onClose, onSaved }) {
  const [f, setF]     = useState(item ? { ...item } : { ...EF });
  const [busy, setBusy] = useState(false);

  const s  = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const sn = k => e => setF(p => ({ ...p, [k]: parseFloat(e.target.value)||0 }));

  const ad  = f.price - (f.price * f.discount) / 100;
  const fp  = ad + (ad * f.tax) / 100;

  const submit = async e => {
    e.preventDefault();
    if (!f.itemNo.trim())   return toast.error('Item number is required');
    if (!f.itemName.trim()) return toast.error('Item name is required');
    if (f.price <= 0)       return toast.error('Price must be > 0');
    setBusy(true);
    try {
      item ? await axios.put(`/api/items/${item._id}`, f) : await axios.post('/api/items', f);
      toast.success(item ? 'Item updated ✅' : 'Item added ✅');
      onSaved();
    } catch (ex) {
      toast.error(ex.response?.data?.message || 'Failed to save');
    } finally { setBusy(false); }
  };

  return (
    <div className="mbd" onClick={onClose}>
      <div className="mo" onClick={e => e.stopPropagation()}>
        <div className="mo-h">
          <h3>{item ? '✏️ Edit Item' : '➕ Add New Item'}</h3>
          <button className="btn-x" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="mo-b">
            {/* Item No + Name */}
            <div className="row2">
              <div className="fg"><label className="fl">Item No *</label><input className="fi" placeholder="CLT-001" value={f.itemNo} onChange={s('itemNo')} required /></div>
              <div className="fg"><label className="fl">Item Name *</label><input className="fi" placeholder="Blue Denim Shirt" value={f.itemName} onChange={s('itemName')} required /></div>
            </div>
            {/* Category + Brand */}
            <div className="row2">
              <div className="fg"><label className="fl">Category *</label><select className="fs" value={f.category} onChange={s('category')}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fg"><label className="fl">Brand</label><input className="fi" placeholder="Raymond, Arrow…" value={f.brand} onChange={s('brand')} /></div>
            </div>
            {/* Size + Color */}
            <div className="row2">
              <div className="fg"><label className="fl">Size</label><input className="fi" placeholder="S/M/L/XL/Free" value={f.size} onChange={s('size')} /></div>
              <div className="fg"><label className="fl">Color</label><input className="fi" placeholder="Blue, Red…" value={f.color} onChange={s('color')} /></div>
            </div>
            <div className="sep"/>
            {/* Qty + Price */}
            <div className="row2">
              <div className="fg"><label className="fl">Quantity *</label><input className="fi" type="number" min="0" value={f.quantity} onChange={sn('quantity')} required /></div>
              <div className="fg"><label className="fl">Unit Price (₹) *</label><input className="fi" type="number" min="0" step="0.01" value={f.price} onChange={sn('price')} required /></div>
            </div>
            {/* Discount + Tax */}
            <div className="row2">
              <div className="fg"><label className="fl">Discount (%)</label><input className="fi" type="number" min="0" max="100" step="0.01" value={f.discount} onChange={sn('discount')} /></div>
              <div className="fg"><label className="fl">Tax / GST (%)</label><input className="fi" type="number" min="0" step="0.01" value={f.tax} onChange={sn('tax')} /></div>
            </div>
            {/* Price preview */}
            {f.price > 0 && (
              <div className="price-tip">
                💡 ₹{f.price.toFixed(2)}
                {f.discount>0 && <> → after {f.discount}% off: <strong>₹{ad.toFixed(2)}</strong></>}
                {f.tax>0 && <> → with {f.tax}% tax: <strong>₹{fp.toFixed(2)}</strong></>}
              </div>
            )}
            {/* Description */}
            <div className="fg mt"><label className="fl">Description</label><textarea className="fta" placeholder="Optional description…" value={f.description} onChange={s('description')} /></div>
          </div>
          <div className="mo-f">
            <button type="button" className="btn btn-gh" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-p" disabled={busy}>{busy ? '⏳ Saving…' : item ? '✅ Update' : '➕ Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Items() {
  const [items, setItems] = useState([]);
  const [busy, setBusy]   = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setS]    = useState('');
  const [cat, setCat]     = useState('');
  const [del, setDel]     = useState(null);

  const load = useCallback(async () => {
    try {
      const p = {}; if (search) p.search = search; if (cat) p.category = cat;
      const { data } = await axios.get('/api/items', { params: p });
      setItems(data.items);
    } catch { toast.error('Failed to load items'); } finally { setBusy(false); }
  }, [search, cat]);

  useEffect(() => { load(); }, [load]);

  const remove = async item => {
    if (!window.confirm(`Delete "${item.itemName}"?`)) return;
    setDel(item._id);
    try { await axios.delete(`/api/items/${item._id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); } finally { setDel(null); }
  };

  const fp = i => { const a = i.price - i.price*i.discount/100; return a + a*i.tax/100; };
  const sc = q => q===0 ? 'stk-out' : q<=5 ? 'stk-lo' : 'stk-ok';
  const sl = q => q===0 ? 'Out of Stock' : q<=5 ? `Low (${q})` : q;

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">👕 Cloth Store Items</div><div className="ps">Manage inventory — Item No, Name, Qty, Discount & Tax</div></div>
        <button className="btn btn-p" onClick={() => setModal('add')}>➕ Add Item</button>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>All Items <span className="bd bd-pu" style={{ marginLeft:6 }}>{items.length}</span></h3>
          <div style={{ display:'flex', gap:9, flexWrap:'wrap' }}>
            <div className="srch"><span className="si">🔍</span>
              <input className="fi srch-inp" placeholder="Search item no, name…" value={search} onChange={e=>setS(e.target.value)} /></div>
            <select className="fs" style={{ width:150 }} value={cat} onChange={e=>setCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="tbl-wrap">
          {busy ? <div className="loader" style={{ minHeight:200 }}><div className="spin"/></div>
          : items.length===0 ? (
            <div className="empty"><div className="empty-ico">👕</div><h4>No items found</h4>
              <p>{search||cat?'Try different filters.':'Add your first item!'}</p>
              {!search&&!cat&&<button className="btn btn-p mt" onClick={()=>setModal('add')}>➕ Add First Item</button>}
            </div>
          ) : (
            <table>
              <thead><tr>
                <th>#</th><th>Item No</th><th>Item Name</th><th>Category</th>
                <th>Brand / Size</th><th>Quantity</th><th>Unit Price</th>
                <th>Discount %</th><th>Tax %</th><th>Final Price</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {items.map((it,i) => (
                  <tr key={it._id}>
                    <td className="muted">{i+1}</td>
                    <td><span className="ino">{it.itemNo}</span></td>
                    <td><div className="fw7">{it.itemName}</div>{it.color&&<div className="muted" style={{fontSize:'.74rem'}}>🎨 {it.color}</div>}</td>
                    <td><span className="bd bd-pu">{it.category}</span></td>
                    <td className="muted">{[it.brand,it.size].filter(Boolean).join(' / ')||'—'}</td>
                    <td><span className={`bd ${sc(it.quantity)}`}>{sl(it.quantity)}</span></td>
                    <td className="fw7">₹{it.price?.toFixed(2)}</td>
                    <td>{it.discount>0?<span className="bd bd-or">{it.discount}%</span>:<span className="muted">—</span>}</td>
                    <td>{it.tax>0?<span className="bd bd-bl">{it.tax}%</span>:<span className="muted">—</span>}</td>
                    <td className="fw7" style={{color:'var(--p)'}}>₹{fp(it).toFixed(2)}</td>
                    <td><div className="actions-cell">
                      <button className="btn btn-out btn-xs" onClick={()=>setModal(it)}>✏️ Edit</button>
                      <button className="btn btn-err btn-xs" disabled={del===it._id} onClick={()=>remove(it)}>{del===it._id?'…':'🗑️'}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <ItemModal item={modal==='add'?null:modal} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load();}} />}
    </div>
  );
}
