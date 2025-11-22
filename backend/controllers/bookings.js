const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @route   GET /api/v1/users/:userId/bookings
// @access  Private/Admin
// @access  Private/User (for their own bookings)
exports.getBookings = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    // Get bookings for a specific user (admin only or the user themselves)
    if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view these bookings`,
          403
        )
      );
    }
    
    const bookings = await Booking.find({ user: req.params.userId })
      .populate({
        path: 'service',
        select: 'name price duration'
      })
      .populate({
        path: 'staff',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name'
        }
      });
      
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } else if (req.params.staffId) {
    // Get bookings for a specific staff member (admin or the staff member themselves)
    if (req.user.role !== 'admin' && req.params.staffId !== req.user.staff) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view these bookings`,
          403
        )
      );
    }
    
    const bookings = await Booking.find({ staff: req.params.staffId })
      .populate({
        path: 'service',
        select: 'name price duration'
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      });
      
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } else {
    // Get all bookings (admin only)
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

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'service',
      select: 'name price duration'
    })
    .populate({
      path: 'staff',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name'
      }
    })
    .populate({
      path: 'user',
      select: 'name email phone'
    });

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the booking owner, staff member, or admin
  if (
    booking.user._id.toString() !== req.user.id &&
    (req.user.role === 'staff' && booking.staff._id.toString() !== req.user.staff) &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this booking`,
        401
      )
    );
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  const { service: serviceId, staff: staffId, date, startTime, notes } = req.body;
  
  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${serviceId}`, 404)
    );
  }
  
  // Check if staff exists
  const staff = await Staff.findById(staffId).populate('user', 'name');
  if (!staff) {
    return next(
      new ErrorResponse(`Staff member not found with id of ${staffId}`, 404)
    );
  }
  
  // Calculate end time based on service duration
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(start.getTime() + service.duration * 60000);
  const endTime = end.toTimeString().slice(0, 5);
  
  // Check for existing bookings that overlap
  const existingBooking = await Booking.findOne({
    staff: staffId,
    date: new Date(date),
    $or: [
      {
        $and: [
          { startTime: { $lte: startTime } },
          { endTime: { $gt: startTime } }
        ]
      },
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gte: endTime } }
        ]
      },
      {
        $and: [
          { startTime: { $gte: startTime } },
          { endTime: { $lte: endTime } }
        ]
      }
    ]
  });
  
  if (existingBooking) {
    return next(
      new ErrorResponse('The selected time slot is already booked', 400)
    );
  }
  
  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    service: serviceId,
    staff: staffId,
    date,
    startTime,
    endTime,
    price: service.price,
    duration: service.duration,
    notes
  });
  
  // Populate the booking with service and staff details
  const newBooking = await Booking.findById(booking._id)
    .populate({
      path: 'service',
      select: 'name price duration'
    })
    .populate({
      path: 'staff',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name'
      }
    });
  
  // Send confirmation email (in production)
  if (process.env.NODE_ENV === 'production') {
    const user = await User.findById(req.user.id);
    
    const message = `
      <h2>Booking Confirmation</h2>
      <p>Thank you for booking with HAWO Salon. Here are your appointment details:</p>
      <ul>
        <li><strong>Service:</strong> ${newBooking.service.name}</li>
        <li><strong>Staff:</strong> ${newBooking.staff.user.name}</li>
        <li><strong>Date:</strong> ${new Date(date).toDateString()}</li>
        <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
        <li><strong>Price:</strong> $${newBooking.price.toFixed(2)}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'HAWO Salon - Booking Confirmation',
        html: message
      });
    } catch (err) {
      console.error('Failed to send email:', err);
      // Don't fail the request if email fails
    }
  }
  
  res.status(201).json({
    success: true,
    data: newBooking
  });
});

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id/status
// @access  Private/Admin/Staff
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'email name'
    })
    .populate({
      path: 'service',
      select: 'name'
    });
    
  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Only admin or the assigned staff can update status
  if (
    req.user.role !== 'admin' && 
    (req.user.role !== 'staff' || booking.staff.toString() !== req.user.staff)
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this booking`,
        401
      )
    );
  }
  
  const { status, cancellationReason } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
  if (!validStatuses.includes(status)) {
    return next(
      new ErrorResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        400
      )
    );
  }
  
  // Update booking
  booking.status = status;
  
  if (status === 'cancelled' && cancellationReason) {
    booking.cancellationReason = cancellationReason;
    booking.cancellationDate = Date.now();
    booking.cancellationBy = req.user.id;
  }
  
  await booking.save();
  
  // Send status update email (in production)
  if (process.env.NODE_ENV === 'production' && booking.user.email) {
    const statusMessage = {
      'confirmed': 'Your booking has been confirmed!',
      'completed': 'Your booking has been marked as completed.',
      'cancelled': 'Your booking has been cancelled.',
      'no-show': 'You were marked as a no-show for your booking.'
    }[status] || `Your booking status has been updated to: ${status}`;
    
    const message = `
      <h2>Booking Update</h2>
      <p>${statusMessage}</p>
      <p>Booking details:</p>
      <ul>
        <li><strong>Service:</strong> ${booking.service.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.date).toDateString()}</li>
        <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
        <li><strong>Status:</strong> ${status}</li>
        ${status === 'cancelled' && booking.cancellationReason ? 
          `<li><strong>Cancellation Reason:</strong> ${booking.cancellationReason}</li>` : ''}
      </ul>
    `;
    
    try {
      await sendEmail({
        email: booking.user.email,
        subject: `HAWO Salon - Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: message
      });
    } catch (err) {
      console.error('Failed to send status update email:', err);
      // Don't fail the request if email fails
    }
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Reschedule booking
// @route   PUT /api/v1/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = asyncHandler(async (req, res, next) => {
  const { date, startTime } = req.body;
  
  // Find booking
  let booking = await Booking.findById(req.params.id)
    .populate('service', 'duration')
    .populate({
      path: 'staff',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
    
  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Check if user is the booking owner, staff, or admin
  if (
    booking.user.toString() !== req.user.id && 
    req.user.role !== 'admin' &&
    (req.user.role !== 'staff' || booking.staff._id.toString() !== req.user.staff)
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to reschedule this booking`,
        401
      )
    );
  }
  
  // Calculate new end time
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(start.getTime() + booking.service.duration * 60000);
  const endTime = end.toTimeString().slice(0, 5);
  
  // Check for existing bookings that overlap
  const existingBooking = await Booking.findOne({
    _id: { $ne: booking._id }, // Exclude current booking
    staff: booking.staff,
    date: new Date(date),
    $or: [
      {
        $and: [
          { startTime: { $lte: startTime } },
          { endTime: { $gt: startTime } }
        ]
      },
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gte: endTime } }
        ]
      },
      {
        $and: [
          { startTime: { $gte: startTime } },
          { endTime: { $lte: endTime } }
        ]
      }
    ]
  });
  
  if (existingBooking) {
    return next(
      new ErrorResponse('The selected time slot is already booked', 400)
    );
  }
  
  // Update booking
  booking.date = date;
  booking.startTime = startTime;
  booking.endTime = endTime;
  booking.status = 'confirmed'; // Reset status to confirmed
  booking.updatedAt = Date.now();
  
  await booking.save();
  
  // Send reschedule confirmation email (in production)
  if (process.env.NODE_ENV === 'production') {
    const user = await User.findById(booking.user);
    
    const message = `
      <h2>Booking Rescheduled</h2>
      <p>Your booking has been rescheduled. Here are your updated appointment details:</p>
      <ul>
        <li><strong>Service:</strong> ${booking.service.name}</li>
        <li><strong>Staff:</strong> ${booking.staff.user.name}</li>
        <li><strong>New Date:</strong> ${new Date(date).toDateString()}</li>
        <li><strong>New Time:</strong> ${startTime} - ${endTime}</li>
      </ul>
      <p>Please contact us if you need to make any further changes.</p>
    `;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'HAWO Salon - Booking Rescheduled',
        html: message
      });
      
      // Also notify staff if it's not the staff member making the change
      if (req.user.role !== 'staff' || req.user.staff !== booking.staff._id.toString()) {
        await sendEmail({
          email: booking.staff.user.email,
          subject: 'HAWO Salon - Your Booking Has Been Rescheduled',
          html: `
            <h2>Booking Rescheduled</h2>
            <p>Your booking with ${user.name} has been rescheduled:</p>
            <ul>
              <li><strong>Service:</strong> ${booking.service.name}</li>
              <li><strong>New Date:</strong> ${new Date(date).toDateString()}</li>
              <li><strong>New Time:</strong> ${startTime} - ${endTime}</li>
            </ul>
          `
        });
      }
    } catch (err) {
      console.error('Failed to send reschedule email:', err);
      // Don't fail the request if email fails
    }
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service', 'name')
    .populate({
      path: 'user',
      select: 'email name'
    })
    .populate({
      path: 'staff',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
    
  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Check if user is the booking owner, staff, or admin
  if (
    booking.user._id.toString() !== req.user.id && 
    req.user.role !== 'admin' &&
    (req.user.role !== 'staff' || booking.staff._id.toString() !== req.user.staff)
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to cancel this booking`,
        401
      )
    );
  }
  
  // Update booking status to cancelled
  booking.status = 'cancelled';
  booking.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
  booking.cancellationDate = Date.now();
  booking.cancellationBy = req.user.id;
  
  await booking.save();
  
  // Send cancellation email (in production)
  if (process.env.NODE_ENV === 'production') {
    const message = `
      <h2>Booking Cancelled</h2>
      <p>Your booking has been cancelled. Here are the details of the cancelled booking:</p>
      <ul>
        <li><strong>Service:</strong> ${booking.service.name}</li>
        <li><strong>Date:</strong> ${new Date(booking.date).toDateString()}</li>
        <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
        <li><strong>Cancellation Reason:</strong> ${booking.cancellationReason}</li>
      </ul>
      <p>We're sorry to see you go. We hope to see you again soon!</p>
    `;
    
    try {
      await sendEmail({
        email: booking.user.email,
        subject: 'HAWO Salon - Booking Cancelled',
        html: message
      });
      
      // Also notify staff if it's not the staff member making the change
      if (req.user.role !== 'staff' || req.user.staff !== booking.staff._id.toString()) {
        await sendEmail({
          email: booking.staff.user.email,
          subject: 'HAWO Salon - Booking Cancelled',
          html: `
            <h2>Booking Cancelled</h2>
            <p>Your booking with ${booking.user.name} has been cancelled:</p>
            <ul>
              <li><strong>Service:</strong> ${booking.service.name}</li>
              <li><strong>Date:</strong> ${new Date(booking.date).toDateString()}</li>
              <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
              <li><strong>Cancellation Reason:</strong> ${booking.cancellationReason}</li>
            </ul>
          `
        });
      }
    } catch (err) {
      console.error('Failed to send cancellation email:', err);
      // Don't fail the request if email fails
    }
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
