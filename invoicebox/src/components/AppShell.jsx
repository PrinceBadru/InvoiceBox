import { useState } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { Avatar } from '../utils/helpers.jsx';

const NAV_PROVIDER = [
  { id: 'dashboard',   label: 'Dashboard',       icon: '◈' },
  { id: 'invoices',    label: 'My invoices',      icon: '≡' },
  { id: 'new-invoice', label: 'New invoice',      icon: '+' },
];
const NAV_PURCHASER = [
  { id: 'dashboard',   label: 'Dashboard',        icon: '◈' },
  { id: 'invoices',    label: 'Invoices received', icon: '≡' },
];
const NAV_ADMIN = [
  { id: 'dashboard',   label: 'Dashboard',        icon: '◈' },
  { id: 'invoices',    label: 'All invoices',      icon: '≡' },
  { id: 'users',       label: 'Users',             icon: '⊙' },
  { id: 'settings',    label: 'Platform settings', icon: '⚙' },
];

function NotifPanel({ userId, notifications, onClose, markRead }) {
  const mine = notifications.filter(n => n.userId === userId)
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 60);
  const unread = mine.filter(n => !n.read).length;

  const TYPE_ICON = { assigned: '📋', payment: '💳', acknowledged: '✓', default: '⚠' };

  return (
    <div className="notif-panel">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>Notifications {unread > 0 && <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 99, fontSize: 10, padding: '1px 6px', marginLeft: 6 }}>{unread}</span>}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && <button className="btn btn-ghost btn-sm" onClick={markRead} style={{ fontSize: 11 }}>Mark all read</button>}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>×</button>
        </div>
      </div>
      {mine.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No notifications yet.</div>
      ) : mine.map(n => (
        <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {!n.read && <div className="notif-dot" style={{ marginTop: 5, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{n.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppShell({ page, setPage, children }) {
  const { currentUser, logout, notifications, markNotifsRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);

  const myNotifs  = notifications.filter(n => n.userId === currentUser.id);
  const unreadCnt = myNotifs.filter(n => !n.read).length;

  const navItems = currentUser.role === 'provider' ? NAV_PROVIDER
                 : currentUser.role === 'purchaser' ? NAV_PURCHASER
                 : NAV_ADMIN;

  const markRead = () => {
    markNotifsRead(currentUser.id);
    setShowNotifs(false);
  };

  return (
    <div className="app-layout" onClick={() => showNotifs && setShowNotifs(false)}>
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="sidebar">
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue)', letterSpacing: '-0.3px' }}>InvoiceBox</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {currentUser.role}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}>
              <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 'var(--radius-sm)' }}>
            <Avatar name={currentUser.name} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 4, justifyContent: 'center', color: 'var(--text-2)' }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="main-area">
        <header className="topbar" style={{ position: 'relative' }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>
            {navItems.find(n => n.id === page)?.label || 'InvoiceBox'}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}
              onClick={e => { e.stopPropagation(); setShowNotifs(v => !v); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCnt > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--red)', borderRadius: '50%', border: '1.5px solid var(--surface)' }} />
              )}
            </button>
          </div>

          {showNotifs && (
            <div onClick={e => e.stopPropagation()}>
              <NotifPanel
                userId={currentUser.id}
                notifications={notifications}
                onClose={() => setShowNotifs(false)}
                markRead={markRead}
              />
            </div>
          )}
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
