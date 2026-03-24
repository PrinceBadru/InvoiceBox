import { useState } from 'react';
import { AppProvider, useApp } from './hooks/useApp.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppShell from './components/AppShell.jsx';
import ToastStack from './components/ToastStack.jsx';
import { ProviderDashboard, PurchaserDashboard } from './pages/DashboardPages.jsx';
import { AdminDashboard, UsersPage, SettingsPage } from './pages/AdminPages.jsx';
import InvoicesPage from './pages/InvoicesPage.jsx';
import NewInvoicePage from './pages/NewInvoicePage.jsx';

function Router() {
  const { currentUser } = useApp();
  const [page, setPage] = useState('dashboard');

  if (!currentUser) return <LoginPage />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        if (currentUser.role === 'provider')  return <ProviderDashboard setPage={setPage} />;
        if (currentUser.role === 'purchaser') return <PurchaserDashboard setPage={setPage} />;
        return <AdminDashboard />;
      case 'invoices':
        return <InvoicesPage />;
      case 'new-invoice':
        return <NewInvoicePage setPage={setPage} />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div style={{ padding: 40, color: 'var(--text-2)' }}>Page not found.</div>;
    }
  };

  return (
    <AppShell page={page} setPage={setPage}>
      {renderPage()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <ToastStack />
    </AppProvider>
  );
}
