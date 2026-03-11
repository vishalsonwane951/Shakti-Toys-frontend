import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success && result.user.role === 'admin') {
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } else if (result.success) {
      toast.error('Admin access required');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, var(--bg-dark), var(--secondary))' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="text-center mb-4">
              <div className="logo-icon mx-auto mb-3" style={{ width: 60, height: 60, fontSize: '1.8rem' }}>⚡</div>
              <h2 className="text-white fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Admin Panel</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Shakti Toys & Electronics</p>
            </div>
            <div className="card" style={{ border: 'none', borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Admin Email</label>
                    <input type="email" className="form-control" placeholder="admin@shakti.com" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <button className="btn btn-danger w-100 fw-bold py-2" type="submit" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : '⚡ '}
                    Admin Login
                  </button>
                </form>
                <p className="text-center text-muted small mt-3">admin@shakti.com / admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
