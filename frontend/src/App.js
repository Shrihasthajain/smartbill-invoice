import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import './App.css';
import Items from './pages/Items';
import NewInvoice from './pages/NewInvoice';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    { to: '/',label: 'Dashboard',end: true },
    { to: '/items',label: 'Items' },
    { to: '/invoice/new',label: 'New Invoice' },
  ];

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <div className="topbar">
        <span className="topbar-brand">SmartBill</span>
        <button
          className={`hamburger-btn ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">SmartBill</div>
          <div className="sidebar-brand-sub">Invoice System</div>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
              onClick={closeSidebar}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">v1.0.0 · SmartBill</div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />}  />
          <Route path="/items" element={<Items />}      />
          <Route path="/invoice/new" element={<NewInvoice />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}