import { useMemo } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { Badge, fmtCurrency, fmtDate, isOverdue, Avatar } from '../utils/helpers.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ── Shared metric card ────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderTop: `3px solid ${accent}` } : {}}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── Month name helper ─────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function monthKey(dateStr) { return dateStr?.slice(0, 7) || ''; }

// ── Provider Dashboard ────────────────────────────────────────────────────────
export function ProviderDashboard({ setPage }) {
  const { currentUser, invoices, users } = useApp();

  const mine = useMemo(() => invoices.filter(i => i.providerId === currentUser.id), [invoices, currentUser]);

  const stats = useMemo(() => {
    const totalUGX = mine.filter(i => i.currency === 'UGX').reduce((s, i) => s + i.total, 0);
    const totalUSD = mine.filter(i => i.currency === 'USD').reduce((s, i) => s + i.total, 0);
    const totalLYD = mine.filter(i => i.currency === 'LYD').reduce((s, i) => s + i.total, 0);
    const paid     = mine.reduce((s, i) => s + i.paid, 0);
    const paidUSD  = mine.filter(i => i.currency === 'USD').reduce((s, i) => s + i.paid, 0);
    const overdueList = mine.filter(i => isOverdue(i));

    // Monthly trend (last 12 months by count)
    const monthly = {};
    mine.forEach(inv => {
      const k = monthKey(inv.issueDate);
      if (!monthly[k]) monthly[k] = { count: 0, paid: 0 };
      monthly[k].count++;
      if (inv.status === 'PAID') monthly[k].paid++;
    });
    const sortedMonths = Object.keys(monthly).sort().slice(-12);
    const trendData = sortedMonths.map(k => ({
      month: k.slice(5) + '/' + k.slice(2,4),
      invoices: monthly[k].count,
      paid: monthly[k].paid,
    }));

    // Status breakdown
    const statusCounts = {};
    mine.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });

    return { totalUGX, totalUSD, totalLYD, overdueList, trendData, statusCounts };
  }, [mine]);

  const STATUS_COLORS = {
    PAID: '#16A34A', 'PARTIALLY PAID': '#7C3AED', PENDING: '#D97706',
    ACKNOWLEDGED: '#1B4FD8', DEFAULTED: '#DC2626', DRAFT: '#94A3B8', CANCELLED: '#CBD5E1',
  };
  const pieData = Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }));

  const recentInvoices = [...mine].sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 8);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>Welcome back, {currentUser.name.split(' ')[0]}</h1>
        <p>Here's your invoice activity overview.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Total invoices"    value={mine.length.toLocaleString()}                        sub="All time"           accent="#1B4FD8" />
        <StatCard label="Total invoiced (UGX)" value={'UGX ' + Math.round(stats.totalUGX).toLocaleString()} sub={`+ $ ${stats.totalUSD.toFixed(0)} USD`} accent="#7C3AED" />
        <StatCard label="Overdue invoices"  value={stats.overdueList.length.toLocaleString()}           sub="Awaiting payment"   accent="#DC2626" />
        <StatCard label="Defaulted"         value={(stats.statusCounts['DEFAULTED'] || 0).toLocaleString()} sub="Declared by purchasers" accent="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Trend chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Invoice activity — last 12 months</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.trendData} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="invoices" fill="#BFDBFE" name="Issued" radius={[3,3,0,0]} />
              <Bar dataKey="paid"     fill="#1B4FD8"  name="Paid"   radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Status breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginTop: 8 }}>
            {pieData.map(d => (
              <span key={d.name} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[d.name] || '#94A3B8', flexShrink: 0 }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3>Recent invoices</h3>
          <button className="btn btn-sm" onClick={() => setPage('invoices')}>View all →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Reference','Purchaser','Due date','Total','Status'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-3)', background: 'var(--surface2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map(inv => {
              const purchaser = users.find(u => u.id === inv.purchaserId);
              return (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '9px 10px', fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{inv.ref}</td>
                  <td style={{ padding: '9px 10px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{purchaser?.name}</td>
                  <td style={{ padding: '9px 10px', color: isOverdue(inv) ? 'var(--red)' : 'var(--text-2)', fontWeight: isOverdue(inv) ? 600 : 400 }}>{fmtDate(inv.dueDate)}</td>
                  <td style={{ padding: '9px 10px', fontWeight: 500 }}>{fmtCurrency(inv.total, inv.currency)}</td>
                  <td style={{ padding: '9px 10px' }}><Badge status={inv.status} size="sm" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Purchaser Dashboard ───────────────────────────────────────────────────────
export function PurchaserDashboard({ setPage }) {
  const { currentUser, invoices, users } = useApp();

  const mine = useMemo(() => invoices.filter(i => i.purchaserId === currentUser.id), [invoices, currentUser]);

  const stats = useMemo(() => {
    const pending  = mine.filter(i => ['PENDING','ACKNOWLEDGED','PARTIALLY PAID'].includes(i.status));
    const balUGX   = pending.filter(i => i.currency === 'UGX').reduce((s, i) => s + i.balance, 0);
    const balUSD   = pending.filter(i => i.currency === 'USD').reduce((s, i) => s + i.balance, 0);
    const balLYD   = pending.filter(i => i.currency === 'LYD').reduce((s, i) => s + i.balance, 0);
    const overdues = mine.filter(i => isOverdue(i));

    // Monthly payments
    const monthly = {};
    mine.forEach(inv => {
      inv.payments.forEach(p => {
        const k = monthKey(p.date);
        if (!monthly[k]) monthly[k] = 0;
        monthly[k] += (inv.currency === 'UGX' ? p.amount / 3700 : p.amount);
      });
    });
    const sortedMonths = Object.keys(monthly).sort().slice(-12);
    const payTrend = sortedMonths.map(k => ({ month: k.slice(5) + '/' + k.slice(2,4), amount: Math.round(monthly[k]) }));

    return { pending, balUGX, balUSD, balLYD, overdues, payTrend };
  }, [mine]);

  const urgent = [...stats.pending].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 8);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>Welcome back, {currentUser.name.split(' ')[0]}</h1>
        <p>Your invoices requiring attention.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Invoices received"  value={mine.length.toLocaleString()}               sub="All time"           accent="#1B4FD8" />
        <StatCard label="Awaiting payment"   value={stats.pending.length.toLocaleString()}      sub="Pending + part paid" accent="#D97706" />
        <StatCard label="Overdue"            value={stats.overdues.length.toLocaleString()}     sub="Past due date"      accent="#DC2626" />
        <StatCard label="Balance owed (UGX)" value={'UGX ' + Math.round(stats.balUGX).toLocaleString()} sub={`+ $ ${stats.balUSD.toFixed(2)} USD`} accent="#7C3AED" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Payments made — last 12 months (USD equiv.)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.payTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => ['$ ' + v.toLocaleString(), 'Paid']} />
              <Bar dataKey="amount" fill="#1B4FD8" radius={[3,3,0,0]} name="Paid" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Balance by currency</h3>
          {[['UGX', stats.balUGX], ['USD', stats.balUSD], ['LYD', stats.balLYD]].map(([c, v]) => (
            <div key={c} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>{c}</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: v > 0 ? '#92400E' : 'var(--text-3)' }}>{fmtCurrency(v, c)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3>Invoices needing attention</h3>
          <button className="btn btn-sm" onClick={() => setPage('invoices')}>View all →</button>
        </div>
        {urgent.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No invoices awaiting action.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Reference','Provider','Due date','Balance','Status'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-3)', background: 'var(--surface2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {urgent.map(inv => {
                const provider = users.find(u => u.id === inv.providerId);
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{inv.ref}</td>
                    <td style={{ padding: '9px 10px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider?.name}</td>
                    <td style={{ padding: '9px 10px', color: isOverdue(inv) ? 'var(--red)' : 'var(--text-2)', fontWeight: isOverdue(inv) ? 600 : 400 }}>{fmtDate(inv.dueDate)}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: '#92400E' }}>{fmtCurrency(inv.balance, inv.currency)}</td>
                    <td style={{ padding: '9px 10px' }}><Badge status={inv.status} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
