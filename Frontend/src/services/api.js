import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('thrifto_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('thrifto_token');
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

/* ── Auth ── */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.patch(`/users/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePassword: (data) => api.post('/users/password', data),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (itemId) => api.post('/users/wishlist', { itemId }),
  getDashboard: () => api.get('/users/me/dashboard'),
};

/* ── Clothes ── */
export const clothesAPI = {
  getAll: (params) => api.get('/clothes', { params }),
  getOne: (id) => api.get(`/clothes/${id}`),
  create: (data) => api.post('/clothes', data),
  update: (id, data) => api.patch(`/clothes/${id}`, data),
  remove: (id) => api.delete(`/clothes/${id}`),
  getRecommended: (params) => api.get('/clothes/recommended', { params }),
  getNearby: (params) => api.get('/clothes/nearby', { params }),
};

/* ── Posts ── */
export const postAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getOne: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  comment: (id, data) => api.post(`/posts/${id}/comments`, data),
};

/* ── Donations ── */
export const donationAPI = {
  getAll: (params) => api.get('/donations', { params }),
  getOne: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
  updateStatus: (id, data) => api.patch(`/donations/${id}/status`, data),
};

/* ── Swaps ── */
export const swapAPI = {
  getAll: (params) => api.get('/swaps', { params }),
  getOne: (id) => api.get(`/swaps/${id}`),
  create: (data) => api.post('/swaps', data),
  respond: (id, data) => api.patch(`/swaps/${id}`, data),
};

/* ── Orders ── */
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

/* ── Chats ── */
export const chatAPI = {
  getAll: () => api.get('/chats'),
  create: (data) => api.post('/chats', data),
  createAdminChat: () => api.post('/chats/admin'),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
};

/* ── Admin ── */
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getMessages: (params) => api.get('/admin/messages', { params }),
  getActivities: (params) => api.get('/admin/activities', { params }),
  banUser: (id, data) => api.patch(`/admin/users/${id}/ban`, data),
  getAnalytics: () => api.get('/admin/analytics'),
};

/* ── Notifications ── */
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

/* ── Reviews ── */
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};

/* ── Reports ── */
export const reportAPI = {
  create: (data) => api.post('/reports', data),
  getAll: () => api.get('/reports'),
  resolve: (id) => api.patch(`/reports/${id}/resolve`),
};

export default api;
