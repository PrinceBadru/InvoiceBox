import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { Avatar, fmtCurrency, fmtDate, Badge, usePagination, Pagination, EmptyState } from '../utils/helpers.jsx';
import { CATEGORIES, CURRENCIES } from '../data/seed.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { users, invoices } = useApp();

  const stats = useMemo(() => {
    const providers  = users.filter(u => u.role === 'provider');
    const purchasers = users.filter(u => u.role === 'purchaser');

    const totalUGX = invoices.filter(i => i.currency === 'UGX').reduce((s, i) => s + i.total, 0);
    const totalUSD = invoices.filter(i => i.currency === 'USD').reduce((s, i) => s + i.total, 0);
    const totalLYD = invoices.filter(i => i.currency === 'LYD').reduce((s, i) => s + i.total, 0);

    const payRate    = invoices.length ? (invoices.filter(i => i.status === 'PAID').length / invoices.length * 100).toFixed(1) : 0;
    const defaultRate= invoices.length ? (invoices.filter(i => i.status === 'DEFAULTED').length / invoices.length * 100).toFixed(1) : 0;

    // Monthly invoice volume
    const monthly = {};
    invoices.forEach(inv => {
      const k = inv.issueDate.slice(0,7);
      if (!monthly[k]) monthly[k] = 0;
      monthly[k]++;
    });
    const trend = Object.keys(monthly).sort().slice(-18).map(k => ({ month: k.slice(5)+'/'+k.slice(2,4), count: monthly[k] }));

    // Category breakdown
    const catCount = {};
    invoices.forEach(inv => inv.items.forEach(it => { catCount[it.category] = (catCount[it.category] || 0) + 1; }));
    const topCats = Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

    // Status breakdown
    const statusCounts = {};
    invoices.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });

    return { providers, purchasers, totalUGX, totalUSD, totalLYD, payRate, defaultRate, trend, topCats, statusCounts };
  }, [users, invoices]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>Platform overview</h1>
        <p>Administrative summary of InvoiceBox activity.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderTop: '3px solid #1B4FD8' }}>
          <div className="stat-label">Providers</div>
          <div className="stat-value">{stats.providers.length.toLocaleString()}</div>
          <div className="stat-sub">{stats.providers.filter(u=>u.status==='active').length} active</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #7C3AED' }}>
          <div className="stat-label">Purchasers</div>
          <div className="stat-value">{stats.purchasers.length.toLocaleString()}</div>
          <div className="stat-sub">{stats.purchasers.filter(u=>u.status==='active').length} active</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #16A34A' }}>
          <div className="stat-label">Total invoices</div>
          <div className="stat-value">{invoices.length.toLocaleString()}</div>
          <div className="stat-sub">Payment rate: {stats.payRate}%</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #DC2626' }}>
          <div className="stat-label">Default rate</div>
          <div className="stat-value">{stats.defaultRate}%</div>
          <div className="stat-sub">{(invoices.filter(i=>i.status==='DEFAULTED').length).toLocaleString()} invoices</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Invoice volume — monthly</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.trend}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#1B4FD8" radius={[3,3,0,0]} name="Invoices" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Platform volume</h3>
          {[['UGX', stats.totalUGX], ['USD', stats.totalUSD], ['LYD', stats.totalLYD]].map(([c,v]) => (
            <div key={c} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 2 }}>{c}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtCurrency(v, c)}</div>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 8 }}>Status breakdown</div>
            {Object.entries(stats.statusCounts).sort((a,b)=>b[1]-a[1]).map(([s,n]) => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Badge status={s} size="sm" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{n.toLocaleString()} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({(n/invoices.length*100).toFixed(1)}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top 10 invoice categories</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topCats} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#7C3AED" radius={[0,3,3,0]} name="Line items" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Currency distribution</h3>
          {CURRENCIES.map(c => {
            const cnt  = invoices.filter(i => i.currency === c).length;
            const pct  = invoices.length ? (cnt / invoices.length * 100) : 0;
            const COLOR = { UGX: '#1B4FD8', USD: '#16A34A', LYD: '#D97706' };
            return (
              <div key={c} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{c}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{cnt.toLocaleString()} invoices ({pct.toFixed(1)}%)</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 99 }}>
                  <div style={{ width: pct + '%', height: '100%', background: COLOR[c], borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Users Page ────────────────────────────────────────────────────────────────
export function UsersPage() {
  const { users, invoices, updateUserStatus } = useApp();
  const [search,  setSearch]  = useState('');
  const [roleF,   setRoleF]   = useState('ALL');
  const [statusF, setStatusF] = useState('ALL');
  const [tab,     setTab]     = useState('providers');

  const filtered = useMemo(() => {
    let list = users.filter(u => u.role !== 'admin');
    if (tab === 'providers')  list = list.filter(u => u.role === 'provider');
    if (tab === 'purchasers') list = list.filter(u => u.role === 'purchaser');
    if (statusF !== 'ALL')    list = list.filter(u => u.status === statusF);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }, [users, tab, statusF, search]);

  const { page, setPage, totalPages, paged, reset, total } = usePagination(filtered, 50);

  return (
    <div>
      <div className="section-header">
        <h2>User management <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>{total.toLocaleString()}</span></h2>
      </div>

      <div className="tabs">
        {[['providers','Providers (412)'],['purchasers','Purchasers (176)']].map(([t,l]) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); reset(); }}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input className="input" style={{ width: 280 }} placeholder="Search by name or email…"
          value={search} onChange={e => { setSearch(e.target.value); reset(); }} />
        <select className="select" style={{ width: 'auto' }} value={statusF} onChange={e => { setStatusF(e.target.value); reset(); }}>
          <option value="ALL">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {paged.length === 0 ? (
        <EmptyState icon="👤" title="No users found" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {['User','Email','Phone','Joined','Invoices','Status','Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(user => {
                const userInvoices = invoices.filter(i => i.providerId === user.id || i.purchaserId === user.id);
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={user.name} size={28} />
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{user.email}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{user.phone}</td>
                    <td style={{ color: 'var(--text-2)' }}>{fmtDate(user.joined)}</td>
                    <td style={{ fontWeight: 600 }}>{userInvoices.length}</td>
                    <td>
                      <span style={{ background: user.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: user.status === 'active' ? '#166534' : '#991B1B', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm"
                        style={{ color: user.status === 'active' ? 'var(--red)' : 'var(--green)', borderColor: user.status === 'active' ? 'var(--red)' : 'var(--green)' }}
                        onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}>
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} total={total} perPage={50} />
        </div>
      )}
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
export function SettingsPage() {
  return (
    <div>
      <div className="section-header"><h2>Platform settings</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Goods & service categories</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {CATEGORIES.map(c => (
              <div key={c} style={{ padding: '7px 10px', background: 'var(--surface2)', borderRadius: 6, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{c}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14 }}>Permitted currencies</h3>
            {[
              { code: 'UGX', name: 'Uganda Shilling',       symbol: 'UGX', decimals: 0 },
              { code: 'USD', name: 'United States Dollar',  symbol: '$',   decimals: 2 },
              { code: 'LYD', name: 'Libyan Dinar',          symbol: 'LYD', decimals: 2 },
            ].map(c => (
              <div key={c.code} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15, marginRight: 10 }}>{c.code}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.name}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {c.symbol} · {c.decimals} dp
                  <span style={{ marginLeft: 8, background: '#DCFCE7', color: '#166534', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Platform info</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              {[
                ['Version',          '2.0.0 (Rebuilt)'],
                ['Invoice statuses', '7 lifecycle states'],
                ['Data retention',   '7 years (audit logs)'],
                ['Session timeout',  '60 minutes idle'],
                ['2FA',              'Optional (per user)'],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--text-2)', width: '45%' }}>{k}</td>
                  <td style={{ padding: '8px 0', fontWeight: 500 }}>{v}</td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
