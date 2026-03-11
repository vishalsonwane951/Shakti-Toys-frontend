import axios from 'axios'
// const API = 'http//localhost:5000'

const API = axios.create({ 
baseURL:'https://shakti-toys-backend.onrender.com/api' })

API.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('shakti_user') || 'null')
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  return config
})
console.log('API base:', API.defaults.baseURL)
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  addAddress: (data) => API.post('/auth/addresses', data),
  updateAddress: (id, data) => API.put(`/auth/addresses/${id}`, data),
  toggleWishlist: (id) => API.post(`/auth/wishlist/${id}`)
}

export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/products/${id}`),
  addReview: (id, data) => API.post(`/products/${id}/reviews`, data)
}

export const categoryAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/categories/${id}`)
}

export const orderAPI = {
  create: (data) => API.post('/orders', data),
  createOffline: (data) => API.post('/orders/offline', data),
  getMy: () => API.get('/orders/my'),
  getOne: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get('/orders/admin/all', { params }),
  getStats: () => API.get('/orders/admin/stats'),
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
  getPaymentStatus: (id) => API.get(`/orders/${id}/payment-status`),
  markPaid: (id, data) => API.put(`/orders/${id}/mark-paid`, data),
  markFailed: (id) => API.put(`/orders/${id}/mark-failed`),

}

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`)
}

export default API
