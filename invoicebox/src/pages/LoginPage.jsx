import { useState } from 'react';
import { useApp } from '../hooks/useApp.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Provider — Kabale Solutions',       email: 'kabalesoluti1@provider.invoicebox.ug',    role: 'provider'  },
  { label: 'Provider — Ntungamo Logistics',     email: 'ntungamologi2@provider.invoicebox.ug',    role: 'provider'  },
  { label: 'Purchaser — Makerere University',   email: 'makerereuniv1@purchaser.invoicebox.ug',   role: 'purchaser' },
  { label: 'Purchaser — Stanbic Bank Uganda',   email: 'stanbicbanku4@purchaser.invoicebox.ug',   role: 'purchaser' },
  { label: 'Administrator',                     email: 'admin@invoicebox.ug',                     role: 'admin'     },
];

const ROLE_COLORS = {
  provider:  { bg: '#DCFCE7', color: '#166534' },
  purchaser: { bg: '#DBEAFE', color: '#1E40AF' },
  admin:     { bg: '#FEF3C7', color: '#92400E' },
};

export default function LoginPage() {
  const { login, users } = useApp();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    const result = login(email, password);
    if (!result.ok) setError(result.error);
    setLoading(false);
  };

  const quickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.role === 'admin' ? 'Admin@2024' : 'pass1234');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 440 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 16 }}>
            InvoiceBox Platform
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: 20 }}>
            Invoice<br/>management<br/>made simple.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7 }}>
            Create, assign and track invoices between providers and purchasers.
            Multi-currency support — UGX, USD and LYD.
          </p>
          <div style={{ marginTop: 48, display: 'flex', gap: 32 }}>
            {[['412','Providers'],['176','Purchasers'],['12,719','Invoices']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, marginBottom: 6 }}>Sign in</h2>
            <p style={{ fontSize: 13 }}>Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Email address</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Password</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" />
            </div>
            {error && (
              <div style={{ padding: '9px 12px', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              Demo accounts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {DEMO_ACCOUNTS.map(acc => {
                const rc = ROLE_COLORS[acc.role];
                return (
                  <button key={acc.email} className="btn" style={{ justifyContent: 'space-between', textAlign: 'left', fontSize: 12 }}
                    onClick={() => quickFill(acc)}>
                    <span>{acc.label}</span>
                    <span style={{ ...rc, fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>
                      {acc.role}
                    </span>
                  </button>
                );
              })}
            </div>
            <p style={{ marginTop: 10, fontSize: 11, color: 'var(--text-3)' }}>
              Password for all demo accounts: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4 }}>pass1234</code> (admin: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4 }}>Admin@2024</code>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
