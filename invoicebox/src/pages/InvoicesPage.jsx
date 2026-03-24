import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { Badge, fmtCurrency, fmtDate, isOverdue, usePagination, Pagination, EmptyState } from '../utils/helpers.jsx';
import { STATUS } from '../utils/helpers.jsx';
import InvoiceModal from '../components/InvoiceModal.jsx';

const ALL_STATUSES = ['DRAFT','PENDING','ACKNOWLEDGED','PARTIALLY PAID','PAID','DEFAULTED','CANCELLED'];

export default function InvoicesPage() {
  const { currentUser, users, invoices } = useApp();
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('ALL');
  const [currencyF,  setCurrencyF]  = useState('ALL');
  const [overdueF,   setOverdueF]   = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [sortKey,    setSortKey]    = useState('issueDate');
  const [sortDir,    setSortDir]    = useState('desc');

  const isProvider  = currentUser.role === 'provider';
  const isPurchaser = currentUser.role === 'purchaser';

  const filtered = useMemo(() => {
    let list = invoices;
    if (isProvider)  list = list.filter(i => i.providerId  === currentUser.id);
    if (isPurchaser) list = list.filter(i => i.purchaserId === currentUser.id);

    if (statusF !== 'ALL')   list = list.filter(i => i.status === statusF);
    if (currencyF !== 'ALL') list = list.filter(i => i.currency === currencyF);
    if (overdueF)            list = list.filter(i => isOverdue(i));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(i =>
        i.ref.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        (users.find(u => u.id === i.providerId)?.name.toLowerCase().includes(q)) ||
        (users.find(u => u.id === i.purchaserId)?.name.toLowerCase().includes(q))
      );
    }

    list = [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'total' || sortKey === 'balance') { va = +va; vb = +vb; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [invoices, currentUser, isProvider, isPurchaser, statusF, currencyF, overdueF, search, sortKey, sortDir, users]);

  const { page, setPage, totalPages, paged, reset, total } = usePagination(filtered, 50);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    reset();
  };

  const SortTh = ({ label, k }) => (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--surface2)', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => toggleSort(k)}>
      {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div>
      <div className="section-header">
        <h2>{isPurchaser ? 'Invoices received' : isProvider ? 'My invoices' : 'All invoices'} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>{total.toLocaleString()} results</span></h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" style={{ width: 260 }} placeholder="Search by ref, ID or name…"
          value={search} onChange={e => { setSearch(e.target.value); reset(); }} />

        <select className="select" style={{ width: 'auto' }} value={statusF}
          onChange={e => { setStatusF(e.target.value); reset(); }}>
          <option value="ALL">All statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS[s]?.label}</option>)}
        </select>

        <select className="select" style={{ width: 'auto' }} value={currencyF}
          onChange={e => { setCurrencyF(e.target.value); reset(); }}>
          <option value="ALL">All currencies</option>
          {['UGX','USD','LYD'].map(c => <option key={c}>{c}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0, color: 'var(--text-2)', fontWeight: 400 }}>
          <input type="checkbox" checked={overdueF} onChange={e => { setOverdueF(e.target.checked); reset(); }} />
          Overdue only
        </label>
      </div>

      {/* Status quick-filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['ALL', ...ALL_STATUSES].map(s => {
          const cfg = STATUS[s];
          const count = s === 'ALL' ? invoices.filter(i => isProvider ? i.providerId === currentUser.id : isPurchaser ? i.purchaserId === currentUser.id : true).length
            : invoices.filter(i => i.status === s && (isProvider ? i.providerId === currentUser.id : isPurchaser ? i.purchaserId === currentUser.id : true)).length;
          return (
            <button key={s} onClick={() => { setStatusF(s); reset(); }}
              style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: statusF === s ? (cfg?.bg || '#E2E8F0') : 'var(--surface2)',
                color: statusF === s ? (cfg?.color || 'var(--text)') : 'var(--text-3)',
              }}>
              {s === 'ALL' ? 'All' : cfg?.label} <span style={{ opacity: 0.7 }}>{count.toLocaleString()}</span>
            </button>
          );
        })}
      </div>

      {paged.length === 0 ? (
        <EmptyState icon="📄" title="No invoices found" desc="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortTh label="Reference"   k="ref" />
                {!isProvider  && <SortTh label="Provider"  k="providerId" />}
                {!isPurchaser && <SortTh label="Purchaser" k="purchaserId" />}
                <SortTh label="Issue date" k="issueDate" />
                <SortTh label="Due date"   k="dueDate" />
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--surface2)' }}>CCY</th>
                <SortTh label="Total"      k="total" />
                <SortTh label="Balance"    k="balance" />
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--surface2)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(inv => {
                const provider  = users.find(u => u.id === inv.providerId);
                const purchaser = users.find(u => u.id === inv.purchaserId);
                const overdue   = isOverdue(inv);
                return (
                  <tr key={inv.id} onClick={() => setSelected(inv)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 12, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {inv.ref}
                    </td>
                    {!isProvider  && <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider?.name || '—'}</td>}
                    {!isPurchaser && <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{purchaser?.name || '—'}</td>}
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-2)' }}>{fmtDate(inv.issueDate)}</td>
                    <td style={{ whiteSpace: 'nowrap', color: overdue ? 'var(--red)' : 'var(--text-2)', fontWeight: overdue ? 600 : 400 }}>{fmtDate(inv.dueDate)}</td>
                    <td style={{ fontWeight: 600, fontSize: 11, color: 'var(--text-3)' }}>{inv.currency}</td>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtCurrency(inv.total, inv.currency)}</td>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap', color: inv.balance > 0 ? '#92400E' : '#166534' }}>{fmtCurrency(inv.balance, inv.currency)}</td>
                    <td><div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Badge status={inv.status} size="sm" />{overdue && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--red)' }}>OVERDUE</span>}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} total={total} perPage={50} />
        </div>
      )}

      {selected && <InvoiceModal invoice={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
