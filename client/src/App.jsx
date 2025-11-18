import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './App.css';

const navItems = [
  { to: '/', label: 'Game' },
  { to: '/verify', label: 'Verifier' }
];

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="logo-dot" aria-hidden />
      <div>
            <p className="brand-title">Plinko Labs</p>
            <p className="brand-tagline">Provably-fair drops</p>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                ['nav-link', isActive ? 'active' : ''].join(' ').trim()
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>Made with deterministic entropy · </span>
        <a href="/api/health" target="_blank" rel="noreferrer">
          API health
        </a>
      </footer>
      </div>
  );
}
