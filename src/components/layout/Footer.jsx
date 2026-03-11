import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{background:'var(--secondary)',color:'rgba(255,255,255,0.8)',paddingTop:'3rem',paddingBottom:'1.5rem',marginTop:'4rem'}}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{background:'var(--primary)',borderRadius:10,padding:'4px 10px',fontSize:'1.3rem'}}>🚗</span>
              <span style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:800,color:'#fff'}}>Shakti <span style={{color:'var(--accent)'}}>Toys</span> & Electronics</span>
            </div>
            <p style={{fontSize:'0.9rem',lineHeight:1.7}}>Your one-stop shop for toy cars, remote control vehicles, electronics, and gadgets. Quality products at amazing prices!</p>
            <div className="d-flex gap-3 mt-3">
              {['facebook','instagram','twitter','youtube'].map(s => (
                <a key={s} href="#" style={{color:'rgba(255,255,255,0.6)',fontSize:'1.3rem',transition:'color 0.2s'}} onMouseEnter={e=>e.target.style.color='var(--accent)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.6)'}>
                  <i className={`bi bi-${s}`}></i>
                </a>
              ))}
            </div>
          </div>
          <div className="col-6 col-md-2">
            <h6 style={{color:'#fff',fontWeight:700,marginBottom:'1rem'}}>Shop</h6>
            <ul className="list-unstyled" style={{fontSize:'0.9rem'}}>
              {[['Toy Cars','/products?category=toy-cars'],['RC Cars','/products?category=rc-cars'],['Toy Bikes','/products?category=toy-bikes'],['Electronics','/products?category=electronics'],['Gadgets','/products?category=gadgets']].map(([n,l]) => (
                <li key={n} className="mb-1"><Link to={l} style={{color:'rgba(255,255,255,0.7)',textDecoration:'none'}}>{n}</Link></li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-md-2">
            <h6 style={{color:'#fff',fontWeight:700,marginBottom:'1rem'}}>Account</h6>
            <ul className="list-unstyled" style={{fontSize:'0.9rem'}}>
              {[['My Account','/dashboard'],['My Orders','/dashboard'],['Cart','/cart'],['Wishlist','/dashboard'],['Login','/login']].map(([n,l]) => (
                <li key={n} className="mb-1"><Link to={l} style={{color:'rgba(255,255,255,0.7)',textDecoration:'none'}}>{n}</Link></li>
              ))}
            </ul>
          </div>
          <div className="col-md-4">
            <h6 style={{color:'#fff',fontWeight:700,marginBottom:'1rem'}}>Contact Us</h6>
            <div style={{fontSize:'0.9rem'}}>
              <p><i className="bi bi-geo-alt me-2" style={{color:'var(--accent)'}}></i>123 Toy Market, Mumbai, Maharashtra</p>
              <p><i className="bi bi-telephone me-2" style={{color:'var(--accent)'}}></i>+91 98765 43210</p>
              <p><i className="bi bi-envelope me-2" style={{color:'var(--accent)'}}></i>info@shaktitoys.com</p>
              <p><i className="bi bi-clock me-2" style={{color:'var(--accent)'}}></i>Mon–Sat: 9AM–8PM</p>
            </div>
          </div>
        </div>
        <hr style={{borderColor:'rgba(255,255,255,0.15)'}} />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <p className="mb-0" style={{fontSize:'0.85rem'}}>© 2024 Shakti Toys & Electronics. All rights reserved.</p>
          <div className="d-flex gap-2">
            {['visa','mastercard','upi','gpay'].map(p => (
              <span key={p} style={{background:'rgba(255,255,255,0.1)',borderRadius:6,padding:'3px 10px',fontSize:'0.75rem',color:'#fff'}}>{p.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
