const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffAvailability,
  staffPhotoUpload
} = require('../controllers/staff');

// Include other resource routers
const bookingRouter = require('./bookings');

// Re-route into other resource routers
router.use('/:staffId/bookings', bookingRouter);

// Public routes
router.route('/').get(getStaff);
router.route('/:id').get(getStaffMember);
router.route('/:id/availability').get(getStaffAvailability);

// Protected routes (admin only)
router.use(protect, authorize('admin'));
router.route('/').post(createStaff);
router.route('/:id').put(updateStaff).delete(deleteStaff);
router.route('/:id/photo').put(staffPhotoUpload);

module.exports = router;
