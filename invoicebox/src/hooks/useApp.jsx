import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getSeedData } from '../data/seed.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const seed = useMemo(() => getSeedData(), []);

  const [users,         setUsers]         = useState(seed.users);
  const [invoices,      setInvoices]      = useState(seed.invoices);
  const [notifications, setNotifications] = useState(seed.notifications);
  const [currentUser,   setCurrentUser]   = useState(null);
  const [toasts,        setToasts]        = useState([]);

  // ── Auth ─────────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'Invalid email or password.' };
    if (user.status === 'suspended') return { ok: false, error: 'Account suspended. Contact admin.' };
    setCurrentUser(user);
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  // ── Toasts ───────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  // ── Notifications ────────────────────────────────────────────────────────
  const pushNotif = useCallback((userId, message, type, invoiceId) => {
    setNotifications(prev => [{
      id:        `notif-${Date.now()}`,
      userId, type, message, invoiceId,
      time:  new Date().toISOString().slice(0,10),
      read:  false,
    }, ...prev]);
  }, []);

  const markNotifsRead = useCallback((userId) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  }, []);

  // ── Invoice actions ──────────────────────────────────────────────────────
  const createInvoice = useCallback((data) => {
    const total   = parseFloat(data.items.reduce((s, i) => s + i.qty * i.unit, 0).toFixed(2));
    const invoice = {
      ...data,
      id:      `INV-${String(invoices.length + 1).padStart(5,'0')}`,
      ref:     `IB-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(5,'0')}`,
      total,
      paid:    0,
      balance: total,
      payments: [],
      defaultReason: null,
    };
    setInvoices(prev => [invoice, ...prev]);
    if (data.status === 'PENDING') {
      pushNotif(data.purchaserId, `New invoice ${invoice.ref} assigned to you`, 'assigned', invoice.id);
    }
    addToast(`Invoice ${invoice.ref} created successfully`, 'success');
    return invoice;
  }, [invoices.length, pushNotif, addToast]);

  const recordPayment = useCallback((invoiceId, paymentData) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPayments = [...inv.payments, { id: `pay-${Date.now()}`, ...paymentData }];
      const paid        = parseFloat(newPayments.reduce((s, p) => s + p.amount, 0).toFixed(2));
      const balance     = parseFloat((inv.total - paid).toFixed(2));
      const status      = balance <= 0 ? 'PAID' : 'PARTIALLY PAID';
      pushNotif(inv.providerId, `Payment of ${paymentData.amount.toLocaleString()} ${inv.currency} received on ${inv.ref}`, 'payment', invoiceId);
      pushNotif(inv.purchaserId, `Payment recorded on ${inv.ref}`, 'payment', invoiceId);
      addToast(`Payment recorded. Invoice is now ${status}.`, 'success');
      return { ...inv, payments: newPayments, paid, balance, status };
    }));
  }, [pushNotif, addToast]);

  const declareDefault = useCallback((invoiceId, reason) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      pushNotif(inv.providerId, `Invoice ${inv.ref} has been defaulted`, 'default', invoiceId);
      addToast('Default declared.', 'error');
      return { ...inv, status: 'DEFAULTED', defaultReason: reason };
    }));
  }, [pushNotif, addToast]);

  const acknowledgeInvoice = useCallback((invoiceId) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      pushNotif(inv.providerId, `Invoice ${inv.ref} acknowledged by purchaser`, 'acknowledged', invoiceId);
      addToast(`Invoice ${inv.ref} acknowledged.`, 'success');
      return { ...inv, status: 'ACKNOWLEDGED' };
    }));
  }, [pushNotif, addToast]);

  const cancelInvoice = useCallback((invoiceId) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === invoiceId ? { ...inv, status: 'CANCELLED' } : inv
    ));
    addToast('Invoice cancelled.', 'info');
  }, [addToast]);

  const updateUserStatus = useCallback((userId, status) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    addToast(`User ${status === 'active' ? 'activated' : 'suspended'}.`, 'info');
  }, [addToast]);

  const value = {
    users, invoices, notifications, currentUser, toasts,
    login, logout, addToast,
    markNotifsRead, pushNotif,
    createInvoice, recordPayment, declareDefault, acknowledgeInvoice, cancelInvoice,
    updateUserStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
