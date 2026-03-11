import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'
import { productAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/common/StarRating'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    productAPI.getOne(id).then(r => setProduct(r.data)).finally(() => setLoading(false))
  }, [id])

  const handleAddReview = async () => {
    if (!user) return toast.error('Please login to review')
    if (!reviewComment.trim()) return toast.error('Comment required')
    setSubmitting(true)
    try {
      await productAPI.addReview(id, { rating: reviewRating, comment: reviewComment })
      toast.success('Review added!')
      setReviewComment('')
      const r = await productAPI.getOne(id)
      setProduct(r.data)
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    setSubmitting(false)
  }

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border" style={{color:'var(--primary)'}}></div></div>
  if (!product) return <div className="container py-5 text-center"><h4>Product not found</h4><Link to="/products" className="btn btn-primary-custom mt-3">Back to Products</Link></div>

  const imgs = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Gallery */}
        <div className="col-lg-6">
          <Swiper modules={[Navigation, Thumbs]} thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }} navigation style={{borderRadius:16,overflow:'hidden',boxShadow:'var(--card-shadow)'}}>
            {imgs.map((img, i) => (
              <SwiperSlide key={i}><img src={img} alt={product.name} style={{width:'100%',height:420,objectFit:'cover'}} /></SwiperSlide>
            ))}
          </Swiper>
          {imgs.length > 1 && (
            <Swiper onSwiper={setThumbsSwiper} spaceBetween={8} slidesPerView={4} style={{marginTop:12}}>
              {imgs.map((img, i) => (
                <SwiperSlide key={i}><img src={img} alt="" style={{width:'100%',height:80,objectFit:'cover',borderRadius:8,cursor:'pointer',border:'2px solid transparent'}} /></SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Info */}
        <div className="col-lg-6">
          <span className="badge mb-2" style={{background:'var(--accent)',color:'var(--secondary)'}}>{product.category?.name}</span>
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,color:'var(--secondary)'}}>{product.name}</h2>
          <div className="d-flex align-items-center gap-2 mb-3">
            <StarRating rating={product.rating} size="lg" />
            <span className="text-muted">({product.numReviews} reviews)</span>
          </div>
          <div className="d-flex align-items-center gap-3 mb-3">
            <span style={{fontSize:'2rem',fontWeight:900,color:'var(--primary)',fontFamily:'var(--font-display)'}}>₹{product.price}</span>
            {product.originalPrice > product.price && <>
              <span style={{fontSize:'1.1rem',color:'#999',textDecoration:'line-through'}}>₹{product.originalPrice}</span>
              <span className="badge" style={{background:'#d4edda',color:'#155724'}}>Save ₹{product.originalPrice - product.price}</span>
            </>}
          </div>
          <p className="text-muted" style={{lineHeight:1.8}}>{product.description}</p>
          
          {product.stock > 0 ? (
            <span className="badge mb-3" style={{background:'#d4edda',color:'#155724'}}><i className="bi bi-check-circle me-1"></i>In Stock ({product.stock})</span>
          ) : (
            <span className="badge mb-3 bg-danger">Out of Stock</span>
          )}

          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="qty-control border rounded-3 p-1">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="px-3 fw-700">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} className="btn btn-primary-custom px-4" disabled={product.stock === 0} onClick={() => addToCart(product, qty)}>
              <i className="bi bi-cart-plus me-2"></i>Add to Cart
            </motion.button>
          </div>

          {product.specifications?.length > 0 && (
            <div className="mt-3">
              <h6 className="fw-700 mb-2">Specifications</h6>
              <table className="table table-sm table-bordered">
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i}><td className="text-muted" style={{width:'40%'}}>{s.key}</td><td className="fw-600">{s.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-5">
        <h4 className="section-title mb-1">Customer <span>Reviews</span></h4>
        <div className="divider-custom"></div>
        {product.reviews?.length === 0 && <p className="text-muted">No reviews yet. Be the first!</p>}
        <div className="row g-3 mb-4">
          {product.reviews?.map(r => (
            <div className="col-md-6" key={r._id}>
              <div className="p-3 rounded-3" style={{border:'1px solid #e9ecef'}}>
                <div className="d-flex justify-content-between">
                  <strong>{r.name}</strong>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-muted mt-1 mb-0">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
        {user && (
          <div className="p-4 rounded-3" style={{border:'1px solid #e9ecef',background:'#fafafa'}}>
            <h6 className="fw-700 mb-3">Write a Review</h6>
            <div className="mb-3">
              <label className="form-label">Rating</label>
              <div className="d-flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`btn btn-sm ${reviewRating >= n ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setReviewRating(n)}>{n}★</button>
                ))}
              </div>
            </div>
            <textarea className="form-control mb-3" rows={3} placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <button className="btn btn-primary-custom" onClick={handleAddReview} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
