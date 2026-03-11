import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed']
const STATUS_COLORS = { pending:'status-pending', processing:'status-processing', shipped:'status-shipped', delivered:'status-delivered', cancelled:'status-cancelled', completed:'status-delivered' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    orderAPI.getAll({ status: filterStatus, orderType: filterType, page, limit: 15 }).then(r => {
      setOrders(r.data.orders); setTotalPages(r.data.pages)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [filterStatus, filterType, page])

  const updateStatus = async (id, status) => {
    await orderAPI.updateStatus(id, status)
    toast.success('Order status updated!')
    load()
    if (selectedOrder?._id === id) setSelectedOrder(o => ({ ...o, status }))
  }

  const isDone = (status) => status === 'delivered' || status === 'cancelled' || status === 'completed'

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>Order Management</h4>
        <button className="btn btn-sm" style={{ background: '#1a2342', color: '#fff', fontWeight: 700, borderRadius: 8 }} onClick={() => navigate('/admin/pos')}>
          <i className="bi bi-shop-window me-2"></i>Open POS / Walk-in Sale
        </button>
      </div>

      {/* Type Filter */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {[['', '🗂 All Orders'], ['online', '🌐 Online'], ['offline', '🏪 Offline/Walk-in']].map(([val, label]) => (
          <button key={val} className={`btn btn-sm ${filterType === val ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
            onClick={() => { setFilterType(val); setPage(1) }}>{label}</button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['', ...STATUSES].map(s => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary-custom' : 'btn-outline-secondary'}`} onClick={() => { setFilterStatus(s); setPage(1) }}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}
          </button>
        ))}
      </div>

      <div className="rounded-3 p-4" style={{ background: '#fff', boxShadow: 'var(--card-shadow)' }}>
        {loading ? <div className="text-center py-4"><div className="spinner-border" style={{color:'var(--primary)'}}></div></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr><th>Invoice #</th><th>Type</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td className="fw-700 small">{o.invoiceNumber || `#${o._id.slice(-8).toUpperCase()}`}</td>
                    <td>
                      <span className="badge" style={{ background: o.orderType === 'offline' ? '#f3e5f5' : '#e3f2fd', color: o.orderType === 'offline' ? '#6a1b9a' : '#1565c0', fontWeight: 700, fontSize: '0.7rem' }}>
                        {o.orderType === 'offline' ? '🏪 Walk-in' : '🌐 Online'}
                      </span>
                    </td>
                    <td className="small">
                      {o.orderType === 'offline' ? (o.customerName || 'Walk-in') : (o.user?.name || 'N/A')}
                      <br /><span className="text-muted">{o.orderType === 'offline' ? o.customerPhone : o.user?.email}</span>
                    </td>
                    <td className="small">{o.orderItems?.length} item(s)</td>
                    <td className="fw-700 small" style={{ color: 'var(--primary)' }}>₹{o.totalPrice?.toLocaleString()}</td>
                    <td><span className={`status-badge ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                    <td className="small text-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedOrder(o)} title="View"><i className="bi bi-eye"></i></button>
                        <button className="btn btn-sm" style={{ background: '#e63946', color: '#fff' }} onClick={() => window.open(`/invoice/${o._id}`, '_blank')} title="Invoice">
                          <i className="bi bi-printer"></i>
                        </button>
                        {!isDone(o.status) && (
                          <select className="form-select form-select-sm" style={{ width: 130 }} value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                        {isDone(o.status) && <span className="badge bg-secondary">Done</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span className="btn btn-sm disabled">Page {page} / {totalPages}</span>
                <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-800">{selectedOrder.invoiceNumber || `Order #${selectedOrder._id.slice(-8).toUpperCase()}`}</h5>
                  <span className="badge" style={{ background: selectedOrder.orderType === 'offline' ? '#f3e5f5' : '#e3f2fd', color: selectedOrder.orderType === 'offline' ? '#6a1b9a' : '#1565c0', fontSize: '0.75rem' }}>
                    {selectedOrder.orderType === 'offline' ? '🏪 Offline/Walk-in' : '🌐 Online Order'}
                  </span>
                </div>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="fw-700 text-muted">Customer</h6>
                    {selectedOrder.orderType === 'offline' ? (
                      <p>{selectedOrder.customerName || 'Walk-in Customer'}<br />
                        {selectedOrder.customerPhone && <span className="text-muted">{selectedOrder.customerPhone}</span>}
                      </p>
                    ) : (
                      <p>{selectedOrder.user?.name}<br />{selectedOrder.user?.email}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-700 text-muted">{selectedOrder.orderType === 'offline' ? 'Sale Info' : 'Shipping Address'}</h6>
                    {selectedOrder.orderType === 'offline' ? (
                      <p>Payment: <strong>{selectedOrder.paymentMethod}</strong><br />
                        Status: <strong style={{ textTransform: 'capitalize' }}>{selectedOrder.status}</strong></p>
                    ) : (
                      <p>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                    )}
                  </div>
                </div>
                <h6 className="fw-700 text-muted mt-2">Order Items</h6>
                {selectedOrder.orderItems?.map((item, i) => (
                  <div key={i} className="d-flex gap-3 align-items-center mb-2 p-2 border rounded-3">
                    <img src={item.image} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                    <div className="flex-grow-1"><div className="fw-700 small">{item.name}</div><div className="text-muted small">Qty: {item.quantity}</div></div>
                    <div className="fw-800 small" style={{ color: 'var(--primary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
                <div className="mt-3 p-3 rounded-3 bg-light">
                  <div className="d-flex justify-content-between small text-muted"><span>Subtotal</span><span>₹{selectedOrder.itemsPrice?.toLocaleString()}</span></div>
                  {selectedOrder.discountAmount > 0 && <div className="d-flex justify-content-between small" style={{ color: '#28a745' }}><span>Discount</span><span>-₹{selectedOrder.discountAmount?.toLocaleString()}</span></div>}
                  {selectedOrder.taxPrice > 0 && <div className="d-flex justify-content-between small text-muted"><span>Tax</span><span>₹{selectedOrder.taxPrice?.toLocaleString()}</span></div>}
                  <div className="d-flex justify-content-between fw-800 mt-2"><span>Total</span><span style={{ color: 'var(--primary)' }}>₹{selectedOrder.totalPrice?.toLocaleString()}</span></div>
                  <div className="d-flex justify-content-between small text-muted mt-1"><span>Payment Method</span><span>{selectedOrder.paymentMethod}</span></div>
                </div>
                {!isDone(selectedOrder.status) && (
                  <div className="mt-3">
                    <label className="form-label fw-700">Update Status</label>
                    <select className="form-select" value={selectedOrder.status} onChange={e => updateStatus(selectedOrder._id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn" style={{ background: '#e63946', color: '#fff', fontWeight: 700 }} onClick={() => window.open(`/invoice/${selectedOrder._id}`, '_blank')}>
                  <i className="bi bi-printer me-2"></i>Print Invoice
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
