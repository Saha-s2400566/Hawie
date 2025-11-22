const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');
const {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
  getStaffBookings,
  getServiceBookings,
  getAvailableSlots,
  cancelBooking,
  completeBooking
} = require('../controllers/bookings');

// Middleware to check if the user is the owner of the booking or an admin
const checkBookingOwnership = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if the user is the owner of the booking, the assigned staff, or an admin
    if (
      booking.user.toString() !== req.user.id && 
      booking.staff.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this booking' 
      });
    }
    
    req.booking = booking;
    next();
  } catch (error) {
    next(error);
  }
};

// Public routes
router.get('/available', getAvailableSlots);

// Protected routes (require authentication)
router.use(protect);

// User-specific routes
router.get('/my-bookings', getMyBookings);
router.get('/staff/:staffId', getStaffBookings);
router.get('/service/:serviceId', getServiceBookings);

// Admin and staff routes
router.get('/', authorize('admin', 'staff'), getBookings);
router.post('/', addBooking);
router.get('/:id', checkBookingOwnership, getBooking);
router.put('/:id', checkBookingOwnership, updateBooking);
router.delete('/:id', checkBookingOwnership, deleteBooking);
router.put('/:id/cancel', checkBookingOwnership, cancelBooking);
router.put('/:id/complete', authorize('admin', 'staff'), completeBooking);

module.exports = router;
