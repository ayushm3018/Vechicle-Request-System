import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  verifyToken: () => api.post('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

// Vehicles API
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getAvailable: () => api.get('/vehicles/available'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (vehicleData) => api.post('/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Requests API
export const requestAPI = {
  create: (requestData) => api.post('/requests', requestData),
  getMyRequests: () => api.get('/requests/my-requests'),
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  approve: (id, vehicleId) => api.post(`/requests/${id}/approve`, { vehicle_id: vehicleId }),
  reject: (id, reason) => api.post(`/requests/${id}/reject`, { rejection_reason: reason }),
  getDashboardStats: () => api.get('/requests/stats/dashboard'),
};

export default api;