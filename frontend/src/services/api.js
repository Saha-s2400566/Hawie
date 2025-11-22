import axios from 'axios';
import { api } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
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

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post(api.login, credentials),
  register: (userData) => apiClient.post(api.register, userData),
  getMe: () => apiClient.get(api.getMe),
};

// Services API
export const servicesAPI = {
  getAll: () => apiClient.get(api.services),
  getById: (id) => apiClient.get(`${api.services}/${id}`),
  create: (serviceData) => apiClient.post(api.services, serviceData),
  update: (id, serviceData) => apiClient.put(`${api.services}/${id}`, serviceData),
  delete: (id) => apiClient.delete(`${api.services}/${id}`),
};

// Staff API
export const staffAPI = {
  getAll: () => apiClient.get(api.staff),
  getById: (id) => apiClient.get(`${api.staff}/${id}`),
  getAvailability: (staffId, date) => 
    apiClient.get(api.staffAvailability(staffId, date)),
  update: (id, staffData) => apiClient.put(`${api.staff}/${id}`, staffData),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = '') => apiClient.get(`${api.bookings}${params}`),
  getById: (id) => apiClient.get(`${api.bookings}/${id}`),
  create: (bookingData) => apiClient.post(api.bookings, bookingData),
  update: (id, bookingData) => apiClient.put(`${api.bookings}/${id}`, bookingData),
  cancel: (id) => apiClient.put(`${api.bookings}/${id}/cancel`),
  complete: (id) => apiClient.put(`${api.bookings}/${id}/complete`),
  checkAvailability: (data) => apiClient.post(api.bookingAvailability, data),
  getMyBookings: () => apiClient.get(api.myBookings),
};

// Reviews API
export const reviewsAPI = {
  getAll: (params = '') => apiClient.get(`${api.reviews}${params}`),
  getById: (id) => apiClient.get(`${api.reviews}/${id}`),
  create: (reviewData) => apiClient.post(api.reviews, reviewData),
  update: (id, reviewData) => apiClient.put(`${api.reviews}/${id}`, reviewData),
  delete: (id) => apiClient.delete(`${api.reviews}/${id}`),
  approve: (id) => apiClient.put(`${api.reviews}/${id}/approve`),
  getMyReviews: () => apiClient.get(api.myReviews),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => apiClient.get(`${api.analytics}/dashboard`),
  getBookingAnalytics: (params = '') => 
    apiClient.get(`${api.analytics}/bookings${params}`),
  getRevenueAnalytics: (params = '') => 
    apiClient.get(`${api.analytics}/revenue${params}`),
  getCustomerAnalytics: () => apiClient.get(`${api.analytics}/customers`),
  getStaffAnalytics: () => apiClient.get(`${api.analytics}/staff`),
};

export default {
  auth: authAPI,
  services: servicesAPI,
  staff: staffAPI,
  bookings: bookingsAPI,
  reviews: reviewsAPI,
  analytics: analyticsAPI,
};
