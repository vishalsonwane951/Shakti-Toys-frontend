import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getWishlist().then(r => setWishlist(r.data.wishlist)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border text-danger"></div></div>;

  return (
    <div className="container py-5">
      <div className="section-header mb-4">
        <h2><FiHeart className="text-danger me-2" />My Wishlist</h2>
        <div className="header-line"></div>
        <span className="text-muted">{wishlist.length} items</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '5rem' }}>💔</div>
          <h4 className="mt-3">Your wishlist is empty</h4>
          <p className="text-muted">Add products you love to see them here</p>
          <Link to="/products" className="btn btn-danger">Browse Products</Link>
        </div>
      ) : (
        <div className="row g-3">
          {wishlist.map((p, i) => (
            <div key={p._id} className="col-6 col-md-3">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
