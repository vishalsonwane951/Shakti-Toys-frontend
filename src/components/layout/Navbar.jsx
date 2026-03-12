import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  console.log('Navbar user:', user)
console.log('Navbar avatar:', user?.avatar)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/products?search=${search.trim()}`); setSearch('') }
  }

  return (
    <nav className="navbar navbar-shakti navbar-expand-lg">
      <div className="container">
        <Link to="/" className="navbar-brand-shakti text-decoration-none">
          <span className="logo-icon">🚗</span>
          <span>Shakti <span style={{ color: 'var(--accent)' }}>Toys</span> & Electronics</span>
        </Link>

        <form className="d-none d-md-flex flex-grow-1 mx-4" onSubmit={handleSearch}>
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Search toys, gadgets, RC cars..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: '8px 0 0 8px', border: 'none' }} />
            <button className="btn btn-primary-custom" type="submit" style={{ borderRadius: '0 8px 8px 0' }}><i className="bi bi-search"></i></button>
          </div>
        </form>

        <div className="d-flex align-items-center gap-2 ms-auto">
          <Link to="/cart" className="btn position-relative" style={{ color: '#fff', fontSize: '1.3rem' }}>
            <i className="bi bi-cart3"></i>
            {cartCount > 0 && <span className="badge rounded-pill position-absolute" style={{ top: '-4px', right: '-4px', background: 'var(--primary)', fontSize: '0.7rem' }}>{cartCount}</span>}
          </Link>

          {user ? (
            <div className="dropdown">
              <button className="btn btn-sm dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown" style={{ color: '#fff' }}>

                {user.avatar
                  ? <img
                    src={user.avatar.startsWith('http')
                      ? user.avatar
                      : `https://shakti-toys-backend.onrender.com${user.avatar}`
                    }
                    alt=""
                    style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  : <i className="bi bi-person-circle fs-5"></i>
                }
                <span className="d-none d-sm-inline">{user.name.split(' ')[0]}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li><Link className="dropdown-item" to="/dashboard"><i className="bi bi-speedometer2 me-2"></i>My Dashboard</Link></li>
                {isAdmin && <li><Link className="dropdown-item" to="/admin"><i className="bi bi-gear me-2"></i>Admin Panel</Link></li>}
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm btn-outline-light">Login</Link>
          )}

          <button className="navbar-toggler d-lg-none border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" style={{ color: '#fff' }}>
            <i className="bi bi-list fs-4"></i>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mt-3 mt-lg-0">
            <li className="nav-item"><Link className="nav-link text-white" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/products">All Products</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/products?category=toy-cars">Toy Cars</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/products?category=rc-cars">RC Cars</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/products?category=electronics">Electronics</Link></li>
          </ul>
          <form className="d-md-none mt-2" onSubmit={handleSearch}>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-primary-custom" type="submit"><i className="bi bi-search"></i></button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  )
}
