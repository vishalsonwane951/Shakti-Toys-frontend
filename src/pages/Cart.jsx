import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { cartItems, removeFromCart, updateQty, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const tax = Math.round(cartTotal * 0.05)
  const shipping = cartTotal >= 999 ? 0 : 60
  const grandTotal = cartTotal + tax + shipping

  if (cartItems.length === 0) return (
    <div className="container py-5 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛒</div>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>Your cart is empty!</h3>
        <p className="text-muted mb-4">Add some amazing products to get started</p>
        <Link to="/products" className="btn btn-primary-custom btn-lg px-5">Start Shopping</Link>
      </motion.div>
    </div>
  )

  return (
    <div className="container py-5">
      <h2 className="section-title mb-1">Shopping <span>Cart</span></h2>
      <div className="divider-custom"></div>
      <div className="row g-4">
        <div className="col-lg-8">
          <AnimatePresence>
            {cartItems.map(item => (
              <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="cart-item mb-3">
                <img src={item.images?.[0] || 'https://via.placeholder.com/80'} alt={item.name} />
                <div className="flex-grow-1">
                  <Link to={`/products/${item._id}`} className="text-decoration-none fw-700 text-dark">{item.name}</Link>
                  <div className="text-muted small">{item.category?.name}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{item.price}</div>
                </div>
                <div className="d-flex flex-column align-items-end gap-2">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                    <span className="px-3 fw-700">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="fw-800" style={{ color: 'var(--secondary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item._id)}><i className="bi bi-trash"></i></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <button className="btn btn-outline-secondary btn-sm" onClick={clearCart}><i className="bi bi-trash me-1"></i>Clear Cart</button>
        </div>

        <div className="col-lg-4">
          <div className="rounded-3 p-4" style={{ boxShadow: 'var(--card-shadow)', background: '#fff', position: 'sticky', top: '90px' }}>
            <h5 className="fw-800 mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>Order Summary</h5>
            {[['Subtotal', `₹${cartTotal.toLocaleString()}`], ['Tax (5%)', `₹${tax}`], ['Shipping', shipping === 0 ? 'FREE 🎉' : `₹${shipping}`]].map(([l, v]) => (
              <div key={l} className="d-flex justify-content-between mb-2 text-muted">
                <span>{l}</span><span className="fw-600 text-dark">{v}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-800 mb-4" style={{ fontSize: '1.2rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toLocaleString()}</span>
            </div>
            {shipping > 0 && <div className="alert alert-info py-2 small mb-3"><i className="bi bi-info-circle me-1"></i>Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping!</div>}
            <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary-custom w-100 btn-lg" onClick={() => user ? navigate('/checkout') : navigate('/login')}>
              {user ? 'Proceed to Checkout' : 'Login to Checkout'} <i className="bi bi-arrow-right ms-1"></i>
            </motion.button>
            <Link to="/products" className="btn btn-outline-secondary w-100 mt-2">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
