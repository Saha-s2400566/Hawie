const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review.model');
const Booking = require('../models/Booking.model');
const Service = require('../models/Service.model');
const Staff = require('../models/Staff.model');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findAll();
  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: review });
});

// @desc    Add review
// @route   POST /api/v1/bookings/:bookingId/reviews
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;
  req.body.bookingId = req.params.bookingId;

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  // Auth check
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await review.update(req.body);

  res.status(200).json({ success: true, data: review });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete review`, 401));
  }

  await review.destroy();

  res.status(200).json({ success: true, data: {} });
});

// Placeholders for other methods
exports.approveReview = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: {} });
});
exports.getServiceReviews = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: [] });
});
exports.getStaffReviews = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: [] });
});
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: [] });
});
