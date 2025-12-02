
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store';
import { Sidebar, Header } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Expiry from './pages/Expiry';
import Distribution from './pages/Distribution';
import Purchase from './pages/Purchase';
import Finance from './pages/Finance';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import PharmacyScanner from './components/PharmacyScanner';
import { useGlobalStore } from './store';

const ProtectedLayout = () => {
  const { user } = useAuthStore();
  const { isSidebarOpen } = useGlobalStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/expiry" element={<Expiry />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/scanner" element={<PharmacyScanner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
