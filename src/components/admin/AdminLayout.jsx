import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { FiGrid, FiPackage, FiTag, FiShoppingBag, FiUsers, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'd-flex' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="p-3 mb-2">
          <div className="d-flex align-items-center gap-2">
            <div className="logo-icon" style={{ width: 36, height: 36, fontSize: '1.1rem' }}>🚗</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'white', fontSize: '1rem' }}>Shakti</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-grow-1 px-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link d-flex align-items-center gap-2 mb-1 ${isActive ? 'active' : ''}`}>
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)!important' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: 32, height: 32 }}>{user?.name?.[0]}</div>
            <div>
              <div className="text-white small fw-bold">{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Administrator</div>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-light w-100 d-flex align-items-center gap-2 justify-content-center" onClick={handleLogout}>
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content flex-grow-1">
        {/* Top bar */}
        <div className="d-flex align-items-center justify-content-between p-3 bg-white border-bottom">
          <button className="btn btn-light d-md-none" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-muted small">Welcome,</span>
            <span className="fw-bold">{user?.name}</span>
          </div>
        </div>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
