import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminAPI, orderAPI } from '../../services/api'

const STATUS_COLORS = { pending:'status-pending', processing:'status-processing', shipped:'status-shipped', delivered:'status-delivered', cancelled:'status-cancelled' }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [orderStats, setOrderStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.getStats(), orderAPI.getStats()])
      .then(([s, os]) => { setStats(s.data); setOrderStats(os.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{color:'var(--primary)'}}></div></div>

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', bg: 'linear-gradient(135deg,#e63946,#c1121f)', link: '/admin/products' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🧾', bg: 'linear-gradient(135deg,#1d3557,#2d4a7a)', link: '/admin/orders' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', bg: 'linear-gradient(135deg,#2a9d8f,#1b7a6e)', link: '/admin/orders' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', bg: 'linear-gradient(135deg,#f4a261,#e07d3a)', link: '/admin/users' }
  ]

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)', marginBottom: 0 }}>Dashboard Overview</h4>
          <small className="text-muted">Welcome back! Here's what's happening.</small>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {cards.map((c, i) => (
          <div className="col-6 col-xl-3" key={c.label}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={c.link} className="text-decoration-none">
                <div className="stat-card" style={{ background: c.bg }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="small mb-1" style={{ opacity: 0.8 }}>{c.label}</div>
                      <div className="stat-value">{c.value}</div>
                    </div>
                    <div className="stat-icon">{c.icon}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-lg-7">
          <div className="rounded-3 p-4" style={{ background: '#fff', boxShadow: 'var(--card-shadow)' }}>
            <div className="d-flex justify-content-between mb-3">
              <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Recent Orders</h6>
              <Link to="/admin/orders" className="btn btn-sm btn-outline-secondary">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead><tr><th style={{ fontSize: '0.78rem', color: '#999' }}>ORDER ID</th><th style={{ fontSize: '0.78rem', color: '#999' }}>CUSTOMER</th><th style={{ fontSize: '0.78rem', color: '#999' }}>AMOUNT</th><th style={{ fontSize: '0.78rem', color: '#999' }}>STATUS</th></tr></thead>
                <tbody>
                  {orderStats?.recentOrders?.map(o => (
                    <tr key={o._id}>
                      <td className="small fw-700">#{o._id.slice(-6).toUpperCase()}</td>
                      <td className="small">{o.user?.name || 'N/A'}</td>
                      <td className="small fw-700" style={{ color: 'var(--primary)' }}>₹{o.totalPrice?.toLocaleString()}</td>
                      <td><span className={`status-badge ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-lg-5">
          <div className="rounded-3 p-4 mb-3" style={{ background: '#fff', boxShadow: 'var(--card-shadow)' }}>
            <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>Order Status</h6>
            {[['Pending', orderStats?.pendingOrders || 0, 'status-pending'], ['Delivered', orderStats?.deliveredOrders || 0, 'status-delivered']].map(([l, v, cls]) => (
              <div key={l} className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">{l}</span>
                <span className={`status-badge ${cls}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-3 p-4" style={{ background: '#fff', boxShadow: 'var(--card-shadow)' }}>
            <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>Low Stock Alert</h6>
            {stats?.lowStock?.length === 0 ? <p className="text-muted small mb-0">All products well stocked ✅</p> : stats?.lowStock?.map(p => (
              <div key={p._id} className="d-flex justify-content-between mb-2 small">
                <span className="text-truncate" style={{ maxWidth: '75%' }}>{p.name}</span>
                <span className="badge bg-danger">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
