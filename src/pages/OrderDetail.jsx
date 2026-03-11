import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderAPI } from '../services/api'

const STATUS = { pending:'status-pending', processing:'status-processing', shipped:'status-shipped', delivered:'status-delivered', cancelled:'status-cancelled' }
const STEPS = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { orderAPI.getOne(id).then(r => setOrder(r.data)).finally(() => setLoading(false)) }, [id])

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border" style={{color:'var(--primary)'}}></div></div>
  if (!order) return <div className="container py-5 text-center"><h4>Order not found</h4></div>

  const activeStep = order.status === 'cancelled' ? -1 : STEPS.indexOf(order.status)

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="section-title mb-0">Order <span>Details</span></h4>
          <p className="text-muted">#{order._id.slice(-10).toUpperCase()}</p>
        </div>
        <span className={`status-badge ${STATUS[order.status]}`} style={{ fontSize: '0.9rem', padding: '6px 18px' }}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
      </div>

      {order.status !== 'cancelled' && (
        <div className="rounded-3 p-4 mb-4" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
          <div className="d-flex justify-content-between position-relative">
            <div style={{ position: 'absolute', top: 20, left: '10%', right: '10%', height: 4, background: '#e9ecef', zIndex: 0 }}>
              <div style={{ width: `${(activeStep / 3) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }}></div>
            </div>
            {STEPS.map((s, i) => (
              <div key={s} className="d-flex flex-column align-items-center" style={{ zIndex: 1 }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-800" style={{ width: 44, height: 44, background: i <= activeStep ? 'var(--primary)' : '#e9ecef', color: i <= activeStep ? '#fff' : '#999', fontSize: '0.9rem', transition: 'all 0.3s' }}>
                  {i < activeStep ? '✓' : i + 1}
                </div>
                <small className={`mt-2 ${i <= activeStep ? 'fw-700' : 'text-muted'}`} style={{ textTransform: 'capitalize' }}>{s}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="rounded-3 p-4 mb-4" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
            <h6 className="fw-800 mb-3">Order Items</h6>
            {order.orderItems.map(item => (
              <div key={item._id} className="d-flex gap-3 align-items-center mb-3 pb-3 border-bottom">
                <img src={item.image} alt={item.name} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10 }} />
                <div className="flex-grow-1">
                  <div className="fw-700">{item.name}</div>
                  <div className="text-muted small">Qty: {item.quantity} × ₹{item.price}</div>
                </div>
                <div className="fw-800" style={{ color: 'var(--primary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="rounded-3 p-4 mb-3" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
            <h6 className="fw-800 mb-3">Shipping Address</h6>
            <p className="text-muted mb-0">{order.shippingAddress.name}<br />{order.shippingAddress.phone}<br />{order.shippingAddress.street}<br />{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
          <div className="rounded-3 p-4" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
            <h6 className="fw-800 mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between mb-2 text-muted small"><span>Subtotal</span><span className="text-dark fw-700">₹{order.itemsPrice}</span></div>
            <div className="d-flex justify-content-between mb-2 text-muted small"><span>Tax</span><span className="text-dark fw-700">₹{order.taxPrice}</span></div>
            <div className="d-flex justify-content-between mb-2 text-muted small"><span>Shipping</span><span className="text-dark fw-700">{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
            <hr />
            <div className="d-flex justify-content-between fw-800" style={{ fontSize: '1.1rem' }}><span>Total</span><span style={{ color: 'var(--primary)' }}>₹{order.totalPrice}</span></div>
          </div>
        </div>
      </div>
      <Link to="/dashboard" className="btn btn-outline-secondary mt-3">← Back to Dashboard</Link>
    </div>
  )
}
