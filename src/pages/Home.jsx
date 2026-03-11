import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import ProductCard from '../components/product/ProductCard'
import { productAPI, categoryAPI } from '../services/api'
import { SkeletonGrid } from '../components/common/Skeleton'

const heroSlides = [
  { title: 'Race Into', highlight: 'Adventure!', sub: 'Premium RC Cars & Toy Vehicles for every age', img: 'https://images.unsplash.com/photo-1594787317440-a7b4f7e90bc0?w=800', bg: 'linear-gradient(135deg, #1d3557 0%, #2d4a7a 100%)' },
  { title: 'Power Up With', highlight: 'Smart Gadgets', sub: 'Cutting-edge electronics and accessories', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800', bg: 'linear-gradient(135deg, #0d1b2a 0%, #1d3557 100%)' },
  { title: 'Best Deals on', highlight: 'Toy Cars', sub: 'Die-cast models, collectibles and more!', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', bg: 'linear-gradient(135deg, #240046 0%, #3c096c 100%)' }
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      productAPI.getAll({ featured: true, limit: 8 }),
      categoryAPI.getAll()
    ]).then(([pRes, cRes]) => {
      setFeatured(pRes.data.products)
      setCategories(cRes.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* HERO SLIDER */}
      <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 4500 }} loop className="hero-swiper">
        {heroSlides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div style={{ background: slide.bg, minHeight: '85vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(230,57,70,0.12), transparent)' }}></div>
              <div className="container py-5" style={{ position: 'relative', zIndex: 2 }}>
                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
                      <span className="hero-badge">⚡ New Arrivals 2024</span>
                      <h1 className="hero-title">{slide.title}<br /><span>{slide.highlight}</span></h1>
                      <p className="hero-subtitle">{slide.sub}</p>
                      <div className="d-flex gap-3 flex-wrap">
                        <Link to="/products" className="btn btn-lg" style={{ background: 'var(--primary)', color: '#fff', borderRadius: 12, fontWeight: 700, padding: '12px 32px' }}>
                          Shop Now <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                        <Link to="/products?featured=true" className="btn btn-lg btn-outline-light" style={{ borderRadius: 12, fontWeight: 700 }}>
                          Featured Deals
                        </Link>
                      </div>
                      <div className="d-flex gap-4 mt-4">
                        {[['500+','Products'],['10K+','Happy Customers'],['Free','Delivery >₹999']].map(([v, l]) => (
                          <div key={l}>
                            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>{v}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  <div className="col-lg-6 d-none d-lg-block text-center">
                    <motion.img src={slide.img} alt={slide.title} className="hero-img" initial={{ x: 80, opacity: 0, scale: 0.9 }} animate={{ x: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* PROMO BANNERS */}
      <div className="container my-5">
        <div className="row g-3">
          {[
            { icon: '🚗', title: 'RC Cars Sale', sub: 'Up to 40% off top brands', bg: 'linear-gradient(135deg, #e63946, #c1121f)', link: '/products?category=rc-cars' },
            { icon: '⚡', title: 'Electronics Week', sub: 'Latest gadgets & accessories', bg: 'linear-gradient(135deg, #1d3557, #2d4a7a)', link: '/products?category=electronics' },
            { icon: '🎁', title: 'Free Shipping', sub: 'On orders above ₹999', bg: 'linear-gradient(135deg, #2a9d8f, #21867a)', link: '/products' }
          ].map((b) => (
            <div className="col-md-4" key={b.title}>
              <Link to={b.link} className="text-decoration-none">
                <motion.div whileHover={{ scale: 1.03 }} className="rounded-3 p-4 d-flex align-items-center gap-3" style={{ background: b.bg, color: '#fff' }}>
                  <span style={{ fontSize: '2.5rem' }}>{b.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>{b.title}</div>
                    <div style={{ opacity: 0.85, fontSize: '0.85rem' }}>{b.sub}</div>
                  </div>
                </motion.div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="section-title mb-1">Shop by <span>Category</span></h2>
            <div className="divider-custom"></div>
          </div>
          <Link to="/products" className="btn btn-outline-primary-custom btn-sm">View All</Link>
        </div>
        <div className="row g-3">
          {categories.slice(0, 6).map((cat) => (
            <div className="col-6 col-md-4 col-lg-2" key={cat._id}>
              <motion.div whileHover={{ scale: 1.04 }} className="category-card" onClick={() => navigate(`/products?category=${cat._id}`)}>
                <img src={cat.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'} alt={cat.name} />
                <div className="category-label">{cat.name}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="section-title mb-1">Featured <span>Products</span></h2>
            <div className="divider-custom"></div>
          </div>
          <Link to="/products?featured=true" className="btn btn-outline-primary-custom btn-sm">View All</Link>
        </div>
        {loading ? <SkeletonGrid count={8} /> : (
          <div className="row g-3">
            {featured.map(p => (
              <div key={p._id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WHY CHOOSE US */}
      <div style={{ background: 'var(--bg-light)', padding: '4rem 0', marginTop: '2rem' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose <span>Shakti Toys?</span></h2>
            <div className="divider-custom mx-auto"></div>
          </div>
          <div className="row g-4">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Free shipping on orders above ₹999. Express delivery available.' },
              { icon: '✅', title: 'Genuine Products', desc: '100% authentic products from certified brands and manufacturers.' },
              { icon: '🔄', title: 'Easy Returns', desc: '7-day hassle-free return policy. No questions asked.' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Multiple payment options with bank-grade security.' }
            ].map(f => (
              <div className="col-6 col-md-3" key={f.title}>
                <motion.div whileHover={{ y: -4 }} className="text-center p-4 rounded-3 bg-white" style={{ boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{f.icon}</div>
                  <h6 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--secondary)' }}>{f.title}</h6>
                  <p className="text-muted small mb-0">{f.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
