import { useState } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { Badge, Avatar, fmtCurrency, fmtDate, isOverdue } from '../utils/helpers.jsx';

export default function InvoiceModal({ invoice, onClose }) {
  const { currentUser, users, recordPayment, declareDefault, acknowledgeInvoice, cancelInvoice } = useApp();
  const [tab,           setTab]           = useState('details');
  const [payAmt,        setPayAmt]        = useState('');
  const [payMethod,     setPayMethod]     = useState('Bank transfer');
  const [payRef,        setPayRef]        = useState('');
  const [defaultReason, setDefaultReason] = useState('');
  const [errors,        setErrors]        = useState({});

  const provider  = users.find(u => u.id === invoice.providerId);
  const purchaser = users.find(u => u.id === invoice.purchaserId);
  const overdue   = isOverdue(invoice);

  const canPay    = currentUser.role === 'purchaser' && ['PENDING','ACKNOWLEDGED','PARTIALLY PAID'].includes(invoice.status);
  const canAck    = currentUser.role === 'purchaser' && invoice.status === 'PENDING';
  const canCancel = currentUser.role === 'provider'  && ['DRAFT','PENDING'].includes(invoice.status);

  const submitPayment = () => {
    const amt = parseFloat(payAmt);
    const errs = {};
    if (!amt || amt <= 0)              errs.amt = 'Enter a valid amount.';
    if (amt > invoice.balance + 0.01)  errs.amt = `Amount exceeds balance of ${fmtCurrency(invoice.balance, invoice.currency)}.`;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    recordPayment(invoice.id, { date: new Date().toISOString().slice(0,10), amount: amt, method: payMethod, ref: payRef });
    onClose();
  };

  const submitDefault = () => {
    if (!defaultReason.trim()) { setErrors({ reason: 'Reason is required.' }); return; }
    declareDefault(invoice.id, defaultReason);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0 }}>{invoice.ref}</h2>
              <Badge status={invoice.status} />
              {overdue && <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>OVERDUE</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{invoice.id} · Issued {fmtDate(invoice.issueDate)} · Due {fmtDate(invoice.dueDate)}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 20 }}>×</button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['details','payments','actions'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'payments' && invoice.payments.length > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--blue-bg)', color: 'var(--blue-text)', fontSize: 10, padding: '1px 6px', borderRadius: 99 }}>{invoice.payments.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {tab === 'details' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 8 }}>Provider</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Avatar name={provider?.name} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{provider?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{provider?.email}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 14, background: 'var(--surface2)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 8 }}>Purchaser</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Avatar name={purchaser?.name} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{purchaser?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{purchaser?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Description','Category','Qty','Unit price','Total'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Description' || h === 'Category' ? 'left' : 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-3)', background: 'var(--surface2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 10px', fontSize: 13 }}>{item.desc}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-2)' }}>{item.category}</td>
                    <td style={{ padding: '9px 10px', fontSize: 13, textAlign: 'right' }}>{item.qty.toLocaleString()}</td>
                    <td style={{ padding: '9px 10px', fontSize: 13, textAlign: 'right' }}>{fmtCurrency(item.unit, invoice.currency)}</td>
                    <td style={{ padding: '9px 10px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{fmtCurrency(item.total, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: '10px 10px', background: 'var(--surface2)', borderRadius: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-2)' }}>Invoice total: <strong>{fmtCurrency(invoice.total, invoice.currency)}</strong></span>
              <span style={{ color: 'var(--text-2)' }}>Paid: <strong style={{ color: '#166534' }}>{fmtCurrency(invoice.paid, invoice.currency)}</strong></span>
              <span style={{ color: 'var(--text-2)' }}>Balance: <strong style={{ color: invoice.balance > 0 ? '#92400E' : '#166534' }}>{fmtCurrency(invoice.balance, invoice.currency)}</strong></span>
            </div>

            {invoice.defaultReason && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#991B1B' }}>
                <strong>Default reason:</strong> {invoice.defaultReason}
              </div>
            )}
          </div>
        )}

        {/* Payments tab */}
        {tab === 'payments' && (
          <div>
            {invoice.payments.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No payments recorded yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Date','Method','Reference','Amount'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-3)', background: 'var(--surface2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '9px 10px', fontSize: 13 }}>{fmtDate(p.date)}</td>
                      <td style={{ padding: '9px 10px', fontSize: 13 }}>{p.method}</td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{p.ref || '—'}</td>
                      <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 600, textAlign: 'right', color: '#166534' }}>{fmtCurrency(p.amount, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Actions tab */}
        {tab === 'actions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {canAck && (
              <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10 }}>
                <h3 style={{ marginBottom: 6 }}>Acknowledge invoice</h3>
                <p style={{ marginBottom: 12, fontSize: 13 }}>Confirm you have reviewed and received this invoice.</p>
                <button className="btn btn-primary" onClick={() => { acknowledgeInvoice(invoice.id); onClose(); }}>Acknowledge</button>
              </div>
            )}

            {canPay && (
              <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10 }}>
                <h3 style={{ marginBottom: 6 }}>Record a payment</h3>
                <p style={{ marginBottom: 14, fontSize: 13 }}>Balance remaining: <strong>{fmtCurrency(invoice.balance, invoice.currency)}</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label>Amount ({invoice.currency})</label>
                    <input className="input" type="number" value={payAmt} onChange={e => { setPayAmt(e.target.value); setErrors({}); }}
                      placeholder={`Max ${invoice.balance.toLocaleString()}`} />
                    {errors.amt && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.amt}</div>}
                  </div>
                  <div>
                    <label>Payment method</label>
                    <select className="select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      {['Bank transfer','Wire transfer','Mobile money','Cheque','Cash'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label>Reference number (optional)</label>
                    <input className="input" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="e.g. bank transaction ID" />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={submitPayment}>Submit payment</button>
              </div>
            )}

            {canPay && (
              <div style={{ padding: 16, border: '1px solid #FEE2E2', borderRadius: 10, background: '#FFFBFB' }}>
                <h3 style={{ marginBottom: 6, color: '#991B1B' }}>Declare default</h3>
                <p style={{ marginBottom: 12, fontSize: 13 }}>Use this only if you are unable to pay. A mandatory reason is required.</p>
                <div style={{ marginBottom: 12 }}>
                  <label>Reason for default</label>
                  <textarea className="textarea" value={defaultReason} onChange={e => { setDefaultReason(e.target.value); setErrors({}); }}
                    placeholder="Explain why you are unable to honour this invoice…" />
                  {errors.reason && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.reason}</div>}
                </div>
                <button className="btn btn-danger" onClick={submitDefault}>Confirm default</button>
              </div>
            )}

            {canCancel && (
              <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 10 }}>
                <h3 style={{ marginBottom: 6 }}>Cancel invoice</h3>
                <p style={{ marginBottom: 12, fontSize: 13 }}>Void this invoice. This action cannot be undone.</p>
                <button className="btn" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                  onClick={() => { cancelInvoice(invoice.id); onClose(); }}>Cancel invoice</button>
              </div>
            )}

            {!canPay && !canAck && !canCancel && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                No actions available for this invoice in its current state.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
