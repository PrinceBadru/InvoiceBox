import { useState } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { fmtCurrency } from '../utils/helpers.jsx';
import { CATEGORIES, CURRENCIES } from '../data/seed.js';

export default function NewInvoicePage({ setPage }) {
  const { currentUser, users, createInvoice } = useApp();
  const purchasers = users.filter(u => u.role === 'purchaser' && u.status === 'active');

  const [purchaserId, setPurchaserId] = useState(purchasers[0]?.id || '');
  const [currency,    setCurrency]    = useState('UGX');
  const [dueDate,     setDueDate]     = useState('');
  const [items,       setItems]       = useState([{ desc: '', category: CATEGORIES[0], qty: 1, unit: 0 }]);
  const [errors,      setErrors]      = useState({});
  const [done,        setDone]        = useState(null);

  const total = items.reduce((s, i) => s + (i.qty || 0) * (i.unit || 0), 0);

  const addItem    = () => setItems(prev => [...prev, { desc: '', category: CATEGORIES[0], qty: 1, unit: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) => setItems(prev => prev.map((item, i) =>
    i !== idx ? item : { ...item, [field]: field === 'qty' || field === 'unit' ? (parseFloat(val) || 0) : val }
  ));

  const validate = () => {
    const errs = {};
    if (!purchaserId)    errs.purchaserId = 'Select a purchaser.';
    if (!dueDate)        errs.dueDate     = 'Set a due date.';
    items.forEach((item, i) => {
      if (!item.desc.trim()) errs[`desc${i}`] = 'Required';
      if (item.qty <= 0)     errs[`qty${i}`]  = 'Must be > 0';
      if (item.unit <= 0)    errs[`unit${i}`] = 'Must be > 0';
    });
    return errs;
  };

  const submit = (asDraft) => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const processedItems = items.map(item => ({
      ...item,
      total: parseFloat((item.qty * item.unit).toFixed(2)),
    }));

    const invoice = createInvoice({
      providerId:  currentUser.id,
      purchaserId,
      issueDate:   new Date().toISOString().slice(0, 10),
      dueDate,
      currency,
      status:      asDraft ? 'DRAFT' : 'PENDING',
      items:       processedItems,
    });
    setDone(invoice);
  };

  if (done) return (
    <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>✓</div>
      <h2 style={{ marginBottom: 8 }}>Invoice {done.status === 'DRAFT' ? 'saved as draft' : 'assigned!'}</h2>
      <p style={{ marginBottom: 4 }}><strong>{done.ref}</strong> has been created.</p>
      {done.status === 'PENDING' && <p>The purchaser has been notified.</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28 }}>
        <button className="btn btn-primary" onClick={() => setPage('invoices')}>View all invoices</button>
        <button className="btn" onClick={() => { setDone(null); setItems([{ desc: '', category: CATEGORIES[0], qty: 1, unit: 0 }]); setDueDate(''); setErrors({}); }}>Create another</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="section-header">
        <h2>Create new invoice</h2>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 16 }}>Invoice details</h3>
        <div className="card-grid-3">
          <div>
            <label>Assign to purchaser</label>
            <select className="select" value={purchaserId} onChange={e => { setPurchaserId(e.target.value); setErrors(p => ({ ...p, purchaserId: '' })); }}>
              {purchasers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.purchaserId && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 3 }}>{errors.purchaserId}</div>}
          </div>
          <div>
            <label>Currency</label>
            <select className="select" value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Due date</label>
            <input className="input" type="date" value={dueDate} onChange={e => { setDueDate(e.target.value); setErrors(p => ({ ...p, dueDate: '' })); }}
              min={new Date().toISOString().slice(0, 10)} />
            {errors.dueDate && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 3 }}>{errors.dueDate}</div>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Line items</h3>
          <button className="btn btn-sm" onClick={addItem}>+ Add item</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Description','Category','Qty','Unit price','Total',''].map(h => (
                  <th key={h} style={{ padding: '8px 8px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-3)', background: 'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 6px', width: '35%' }}>
                    <input className="input" value={item.desc} onChange={e => updateItem(idx, 'desc', e.target.value)} placeholder="Describe item or service" />
                    {errors[`desc${idx}`] && <div style={{ color: 'var(--red)', fontSize: 10 }}>{errors[`desc${idx}`]}</div>}
                  </td>
                  <td style={{ padding: '6px 6px', width: '22%' }}>
                    <select className="select" value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 6px', width: '10%' }}>
                    <input className="input" type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} />
                    {errors[`qty${idx}`] && <div style={{ color: 'var(--red)', fontSize: 10 }}>{errors[`qty${idx}`]}</div>}
                  </td>
                  <td style={{ padding: '6px 6px', width: '15%' }}>
                    <input className="input" type="number" min="0" step="0.01" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} />
                    {errors[`unit${idx}`] && <div style={{ color: 'var(--red)', fontSize: 10 }}>{errors[`unit${idx}`]}</div>}
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 13 }}>
                    {fmtCurrency(item.qty * item.unit, currency)}
                  </td>
                  <td style={{ padding: '6px 6px' }}>
                    {items.length > 1 && (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(idx)} style={{ color: 'var(--red)' }}>×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 10px 2px', borderTop: '1px solid var(--border)', marginTop: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            Total: <span style={{ color: 'var(--blue)' }}>{fmtCurrency(total, currency)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => setPage('invoices')}>Cancel</button>
        <button className="btn" onClick={() => submit(true)}>Save as draft</button>
        <button className="btn btn-primary" onClick={() => submit(false)}>Assign to purchaser</button>
      </div>
    </div>
  );
}
