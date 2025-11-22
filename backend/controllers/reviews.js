const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');

// @desc    Get all reviews
// @desc    Get reviews for a specific service
// @route   GET /api/v1/reviews
// @route   GET /api/v1/services/:serviceId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.serviceId) {
    const reviews = await Review.find({ service: req.params.serviceId, isApproved: true })
      .populate({
        path: 'user',
        select: 'name'
      });
      
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else if (req.params.staffId) {
    const reviews = await Review.find({ staff: req.params.staffId, isApproved: true })
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'service',
        select: 'name'
      });
      
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    // Admin route - get all reviews (including unapproved)
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this route`,
          403
        )
      );
    }
    
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name'
    })
    .populate({
      path: 'service',
      select: 'name'
    });

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Only show unapproved reviews to admins or the reviewer
  if (!review.isApproved && 
      req.user.role !== 'admin' && 
      (!req.user || review.user._id.toString() !== req.user.id)) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: review });
});

// @desc    Add review
// @route   POST /api/v1/bookings/:bookingId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  // Check if booking exists and is completed
  const booking = await Booking.findById(req.params.bookingId);
  
  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.bookingId}`, 404)
    );
  }
  
  // Check if booking is completed
  if (booking.status !== 'completed') {
    return next(
      new ErrorResponse('You can only review completed bookings', 400)
    );
  }
  
  // Check if user is the one who made the booking
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to review this booking`,
        401
      )
    );
  }
  
  // Check if review already exists for this booking
  const existingReview = await Review.findOne({ booking: booking._id });
  if (existingReview) {
    return next(
      new ErrorResponse('You have already reviewed this booking', 400)
    );
  }
  
  // Add service and staff to review
  req.body.service = booking.service;
  req.body.staff = booking.staff;
  
  // Auto-approve if admin, otherwise needs approval
  if (req.user.role !== 'admin') {
    req.body.isApproved = false;
  }
  
  const review = await Review.create(req.body);
  
  // Populate the review with user and service details
  const newReview = await Review.findById(review._id)
    .populate({
      path: 'user',
      select: 'name'
    })
    .populate({
      path: 'service',
      select: 'name'
    });
  
  res.status(201).json({
    success: true,
    data: newReview,
    message: req.user.role === 'admin' 
      ? 'Review added successfully' 
      : 'Thank you for your review! It will be visible after approval.'
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user is review owner or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this review`,
        401
      )
    );
  }
  
  // If not admin, only allow updating rating and comment
  if (req.user.role !== 'admin') {
    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.isApproved = false; // Needs re-approval
    await review.save();
  } else {
    // Admin can update any field, including isApproved
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  }
  
  // Populate the updated review
  const updatedReview = await Review.findById(review._id)
    .populate({
      path: 'user',
      select: 'name'
    })
    .populate({
      path: 'service',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    data: updatedReview,
    message: req.user.role === 'admin' || review.isApproved
      ? 'Review updated successfully'
      : 'Your review has been updated and is pending approval.'
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is review owner or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this review`,
        401
      )
    );
  }

  await review.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Approve review (Admin only)
// @route   PUT /api/v1/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true, runValidators: true }
  )
    .populate({
      path: 'user',
      select: 'name'
    })
    .populate({
      path: 'service',
      select: 'name'
    });

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
    message: 'Review approved successfully'
  });
});

// @desc    Get reviews for the current user
// @route   GET /api/v1/reviews/my-reviews
// @access  Private
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate({
      path: 'service',
      select: 'name'
    })
    .populate({
      path: 'staff',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name'
      }
    });
    
  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Get pending reviews (Admin only)
// @route   GET /api/v1/reviews/pending
// @access  Private/Admin
exports.getPendingReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ isApproved: false })
    .populate({
      path: 'user',
      select: 'name'
    })
    .populate({
      path: 'service',
      select: 'name'
    });
    
  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});
