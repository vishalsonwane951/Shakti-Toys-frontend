import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderAPI, authAPI } from '../services/api'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI (PhonePe / Google Pay / Paytm)', icon: '📱' },
  { id: 'UPI_SCANNER', label: 'UPI QR Scanner', icon: '📷' },
  { id: 'CARD', label: 'Debit / Credit Card', icon: '💳' },
  { id: 'COD', label: 'Cash on Delivery', icon: '💵' }
]

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [payMethod, setPayMethod] = useState('UPI')
  const [profile, setProfile] = useState(null)
  const [saveAddr, setSaveAddr] = useState(false)
  const [addr, setAddr] = useState({ name: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [upiId, setUpiId] = useState('')

  const tax = Math.round(cartTotal * 0.05)
  const shipping = cartTotal >= 999 ? 0 : 60
  const grandTotal = cartTotal + tax + shipping

  useEffect(() => {
    authAPI.getProfile().then(r => {
      setProfile(r.data)
      if (r.data.addresses?.length > 0) {
        const def = r.data.addresses.find(a => a.isDefault) || r.data.addresses[0]
        setAddr({ name: def.label || user.name, phone: r.data.phone || '', street: def.street, city: def.city, state: def.state, pincode: def.pincode })
      }
    })
  }, [])

  const placeOrder = async () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode']
    if (required.some(k => !addr[k])) return toast.error('Fill all address fields')
    setLoading(true)
    try {
      if (saveAddr) await authAPI.addAddress({ ...addr, label: 'Home', isDefault: true })
      const orderItems = cartItems.map(i => ({ product: i._id, name: i.name, image: i.images?.[0] || '', price: i.price, quantity: i.quantity }))
      const order = await orderAPI.create({ orderItems, shippingAddress: addr, paymentMethod: payMethod, itemsPrice: cartTotal, taxPrice: tax, shippingPrice: shipping, totalPrice: grandTotal })
      clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate(`/orders/${order.data._id}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order') }
    setLoading(false)
  }

  return (
    <div className="container py-5">
      <h2 className="section-title mb-1">Secure <span>Checkout</span></h2>
      <div className="divider-custom mb-4"></div>

      {/* Steps */}
      <div className="d-flex mb-5 gap-0">
        {[['1', 'Address'], ['2', 'Payment'], ['3', 'Review']].map(([n, l], i) => (
          <div key={n} className="d-flex align-items-center" style={{ flex: 1 }}>
            <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-800" style={{ width: 40, height: 40, background: step >= Number(n) ? 'var(--primary)' : '#e9ecef', color: step >= Number(n) ? '#fff' : '#999', transition: 'all 0.3s' }}>{n}</div>
              <small className={step >= Number(n) ? 'fw-700' : 'text-muted'} style={{ marginTop: 4 }}>{l}</small>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > Number(n) ? 'var(--primary)' : '#e9ecef', marginBottom: 20, transition: 'all 0.3s' }}></div>}
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h5 className="fw-800 mb-4">Delivery Address</h5>
              {profile?.addresses?.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Saved Addresses</h6>
                  <div className="d-flex flex-column gap-2">
                    {profile.addresses.map((a, i) => (
                      <div key={i} className="p-3 rounded-3 border" role="button" onClick={() => setAddr({ name: a.label || user.name, phone: profile.phone || '', street: a.street, city: a.city, state: a.state, pincode: a.pincode })} style={{ cursor: 'pointer', borderColor: addr.street === a.street ? 'var(--primary)' : '#dee2e6' }}>
                        <div className="fw-700">{a.label} {a.isDefault && <span className="badge bg-primary ms-1">Default</span>}</div>
                        <div className="text-muted small">{a.street}, {a.city}, {a.state} - {a.pincode}</div>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <small className="text-muted">Or enter a new address below</small>
                </div>
              )}
              <div className="row g-3">
                {[['name','Full Name','col-md-6'],['phone','Phone Number','col-md-6'],['street','Street Address','col-12'],['city','City','col-md-4'],['state','State','col-md-4'],['pincode','Pincode','col-md-4']].map(([k, pl, cls]) => (
                  <div key={k} className={cls}>
                    <input className="form-control" placeholder={pl} value={addr[k]} onChange={e => setAddr(a => ({ ...a, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="form-check mt-3">
                <input className="form-check-input" type="checkbox" id="saveAddr" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} />
                <label className="form-check-label" htmlFor="saveAddr">Save this address for future orders</label>
              </div>
              <button className="btn btn-primary-custom mt-4 px-5" onClick={() => setStep(2)}>Continue to Payment <i className="bi bi-arrow-right ms-1"></i></button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h5 className="fw-800 mb-4">Payment Method</h5>
              <div className="d-flex flex-column gap-3">
                {PAYMENT_METHODS.map(m => (
                  <div key={m.id} className="p-3 rounded-3 border" role="button" onClick={() => setPayMethod(m.id)} style={{ cursor: 'pointer', borderColor: payMethod === m.id ? 'var(--primary)' : '#dee2e6', background: payMethod === m.id ? '#fff5f5' : '#fff', transition: 'all 0.2s' }}>
                    <div className="d-flex align-items-center gap-3">
                      <input type="radio" className="form-check-input" readOnly checked={payMethod === m.id} />
                      <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                      <span className="fw-600">{m.label}</span>
                    </div>
                    {payMethod === m.id && (
                      <div className="mt-3 ms-4">
                        {m.id === 'UPI' && <input className="form-control" placeholder="Enter UPI ID (e.g., name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} />}
                        {m.id === 'UPI_SCANNER' && (
                          <div className="text-center p-3 border rounded-3">
                            <div style={{ width: 150, height: 150, background: '#1d3557', borderRadius: 12, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>QR CODE<br />shakti@upi</div>
                            <p className="text-muted small mt-2">Scan with any UPI app</p>
                          </div>
                        )}
                        {m.id === 'CARD' && (
                          <div className="row g-2">
                            <div className="col-12"><input className="form-control" placeholder="Card Number" maxLength={19} value={cardInfo.number} onChange={e => setCardInfo(c => ({ ...c, number: e.target.value }))} /></div>
                            <div className="col-12"><input className="form-control" placeholder="Cardholder Name" value={cardInfo.name} onChange={e => setCardInfo(c => ({ ...c, name: e.target.value }))} /></div>
                            <div className="col-6"><input className="form-control" placeholder="MM/YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo(c => ({ ...c, expiry: e.target.value }))} /></div>
                            <div className="col-6"><input className="form-control" placeholder="CVV" maxLength={3} type="password" value={cardInfo.cvv} onChange={e => setCardInfo(c => ({ ...c, cvv: e.target.value }))} /></div>
                          </div>
                        )}
                        {m.id === 'COD' && <p className="text-muted small mb-0">Pay with cash when your order is delivered. Additional ₹30 COD charge may apply.</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary-custom px-5" onClick={() => setStep(3)}>Review Order <i className="bi bi-arrow-right ms-1"></i></button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h5 className="fw-800 mb-4">Review Your Order</h5>
              <div className="p-3 rounded-3 border mb-3">
                <h6 className="fw-700 text-muted">Delivery To</h6>
                <p className="mb-0">{addr.name} • {addr.phone}<br />{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
              </div>
              <div className="p-3 rounded-3 border mb-3">
                <h6 className="fw-700 text-muted">Payment</h6>
                <p className="mb-0">{PAYMENT_METHODS.find(m => m.id === payMethod)?.label}</p>
              </div>
              {cartItems.map(item => (
                <div key={item._id} className="d-flex gap-3 align-items-center mb-2 p-2 rounded-3 border">
                  <img src={item.images?.[0] || ''} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                  <div className="flex-grow-1">
                    <div className="fw-600">{item.name}</div>
                    <div className="text-muted small">Qty: {item.quantity}</div>
                  </div>
                  <div className="fw-800" style={{ color: 'var(--primary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>← Back</button>
                <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary-custom px-5 btn-lg" onClick={placeOrder} disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Placing...</> : `Place Order • ₹${grandTotal.toLocaleString()}`}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="col-lg-5">
          <div className="rounded-3 p-4" style={{ boxShadow: 'var(--card-shadow)', background: '#fff', position: 'sticky', top: '90px' }}>
            <h5 className="fw-800 mb-3">Order Summary ({cartItems.length} items)</h5>
            {cartItems.map(i => (
              <div key={i._id} className="d-flex justify-content-between mb-2 small">
                <span className="text-truncate" style={{ maxWidth: '70%' }}>{i.name} × {i.quantity}</span>
                <span className="fw-700">₹{(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <hr />
            {[['Subtotal', `₹${cartTotal.toLocaleString()}`], ['Tax (5%)', `₹${tax}`], ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`]].map(([l, v]) => (
              <div key={l} className="d-flex justify-content-between mb-2 text-muted small"><span>{l}</span><span className="fw-600 text-dark">{v}</span></div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-900" style={{ fontSize: '1.2rem' }}>
              <span>Grand Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
