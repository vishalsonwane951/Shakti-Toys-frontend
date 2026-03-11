import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', password: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const load = () => { adminAPI.getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false)) }
  useEffect(load, [])

  const openEdit = (u) => {
    setEditing(u)
    setEditForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', isActive: u.isActive })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = { ...editForm }
      if (!body.password) delete body.password
      await adminAPI.updateUser(editing._id, body)
      toast.success('User updated!')
      setEditing(null); load()
    } catch { toast.error('Update failed') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Disable this user?')) return
    await adminAPI.deleteUser(id)
    toast.success('User disabled'); load()
  }

  return (
    <div>
      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--secondary)', marginBottom: '1.5rem' }}>User Management</h4>
      <div className="rounded-3 p-4" style={{ background: '#fff', boxShadow: 'var(--card-shadow)' }}>
        {loading ? <div className="text-center py-4"><div className="spinner-border" style={{color:'var(--primary)'}}></div></div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr><th>User</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&size=40&background=e63946&color=fff`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        <span className="fw-700 small">{u.name}</span>
                      </div>
                    </td>
                    <td className="small text-muted">{u.email}</td>
                    <td className="small">{u.phone || '—'}</td>
                    <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${u.isActive ? 'bg-success' : 'bg-danger'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(u)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u._id)}><i className="bi bi-ban"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-800">Edit User</h5>
                <button className="btn-close" onClick={() => setEditing(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[['name','Name','text'],['email','Email','email'],['phone','Phone','tel']].map(([k, l, t]) => (
                    <div className="col-12" key={k}>
                      <label className="form-label fw-600">{l}</label>
                      <input type={t} className="form-control" value={editForm[k]} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="col-12">
                    <label className="form-label fw-600">New Password <span className="text-muted small">(leave blank to keep)</span></label>
                    <input type="password" className="form-control" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="isActive" checked={editForm.isActive} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="isActive">Account Active</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn btn-primary-custom" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
