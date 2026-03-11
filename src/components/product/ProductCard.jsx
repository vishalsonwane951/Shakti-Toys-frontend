import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import StarRating from '../common/StarRating'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [wishlisted, setWishlisted] = React.useState(false)

  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return toast.error('Login to add to wishlist')
    try {
      await authAPI.toggleWishlist(product._id)
      setWishlisted(w => !w)
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
    } catch {}
  }

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
      <div className="product-card card h-100 position-relative">
        {product.discount > 0 && <span className="discount-badge">{product.discount}% OFF</span>}
        <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist}>
          <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>
        <Link to={`/products/${product._id}`} className="text-decoration-none">
          <div className="card-img-wrap">
            <img src={img} alt={product.name} loading="lazy" />
          </div>
          <div className="card-body pb-2">
            <p className="text-muted small mb-1" style={{fontSize:'0.75rem',textTransform:'uppercase',letterSpacing:0.5}}>{product.category?.name || ''}</p>
            <h6 className="card-title mb-1 text-dark" style={{fontSize:'0.9rem',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{product.name}</h6>
            <div className="d-flex align-items-center gap-1 mb-2">
              <StarRating rating={product.rating} />
              <span className="text-muted" style={{fontSize:'0.75rem'}}>({product.numReviews})</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="price-new">₹{product.price}</span>
              {product.originalPrice > product.price && <span className="price-old">₹{product.originalPrice}</span>}
            </div>
          </div>
        </Link>
        <div className="card-footer bg-transparent border-0 pt-0 pb-3 px-3">
          {product.stock > 0 ? (
            <button className="btn btn-primary-custom w-100 btn-sm" onClick={() => addToCart(product)}>
              <i className="bi bi-cart-plus me-1"></i> Add to Cart
            </button>
          ) : (
            <button className="btn btn-secondary w-100 btn-sm" disabled>Out of Stock</button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
