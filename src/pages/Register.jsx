import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to Shakti Toys!')
      navigate('/')
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
    setLoading(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #2d4a7a 100%)', padding: '2rem 0' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card border-0 p-4 p-md-5" style={{ width: '100%', maxWidth: 480, borderRadius: 20, boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)' }}>Create Account</h3>
          <p className="text-muted">Join Shakti Toys & Electronics</p>
        </div>
        <form onSubmit={handleSubmit}>
          {[['name','Full Name','text','Your full name'],['email','Email Address','email','your@email.com'],['password','Password','password','Min 6 characters'],['confirm','Confirm Password','password','Repeat password']].map(([k, l, t, ph]) => (
            <div className="mb-3" key={k}>
              <label className="form-label fw-600">{l}</label>
              <input type={t} className="form-control form-control-lg" placeholder={ph} required value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={{ borderRadius: 10 }} />
            </div>
          ))}
          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary-custom w-100 btn-lg mt-2" style={{ borderRadius: 10 }} disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : 'Create Account'}
          </motion.button>
        </form>
        <p className="text-center mt-4 mb-0 text-muted">Already have an account? <Link to="/login" className="fw-700" style={{ color: 'var(--primary)' }}>Sign In</Link></p>
      </motion.div>
    </div>
  )
}
