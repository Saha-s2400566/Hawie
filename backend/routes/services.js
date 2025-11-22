const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  servicePhotoUpload
} = require('../controllers/services');

// Include other resource routers
const bookingRouter = require('./bookings');
const reviewRouter = require('./reviews');

// Re-route into other resource routers
router.use('/:serviceId/bookings', bookingRouter);
router.use('/:serviceId/reviews', reviewRouter);

// Public routes
router.route('/').get(getServices);
router.route('/:id').get(getService);

// Protected routes (admin only)
router.use(protect, authorize('admin'));
router.route('/').post(createService);
router.route('/:id').put(updateService).delete(deleteService);
router.route('/:id/photo').put(servicePhotoUpload);

module.exports = router;
