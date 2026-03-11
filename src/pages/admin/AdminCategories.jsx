import React, { useState, useEffect } from 'react'
import { categoryAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => { categoryAPI.getAll().then(r => setCategories(r.data)).finally(() => setLoading(false)) }
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setImageFile(null); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setImageFile(null); setShowModal(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name); fd.append('description', form.description)
      if (imageFile) fd.append('image', imageFile)
      if (editing) await categoryAPI.update(editing._id, fd)
      else await categoryAPI.create(fd)
      toast.success(editing ? 'Category updated!' : 'Category created!')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    await categoryAPI.delete(id); toast.success('Category deleted'); load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)', marginBottom: 0 }}>Categories</h4>
        <button className="btn btn-primary-custom" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>Add Category</button>
      </div>
      <div className="row g-3">
        {loading ? <div className="col-12 text-center py-4"><div className="spinner-border" style={{color:'var(--primary)'}}></div></div> : categories.map(c => (
          <div className="col-6 col-md-4 col-lg-3" key={c._id}>
            <div className="rounded-3 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)', background: '#fff' }}>
              <div style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
                <img src={c.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}></div>
                <div style={{ position: 'absolute', bottom: 8, left: 12, color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{c.name}</div>
              </div>
              <div className="p-3">
                <p className="text-muted small mb-2">{c.description || 'No description'}</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => openEdit(c)}><i className="bi bi-pencil me-1"></i>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}><i className="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-800">{editing ? 'Edit Category' : 'Add Category'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label fw-600">Category Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="mb-3"><label className="form-label fw-600">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="mb-3"><label className="form-label fw-600">Category Image</label><input type="file" className="form-control" accept="image/*" onChange={e => setImageFile(e.target.files[0])} /></div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary-custom" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
