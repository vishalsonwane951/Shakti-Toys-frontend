import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import { productAPI, categoryAPI } from '../services/api'
import { SkeletonGrid } from '../components/common/Skeleton'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.data)) }, [])

  useEffect(() => {
    setLoading(true)
    productAPI.getAll({ category, search, sort, minPrice, maxPrice, page, limit: 12 })
      .then(r => { setProducts(r.data.products); setTotal(r.data.total); setPages(r.data.pages) })
      .finally(() => setLoading(false))
  }, [category, search, sort, minPrice, maxPrice, page])

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setPage(1)
    setSearchParams(p)
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-lg-3 mb-4">
          <div className="rounded-3 p-3" style={{ boxShadow: 'var(--card-shadow)', background: '#fff', position: 'sticky', top: '80px' }}>
            <h6 className="fw-800 mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>Filters</h6>
            
            <div className="mb-4">
              <label className="form-label fw-600 small text-muted text-uppercase" style={{ letterSpacing: 0.5 }}>Category</label>
              <div className="d-flex flex-column gap-1">
                <button className={`btn btn-sm text-start ${!category ? 'btn-primary-custom' : 'btn-outline-secondary'}`} style={{ borderRadius: 8 }} onClick={() => updateParam('category', '')}>All Products</button>
                {categories.map(c => (
                  <button key={c._id} className={`btn btn-sm text-start ${category === c._id ? 'btn-primary-custom' : 'btn-outline-secondary'}`} style={{ borderRadius: 8 }} onClick={() => updateParam('category', c._id)}>{c.name}</button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-600 small text-muted text-uppercase" style={{ letterSpacing: 0.5 }}>Price Range</label>
              <div className="d-flex gap-2">
                <input type="number" className="form-control form-control-sm" placeholder="Min ₹" defaultValue={minPrice} onBlur={e => updateParam('minPrice', e.target.value)} />
                <input type="number" className="form-control form-control-sm" placeholder="Max ₹" defaultValue={maxPrice} onBlur={e => updateParam('maxPrice', e.target.value)} />
              </div>
              <div className="d-flex flex-wrap gap-1 mt-2">
                {[['0','500'],['500','2000'],['2000','5000'],['5000','']].map(([mn,mx]) => (
                  <button key={mn} className="btn btn-outline-secondary btn-sm" style={{fontSize:'0.75rem'}} onClick={() => { updateParam('minPrice', mn); updateParam('maxPrice', mx) }}>
                    {mx ? `₹${mn}–₹${mx}` : `₹${mn}+`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label fw-600 small text-muted text-uppercase" style={{ letterSpacing: 0.5 }}>Sort By</label>
              <select className="form-select form-select-sm" value={sort} onChange={e => updateParam('sort', e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <button className="btn btn-outline-danger btn-sm mt-3 w-100" onClick={() => setSearchParams({})}>Clear All Filters</button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h5 className="mb-0 fw-700" style={{ fontFamily: 'var(--font-display)' }}>
                {search ? `Results for "${search}"` : category ? categories.find(c => c._id === category)?.name || 'Products' : 'All Products'}
              </h5>
              <small className="text-muted">{total} products found</small>
            </div>
          </div>

          {loading ? <SkeletonGrid count={8} /> : products.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '4rem' }}>🔍</div>
              <h5 className="mt-3">No products found</h5>
              <p className="text-muted">Try adjusting your filters</p>
              <button className="btn btn-primary-custom" onClick={() => setSearchParams({})}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {products.map(p => (
                  <div key={p._id} className="col-6 col-md-4">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
              {pages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p - 1)}>Prev</button></li>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <li key={p} className={`page-item ${page === p ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(p)}>{p}</button></li>
                    ))}
                    <li className={`page-item ${page === pages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button></li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
