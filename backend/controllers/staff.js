const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Staff = require('../models/Staff.model');
const User = require('../models/User.model');

// @desc    Get all staff members
// @route   GET /api/v1/staff
// @access  Public
exports.getStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findAll();
  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Get single staff member
// @route   GET /api/v1/staff/:id
// @access  Public
exports.getStaffMember = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findByPk(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: staff });
});

// @desc    Create new staff member
// @route   POST /api/v1/staff
// @access  Private/Admin
exports.createStaff = asyncHandler(async (req, res, next) => {
  // Check if user exists (if we are linking to a user account)
  // For now, let's assume we just create a staff profile directly

  const staff = await Staff.create(req.body);

  res.status(201).json({
    success: true,
    data: staff
  });
});

// @desc    Update staff member
// @route   PUT /api/v1/staff/:id
// @access  Private/Admin
// @access  Private/Staff (for self-update)
exports.updateStaff = asyncHandler(async (req, res, next) => {
  let staff = await Staff.findByPk(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is staff member or admin
  if (req.user.role !== 'admin') {
    // Add logic here if we link staff to user account
    // For now, restrict to admin
    return next(new ErrorResponse(`Not authorized to update staff`, 401));
  }

  await staff.update(req.body);

  res.status(200).json({ success: true, data: staff });
});

// @desc    Delete staff member
// @route   DELETE /api/v1/staff/:id
// @access  Private/Admin
exports.deleteStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findByPk(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  await staff.destroy();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get available time slots for staff
// @route   GET /api/v1/staff/:id/availability
// @access  Public
exports.getStaffAvailability = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }

  const staff = await Staff.findByPk(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  // Simplified availability logic
  const availableSlots = generateTimeSlots(null, date);

  res.status(200).json({
    success: true,
    count: availableSlots.length,
    data: availableSlots
  });
});

// Helper function to generate time slots (simplified)
function generateTimeSlots(workingHours, date) {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 18;  // 6 PM

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push({
        startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        endTime: `${hour.toString().padStart(2, '0')}:${(minute + 30).toString().padStart(2, '0')}`,
        available: Math.random() > 0.3 // Randomly mark some slots as unavailable for demo
      });
    }
  }

  return slots;
}

// Placeholder for photo upload
exports.staffPhotoUpload = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: {} });
});

// Export getSingleStaff as getStaffMember to match routes
exports.getSingleStaff = exports.getStaffMember;
