// ── Formatting ────────────────────────────────────────────────────────────────
export const fmtCurrency = (amount, currency) => {
  if (amount == null) return '—';
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '—';
  if (currency === 'UGX') return 'UGX ' + Math.round(n).toLocaleString();
  if (currency === 'USD') return '$ '   + n.toFixed(2);
  if (currency === 'LYD') return 'LYD ' + n.toFixed(2);
  return n.toLocaleString();
};

export const fmtDate = (str) => {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtDateShort = (str) => {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const isOverdue = (inv) => {
  if (!['PENDING','ACKNOWLEDGED','PARTIALLY PAID'].includes(inv.status)) return false;
  return new Date(inv.dueDate) < new Date();
};

// ── Status config ─────────────────────────────────────────────────────────────
export const STATUS = {
  DRAFT:            { label: 'Draft',         bg: '#F1F5F9', color: '#475569' },
  PENDING:          { label: 'Pending',        bg: '#FEF3C7', color: '#92400E' },
  ACKNOWLEDGED:     { label: 'Acknowledged',   bg: '#DBEAFE', color: '#1E40AF' },
  'PARTIALLY PAID': { label: 'Partly paid',    bg: '#EDE9FE', color: '#5B21B6' },
  PAID:             { label: 'Paid',           bg: '#DCFCE7', color: '#166534' },
  DEFAULTED:        { label: 'Defaulted',      bg: '#FEE2E2', color: '#991B1B' },
  CANCELLED:        { label: 'Cancelled',      bg: '#F1F5F9', color: '#94A3B8' },
};

export function Badge({ status, size = 'md' }) {
  const s  = STATUS[status] || STATUS.DRAFT;
  const fs = size === 'sm' ? 10 : 11;
  const px = size === 'sm' ? '2px 7px' : '3px 10px';
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, fontSize: fs, padding: px }}>
      {s.label}
    </span>
  );
}

export function Avatar({ name, size = 36, color }) {
  const initials = (name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors   = ['#1B4FD8','#7C3AED','#059669','#D97706','#DC2626','#0891B2','#0D9488'];
  const bg       = color || colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      {icon && <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>}
      <h3>{title}</h3>
      {desc && <p style={{ marginTop: 6, marginBottom: 16 }}>{desc}</p>}
      {action}
    </div>
  );
}

// ── Pagination hook ───────────────────────────────────────────────────────────
import { useState } from 'react';
export function usePagination(items, perPage = 50) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const paged      = items.slice((page - 1) * perPage, page * perPage);
  const reset      = () => setPage(1);
  return { page, setPage, totalPages, paged, reset, total: items.length };
}

export function Pagination({ page, totalPages, setPage, total, perPage = 50 }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-2)' }}>
      <span>Showing {from}–{to} of {total.toLocaleString()}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(1)}>«</button>
        <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
        <span style={{ padding: '4px 10px', fontSize: 13 }}>{page} / {totalPages}</span>
        <button className="btn btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        <button className="btn btn-sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
      </div>
    </div>
  );
}
