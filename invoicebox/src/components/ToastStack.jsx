import { useApp } from '../hooks/useApp.jsx';

export default function ToastStack() {
  const { toasts } = useApp();
  if (!toasts.length) return null;

  const ICONS = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span style={{ flexShrink: 0, fontWeight: 700 }}>{ICONS[t.type] || 'ℹ'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
