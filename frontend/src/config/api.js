const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = {
  // Auth endpoints
  login: `${API_URL}/auth/login`,
  register: `${API_URL}/auth/register`,
  getMe: `${API_URL}/auth/me`,
  
  // Services
  services: `${API_URL}/services`,
  
  // Staff
  staff: `${API_URL}/staff`,
  staffAvailability: (staffId, date) => 
    `${API_URL}/staff/${staffId}/availability?date=${date}`,
  
  // Bookings
  bookings: `${API_URL}/bookings`,
  myBookings: `${API_URL}/bookings/my-bookings`,
  bookingAvailability: `${API_URL}/bookings/availability`,
  
  // Reviews
  reviews: `${API_URL}/reviews`,
  myReviews: `${API_URL}/reviews/my-reviews`,
  
  // Analytics
  analytics: `${API_URL}/analytics`,
};

export default api;
