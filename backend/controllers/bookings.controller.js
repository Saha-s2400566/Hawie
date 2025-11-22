const { Booking, Service, Staff, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { Op } = require('sequelize');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @route   GET /api/v1/users/:userId/bookings
// @access  Private/Admin
// @access  Private/User (for their own bookings)
exports.getBookings = asyncHandler(async (req, res, next) => {
  const { userId, staffId } = req.params;
  let where = {};
  let include = [
    {
      model: Service,
      attributes: ['name', 'price', 'duration']
    },
    {
      model: Staff,
      attributes: ['id'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    },
    {
      model: User,
      attributes: ['name', 'email', 'phone']
    }
  ];

  if (userId) {
    // Get bookings for a specific user (admin only or the user themselves)
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view these bookings`,
          403
        )
      );
    }
    where.userId = userId;
  } else if (staffId) {
    // Get bookings for a specific staff member
    if (req.user.role !== 'admin' && staffId !== req.user.staffId) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view these bookings`,
          403
        )
      );
    }
    where.staffId = staffId;
  } else if (req.user.role !== 'admin') {
    // Regular users can only see their own bookings
    where.userId = req.user.id;
  }

  // Filter by date range if provided
  if (req.query.startDate && req.query.endDate) {
    where.bookingDate = {
      [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
    };
  }

  const bookings = await Booking.findAll({
    where,
    include,
    order: [['bookingDate', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      {
        model: Service,
        attributes: ['name', 'price', 'duration']
      },
      {
        model: Staff,
        attributes: ['id'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }]
      },
      {
        model: User,
        attributes: ['name', 'email', 'phone']
      }
    ]
  });

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this booking`,
        403
      )
    );
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { serviceId, staffId, bookingDate, notes } = req.body;
  
  // Add user to req.body
  req.body.userId = req.user.id;

  // Check if service exists
  const service = await Service.findByPk(serviceId);
  if (!service) {
    return next(new ErrorResponse(`No service with the id of ${serviceId}`, 404));
  }

  // Check if staff exists if provided
  if (staffId) {
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return next(new ErrorResponse(`No staff with the id of ${staffId}`, 404));
    }
  }

  // Check for existing booking at the same time
  const existingBooking = await Booking.findOne({
    where: {
      [Op.or]: [
        {
          staffId: staffId || null,
          bookingDate: {
            [Op.between]: [
              new Date(new Date(bookingDate).getTime() - service.duration * 60000),
              new Date(new Date(bookingDate).getTime() + service.duration * 60000)
            ]
          }
        },
        {
          userId: req.user.id,
          bookingDate: {
            [Op.between]: [
              new Date(new Date(bookingDate).getTime() - service.duration * 60000),
              new Date(new Date(bookingDate).getTime() + service.duration * 60000)
            ]
          }
        }
      ]
    }
  });

  if (existingBooking) {
    return next(
      new ErrorResponse('There is already a booking at this time', 400)
    );
  }

  // Create booking
  const booking = await Booking.create({
    ...req.body,
    serviceId,
    staffId: staffId || null,
    status: 'confirmed',
    endDate: new Date(new Date(bookingDate).getTime() + service.duration * 60000)
  });

  // Get full booking data with relations
  const bookingWithRelations = await Booking.findByPk(booking.id, {
    include: [
      { model: Service },
      {
        model: Staff,
        include: [{ model: User, as: 'user' }]
      },
      { model: User }
    ]
  });

  // TODO: Send confirmation email
  // await sendNewBookingEmail(bookingWithRelations);

  res.status(201).json({
    success: true,
    data: bookingWithRelations
  });
});

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`No booking with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this booking`,
        403
      )
    );
  }

  // Only allow status update for non-admin users
  if (req.user.role !== 'admin' && Object.keys(req.body).length === 1 && req.body.status) {
    booking.status = req.body.status;
    await booking.save();
  } else if (req.user.role === 'admin') {
    // Admin can update any field
    booking = await booking.update(req.body);
  } else {
    return next(
      new ErrorResponse('Not authorized to update this booking', 401)
    );
  }

  // Get updated booking with relations
  const updatedBooking = await Booking.findByPk(booking.id, {
    include: [
      { model: Service },
      {
        model: Staff,
        include: [{ model: User, as: 'user' }]
      },
      { model: User }
    ]
  });

  res.status(200).json({
    success: true,
    data: updatedBooking
  });
});

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`No booking with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this booking`,
        403
      )
    );
  }

  await booking.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get bookings by date range
// @route   GET /api/v1/bookings/range
// @access  Private
exports.getBookingsByDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, staffId } = req.query;

  if (!startDate || !endDate) {
    return next(
      new ErrorResponse('Please provide both start and end dates', 400)
    );
  }

  const where = {
    bookingDate: {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    },
    status: {
      [Op.notIn]: ['cancelled', 'rejected']
    }
  };

  if (staffId) {
    where.staffId = staffId;
  }

  const bookings = await Booking.findAll({
    where,
    include: [
      {
        model: Service,
        attributes: ['name', 'duration']
      },
      {
        model: User,
        attributes: ['name', 'phone']
      }
    ],
    order: [['bookingDate', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      {
        model: Service,
        attributes: ['name']
      },
      {
        model: User,
        attributes: ['email', 'name']
      }
    ]
  });

  if (!booking) {
    return next(
      new ErrorResponse(`No booking with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to cancel this booking`,
        403
      )
    );
  }

  // Check if booking can be cancelled (e.g., not in the past)
  if (new Date(booking.bookingDate) < new Date()) {
    return next(
      new ErrorResponse('Cannot cancel a booking that has already passed', 400)
    );
  }

  // Update booking status
  booking.status = 'cancelled';
  await booking.save();

  // TODO: Send cancellation email
  // await sendCancellationEmail(booking);

  res.status(200).json({
    success: true,
    data: booking
  });
});
