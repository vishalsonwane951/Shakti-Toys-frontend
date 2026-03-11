import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productAPI, categoryAPI } from '../../services/api'
import toast from 'react-hot-toast'

const emptyForm = { name: '', description: '', price: '', originalPrice: '', stock: '', brand: '', category: '', discount: '', isFeatured: false, tags: '', specifications: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = () => {
    setLoading(true)
    productAPI.getAll({ search, page, limit: 10 }).then(r => {
      setProducts(r.data.products); setTotalPages(r.data.pages)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [search, page])
  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.data)) }, [])

  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice, stock: p.stock, brand: p.brand, category: p.category?._id || '', discount: p.discount || '', isFeatured: p.isFeatured, tags: (p.tags || []).join(', '), specifications: JSON.stringify(p.specifications || []) })
    setImages([])
    setShowModal(true)
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setImages([]); setShowModal(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      images.forEach(f => fd.append('images', f))
      if (editing) await productAPI.update(editing._id, fd)
      else await productAPI.create(fd)
      toast.success(editing ? 'Product updated!' : 'Product created!')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await productAPI.delete(id)
    toast.success('Product deleted'); load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)', marginBottom: 0 }}>Products</h4>
        <button className="btn btn-primary-custom" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>Add Product</button>
      </div>

      <div className="rounded-3 p-4" style={{ background: '#fff', boxShadow: 'var(--card-shadow)' }}>
        <div className="mb-3">
          <input className="form-control" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ maxWidth: 350 }} />
        </div>
        {loading ? <div className="text-center py-4"><div className="spinner-border" style={{color:'var(--primary)'}}></div></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={p.images?.[0] || ''} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                        <div>
                          <div className="fw-700 small">{p.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="small">{p.category?.name}</td>
                    <td className="fw-700 small" style={{ color: 'var(--primary)' }}>₹{p.price}</td>
                    <td><span className={`badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>{p.stock}</span></td>
                    <td>{p.isFeatured ? <i className="bi bi-star-fill text-warning"></i> : <i className="bi bi-star text-muted"></i>}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(p)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span className="btn btn-sm disabled">Page {page} / {totalPages}</span>
                <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-800">{editing ? 'Edit Product' : 'Add New Product'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12"><label className="form-label fw-600">Product Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="col-12"><label className="form-label fw-600">Description *</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div className="col-md-4"><label className="form-label fw-600">Price (₹) *</label><input type="number" className="form-control" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                  <div className="col-md-4"><label className="form-label fw-600">Original Price (₹)</label><input type="number" className="form-control" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} /></div>
                  <div className="col-md-4"><label className="form-label fw-600">Stock *</label><input type="number" className="form-control" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
                  <div className="col-md-6">
                    <label className="form-label fw-600">Category *</label>
                    <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3"><label className="form-label fw-600">Brand</label><input className="form-control" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
                  <div className="col-md-3"><label className="form-label fw-600">Discount (%)</label><input type="number" className="form-control" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
                  <div className="col-12"><label className="form-label fw-600">Tags (comma separated)</label><input className="form-control" placeholder="toy, car, red, kids" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
                  <div className="col-12"><label className="form-label fw-600">Specifications (JSON)</label><textarea className="form-control font-monospace" rows={3} placeholder='[{"key":"Color","value":"Red"}]' value={form.specifications} onChange={e => setForm(f => ({ ...f, specifications: e.target.value }))} /></div>
                  <div className="col-12">
                    <label className="form-label fw-600">Product Images</label>
                    <input type="file" className="form-control" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))} />
                    {images.length > 0 && <small className="text-muted">{images.length} file(s) selected</small>}
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="featured">Mark as Featured Product</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary-custom" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
