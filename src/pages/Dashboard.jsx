import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { orderAPI, authAPI } from '../services/api.js'
import toast from 'react-hot-toast'

const STATUS_COLORS = { pending:'status-pending', processing:'status-processing', shipped:'status-shipped', delivered:'status-delivered', cancelled:'status-cancelled' }

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: '', street: '', city: '', state: '', pincode: '', isDefault: false })

  useEffect(() => { orderAPI.getMy().then(r => setOrders(r.data)) }, [])

  // ✅ FIX 1: Sync avatarPreview whenever user.avatar changes in context
  useEffect(() => {
    if (user?.avatar) setAvatarPreview(user.avatar)
  }, [user?.avatar])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)) }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', profileForm.name)
      fd.append('phone', profileForm.phone)
      if (avatarFile) fd.append('avatar', avatarFile)
      if (pwForm.password) {
        if (pwForm.password !== pwForm.confirm) { toast.error('Passwords do not match'); setSaving(false); return }
        fd.append('password', pwForm.password)
      }
      const { data } = await authAPI.updateProfile(fd)

      updateUser(data)                                 // ✅ FIX 2: updates Navbar + localStorage
      if (data.avatar) setAvatarPreview(data.avatar)  // ✅ FIX 3: updates sidebar pic
      setAvatarFile(null)                             // ✅ FIX 4: clears pending file

      toast.success('Profile updated!')
    } catch (err) { toast.error('Update failed') }
    setSaving(false)
  }

  const saveAddress = async () => {
    try {
      await authAPI.addAddress(addrForm)
      toast.success('Address saved!')
      setAddrForm({ label: '', street: '', city: '', state: '', pincode: '', isDefault: false })
    } catch { toast.error('Failed to save address') }
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="rounded-3 p-4 text-center mb-3" style={{ boxShadow: 'var(--card-shadow)', background: 'linear-gradient(135deg, var(--secondary), #2d4a7a)' }}>
            <div className="position-relative d-inline-block mb-3">
              <img src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.name}&background=e63946&color=fff&size=100`} alt="" style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', objectFit: 'cover' }} />
              <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '0.8rem' }}>
                <i className="bi bi-camera"></i>
                <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
              </label>
            </div>
            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{user?.email}</div>
          </div>
          <div className="rounded-3 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            {[['orders', 'bi-bag', 'My Orders'], ['profile', 'bi-person', 'Edit Profile'], ['addresses', 'bi-geo-alt', 'Addresses']].map(([id, icon, label]) => (
              <button key={id} className={`btn w-100 text-start px-4 py-3 border-0 ${activeTab === id ? 'bg-primary text-white' : 'bg-white'}`} onClick={() => setActiveTab(id)} style={{ borderRadius: 0, fontWeight: 600 }}>
                <i className={`bi ${icon} me-2`}></i>{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-lg-9">
          {activeTab === 'orders' && (
            <div>
              <h4 className="section-title mb-3">My <span>Orders</span></h4>
              {orders.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: '3.5rem' }}>📦</div>
                  <h5 className="mt-3">No orders yet</h5>
                  <Link to="/products" className="btn btn-primary-custom mt-2">Start Shopping</Link>
                </div>
              ) : orders.map(order => (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3 p-4 mb-3" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <div className="fw-700 small" style={{ color: 'var(--primary)' }}>{order.invoiceNumber || `#${order._id.slice(-8).toUpperCase()}`}</div>
                      <div className="text-muted small">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      {order.orderType === 'offline' && <span className="badge" style={{ background: '#f3e5f5', color: '#6a1b9a', fontSize: '0.65rem', fontWeight: 700 }}>🏪 In-Store</span>}
                    </div>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <span className={`status-badge ${STATUS_COLORS[order.status]}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      {order.orderType !== 'offline' && <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-secondary">View</Link>}
                      <a href={`/invoice/${order._id}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#e63946', color: '#fff', fontWeight: 700 }}>
                        <i className="bi bi-printer me-1"></i>Invoice
                      </a>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    {order.orderItems.slice(0, 3).map(item => (
                      <img key={item._id} src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                    ))}
                    {order.orderItems.length > 3 && <div className="d-flex align-items-center justify-content-center rounded-3 text-muted fw-700" style={{ width: 50, height: 50, background: '#f0f0f0', fontSize: '0.85rem' }}>+{order.orderItems.length - 3}</div>}
                  </div>
                  <div className="fw-800 mt-2" style={{ color: 'var(--primary)' }}>Total: ₹{order.totalPrice.toLocaleString()}</div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h4 className="section-title mb-3">Edit <span>Profile</span></h4>
              <div className="rounded-3 p-4" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-600">Full Name</label>
                    <input className="form-control" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600">Phone Number</label>
                    <input className="form-control" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600">New Password <span className="text-muted small">(leave blank to keep current)</span></label>
                    <input type="password" className="form-control" value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600">Confirm New Password</label>
                    <input type="password" className="form-control" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                  </div>
                </div>
                <button className="btn btn-primary-custom mt-4 px-5" onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h4 className="section-title mb-3">My <span>Addresses</span></h4>
              <div className="rounded-3 p-4" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
                <h6 className="fw-700 mb-3">Add New Address</h6>
                <div className="row g-3">
                  {[['label','Address Label (e.g. Home)','col-md-6'],['street','Street Address','col-12'],['city','City','col-md-4'],['state','State','col-md-4'],['pincode','Pincode','col-md-4']].map(([k, ph, cls]) => (
                    <div key={k} className={cls}>
                      <input className="form-control" placeholder={ph} value={addrForm[k]} onChange={e => setAddrForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="col-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="defAddr" checked={addrForm.isDefault} onChange={e => setAddrForm(f => ({ ...f, isDefault: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="defAddr">Set as default address</label>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary-custom mt-3" onClick={saveAddress}>Save Address</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}