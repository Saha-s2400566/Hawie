const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardAnalytics,
  getBookingAnalytics,
  getRevenueAnalytics,
  getCustomerAnalytics,
  getStaffAnalytics
} = require('../controllers/analytics');

// All routes are protected and admin-only
router.use(protect, authorize('admin'));

// Dashboard overview
router.get('/dashboard', getDashboardAnalytics);

// Detailed analytics
router.get('/bookings', getBookingAnalytics);
router.get('/revenue', getRevenueAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/staff', getStaffAnalytics);

module.exports = router;
