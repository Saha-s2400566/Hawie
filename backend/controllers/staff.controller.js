const { Staff, User, Service } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// @desc    Get all staff members
// @route   GET /api/v1/staff
// @access  Public
exports.getStaff = asyncHandler(async (req, res, next) => {
  // For public access, only return active staff
  const where = { isActive: true };
  
  // For admins, allow filtering by active status
  if (req.user?.role === 'admin' && req.query.isActive) {
    where.isActive = req.query.isActive === 'true';
  }

  const staff = await Staff.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone']
      },
      {
        model: Service,
        attributes: ['id', 'name', 'price', 'duration'],
        through: { attributes: [] } // Exclude the join table attributes
      }
    ],
    order: [['createdAt', 'DESC']]
  });

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
  const staff = await Staff.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone']
      },
      {
        model: Service,
        attributes: ['id', 'name', 'price', 'duration'],
        through: { attributes: [] },
        where: { isActive: true }
      }
    ]
  });

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Create new staff member
// @route   POST /api/v1/staff
// @access  Private/Admin
exports.createStaff = asyncHandler(async (req, res, next) => {
  // Check if user exists
  const user = await User.findByPk(req.body.userId);
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.body.userId}`, 404)
    );
  }

  // Check if staff profile already exists for this user
  const existingStaff = await Staff.findOne({ where: { userId: req.body.userId } });
  if (existingStaff) {
    return next(
      new ErrorResponse('Staff profile already exists for this user', 400)
    );
  }

  // Create staff profile
  const staff = await Staff.create({
    ...req.body,
    userId: req.body.userId
  });

  // If services are provided, associate them with the staff
  if (req.body.serviceIds && req.body.serviceIds.length > 0) {
    await staff.setServices(req.body.serviceIds);
  }

  // Fetch the created staff with relations
  const staffWithRelations = await Staff.findByPk(staff.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone']
      },
      {
        model: Service,
        attributes: ['id', 'name', 'price', 'duration'],
        through: { attributes: [] }
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: staffWithRelations
  });
});

// @desc    Update staff member
// @route   PUT /api/v1/staff/:id
// @access  Private/Admin
exports.updateStaff = asyncHandler(async (req, res, next) => {
  let staff = await Staff.findByPk(req.params.id, {
    include: [
      {
        model: Service,
        attributes: ['id'],
        through: { attributes: [] }
      }
    ]
  });

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  // Update staff profile
  staff = await staff.update(req.body);

  // Update services if provided
  if (req.body.serviceIds) {
    await staff.setServices(req.body.serviceIds);
  }

  // Fetch updated staff with relations
  const updatedStaff = await Staff.findByPk(staff.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone']
      },
      {
        model: Service,
        attributes: ['id', 'name', 'price', 'duration'],
        through: { attributes: [] }
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: updatedStaff
  });
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

  // Soft delete by setting isActive to false
  await staff.update({ isActive: false });
  // Or hard delete with: await staff.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload photo for staff
// @route   PUT /api/v1/staff/:id/photo
// @access  Private/Admin
exports.staffPhotoUpload = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findByPk(req.params.id);

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000;
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${maxSize / 1000}KB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${staff.id}${path.parse(file.name).ext}`;

  // Create uploads directory if it doesn't exist
  const uploadPath = path.join(__dirname, '../public/uploads/staff');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Delete old photo if exists
  if (staff.photo) {
    const oldPhotoPath = path.join(uploadPath, staff.photo);
    if (fs.existsSync(oldPhotoPath)) {
      fs.unlinkSync(oldPhotoPath);
    }
  }

  // Upload file
  file.mv(`${uploadPath}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Update staff with photo filename
    await staff.update({ photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc    Get staff availability
// @route   GET /api/v1/staff/:id/availability
// @access  Public
exports.getStaffAvailability = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  
  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }

  const staff = await Staff.findByPk(req.params.id, {
    attributes: ['id', 'workingHours', 'breaks', 'daysOff']
  });

  if (!staff) {
    return next(
      new ErrorResponse(`Staff not found with id of ${req.params.id}`, 404)
    );
  }

  // Get all bookings for the staff member on the specified date
  const selectedDate = new Date(date);
  const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

  const bookings = await Booking.findAll({
    where: {
      staffId: staff.id,
      bookingDate: {
        [Op.between]: [startOfDay, endOfDay]
      },
      status: {
        [Op.notIn]: ['cancelled', 'rejected']
      }
    },
    include: [
      {
        model: Service,
        attributes: ['duration']
      }
    ]
  });

  // Generate available time slots (simplified example)
  const workingHours = staff.workingHours || {
    start: '09:00',
    end: '17:00'
  };

  const slots = generateTimeSlots(workingHours, new Date(date));
  
  // Mark booked slots as unavailable
  bookings.forEach(booking => {
    const bookingTime = new Date(booking.bookingDate);
    const bookingEndTime = new Date(bookingTime.getTime() + (booking.Service.duration * 60000));
    
    slots.forEach(slot => {
      const slotTime = new Date(slot.time);
      if (slotTime >= bookingTime && slotTime < bookingEndTime) {
        slot.available = false;
      }
    });
  });

  res.status(200).json({
    success: true,
    data: {
      date: new Date(date).toISOString().split('T')[0],
      staffId: staff.id,
      availableSlots: slots.filter(slot => slot.available)
    }
  });
});

// Helper function to generate time slots
function generateTimeSlots(workingHours, date) {
  const slots = [];
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);
  
  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  // 30-minute intervals
  const interval = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  while (currentTime < endTime) {
    slots.push({
      time: new Date(currentTime),
      available: true
    });
    
    currentTime = new Date(currentTime.getTime() + interval);
  }
  
  return slots;
}
