import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : redirect)
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed') }
    setLoading(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #2d4a7a 100%)', padding: '2rem 0' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card border-0 p-4 p-md-5" style={{ width: '100%', maxWidth: 440, borderRadius: 20, boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚗</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)' }}>Welcome Back!</h3>
          <p className="text-muted">Sign in to Shakti Toys & Electronics</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-600">Email Address</label>
            <input type="email" className="form-control form-control-lg" placeholder="your@email.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ borderRadius: 10 }} />
          </div>
          <div className="mb-4">
            <label className="form-label fw-600">Password</label>
            <input type="password" className="form-control form-control-lg" placeholder="••••••••" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ borderRadius: 10 }} />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary-custom w-100 btn-lg" style={{ borderRadius: 10 }} disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</> : 'Sign In'}
          </motion.button>
        </form>
        <p className="text-center mt-4 mb-0 text-muted">Don't have an account? <Link to="/register" className="fw-700" style={{ color: 'var(--primary)' }}>Register</Link></p>
        <div className="mt-3 p-3 rounded-3" style={{ background: '#f8f9fa', fontSize: '0.8rem' }}>
          <strong>Demo credentials:</strong><br />
          Admin: admin@shakti.com / admin123<br />
          User: user@shakti.com / user123
        </div>
      </motion.div>
    </div>
  )
}
