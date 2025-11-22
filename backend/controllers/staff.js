const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Staff = require('../models/Staff');
const User = require('../models/User');

// @desc    Get all staff members
// @route   GET /api/v1/staff
// @access  Public
exports.getStaff = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single staff member
// @route   GET /api/v1/staff/:id
// @access  Public
exports.getSingleStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .populate({
      path: 'services',
      select: 'name price duration'
    });

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
  // Check if user exists
  const user = await User.findById(req.body.user);
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.body.user}`, 404)
    );
  }

  // Check if staff profile already exists for this user
  const existingStaff = await Staff.findOne({ user: req.body.user });
  if (existingStaff) {
    return next(
      new ErrorResponse('Staff profile already exists for this user', 400)
    );
  }

  // Create staff
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
  let staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is staff member or admin
  if (
    staff.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'staff'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this staff`,
        401
      )
    );
  }

  // If staff member is updating themselves, restrict fields they can update
  if (staff.user.toString() === req.user.id && req.user.role === 'staff') {
    const { bio, workingHours, services } = req.body;
    const updateFields = {};
    
    if (bio) updateFields.bio = bio;
    if (workingHours) updateFields.workingHours = workingHours;
    if (services) updateFields.services = services;
    
    staff = await Staff.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });
  } else {
    // Admin can update all fields
    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({ success: true, data: staff });
});

// @desc    Delete staff member
// @route   DELETE /api/v1/staff/:id
// @access  Private/Admin
exports.deleteStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  await staff.remove();

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

  const staff = await Staff.findById(req.params.id);
  
  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  // In a real app, you would check the staff's schedule and existing bookings
  // to determine available time slots. This is a simplified example.
  const availableSlots = generateTimeSlots(staff.workingHours, date);

  res.status(200).json({
    success: true,
    count: availableSlots.length,
    data: availableSlots
  });
});

// Helper function to generate time slots (simplified)
function generateTimeSlots(workingHours, date) {
  // This is a simplified example. In a real app, you would:
  // 1. Get the staff's working hours for the specified day
  // 2. Check existing bookings for that day
  // 3. Generate available time slots based on service duration
  
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
