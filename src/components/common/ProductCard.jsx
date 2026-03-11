import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const Stars = ({ rating }) => (
  <div className="d-flex align-items-center gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <FiStar key={s} size={12} fill={s <= Math.round(rating) ? '#ffc107' : 'none'} color={s <= Math.round(rating) ? '#ffc107' : '#ccc'} />
    ))}
    <span className="text-muted" style={{ fontSize: '0.75rem' }}>({rating?.toFixed(1)})</span>
  </div>
);

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const navigate = useNavigate();

  const imgSrc = product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add to wishlist'); navigate('/login'); return; }
    try {
      await userAPI.toggleWishlist(product._id);
      setWishlisted(w => !w);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/products/${product._id}`} className="text-decoration-none">
        <div className="card product-card">
          <div className="product-img-wrap">
            <img src={imgSrc} alt={product.name} loading="lazy" />
            {product.discount > 0 && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
            <button className="wishlist-btn" onClick={handleWishlist} title="Add to wishlist">
              <FiHeart size={14} fill={wishlisted ? '#e63946' : 'none'} color={wishlisted ? '#e63946' : '#333'} />
            </button>
          </div>
          <div className="card-body p-3">
            <p className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category?.name || 'Toy'}
            </p>
            <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.88rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.name}
            </h6>
            <Stars rating={product.rating || 0} />
            <div className="d-flex align-items-center gap-2 mt-2">
              <span className="fw-bold text-danger fs-6">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className="text-muted text-decoration-line-through small">₹{product.originalPrice?.toLocaleString()}</span>
              )}
            </div>
            {product.stock === 0 ? (
              <span className="badge bg-secondary w-100 mt-2">Out of Stock</span>
            ) : (
              <button className="btn btn-danger btn-sm w-100 mt-2 fw-bold d-flex align-items-center justify-content-center gap-1"
                onClick={handleAddToCart}>
                <FiShoppingCart size={14} /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
