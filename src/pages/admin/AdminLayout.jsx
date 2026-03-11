import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: 'bi-box-seam', label: 'Products' },
  { to: '/admin/orders', icon: 'bi-receipt', label: 'Orders' },
  { to: '/admin/pos', icon: 'bi-shop-window', label: '🏪 POS / Walk-in' },
  { to: '/admin/users', icon: 'bi-people', label: 'Users' },
  { to: '/admin/categories', icon: 'bi-grid', label: 'Categories' }
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/admin'

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--primary)', borderRadius: 8, padding: '3px 8px', fontSize: '1rem' }}>🚗</span>
            <span style={{ fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>Shakti Admin</span>
          </Link>
        </div>
        <nav>
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className={`nav-link ${isActive(item.to, item.exact) ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <i className={`bi ${item.icon}`}></i>{item.label}
            </Link>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 20, left: 10, right: 10 }}>
          <button className="btn btn-sm w-100" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }} onClick={() => { logout(); navigate('/') }}>
            <i className="bi bi-box-arrow-left me-2"></i>Logout
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header className="admin-topbar">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm d-flex d-md-none border-0" onClick={() => setSidebarOpen(s => !s)}><i className="bi bi-list fs-4"></i></button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--secondary)' }}>
            {navItems.find(n => isActive(n.to, n.exact))?.label || 'Admin Panel'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="btn btn-sm btn-outline-secondary"><i className="bi bi-shop me-1"></i>View Store</Link>
          <div className="d-flex align-items-center gap-2">
            <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=e63946&color=fff&size=40`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <span className="fw-700 small d-none d-md-inline">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="admin-content">
        <Outlet />
      </main>

      {sidebarOpen && <div className="position-fixed top-0 start-0 w-100 h-100 d-md-none" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setSidebarOpen(false)}></div>}
    </div>
  )
}
