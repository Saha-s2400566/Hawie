const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  approveReview,
  getServiceReviews,
  getStaffReviews,
  getMyReviews
} = require('../controllers/reviews');

// Middleware to check if the user is the owner of the review or an admin
const checkReviewOwnership = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check if the user is the owner of the review or an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }
    
    req.review = review;
    next();
  } catch (error) {
    next(error);
  }
};

// Public routes
router.get('/', getReviews);
router.get('/service/:serviceId', getServiceReviews);
router.get('/staff/:staffId', getStaffReviews);
router.get('/:id', getReview);

// Protected routes (require authentication)
router.use(protect);

// User-specific routes
router.get('/my-reviews', getMyReviews);
router.post('/', addReview);

// Review ownership required
router.put('/:id', checkReviewOwnership, updateReview);
router.delete('/:id', checkReviewOwnership, deleteReview);

// Admin only routes
router.put('/:id/approve', authorize('admin'), approveReview);

module.exports = router;
