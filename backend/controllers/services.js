const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Service = require('../models/Service.model');

// @desc    Get all services
// @route   GET /api/v1/services
// @access  Public
exports.getServices = asyncHandler(async (req, res, next) => {
  const services = await Service.findAll();

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get single service
// @route   GET /api/v1/services/:id
// @access  Public
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: service });
});

// @desc    Create new service
// @route   POST /api/v1/services
// @access  Private/Admin
exports.createService = asyncHandler(async (req, res, next) => {
  // Add user to req.body if needed, but Service model doesn't have user field currently
  // req.body.user = req.user.id;

  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Update service
// @route   PUT /api/v1/services/:id
// @access  Private/Admin
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin (already checked by middleware, but good to be safe)
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this service`,
        401
      )
    );
  }

  await service.update(req.body);

  res.status(200).json({ success: true, data: service });
});

// @desc    Delete service
// @route   DELETE /api/v1/services/:id
// @access  Private/Admin
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this service`,
        401
      )
    );
  }

  await service.destroy();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Upload photo for service
// @route   PUT /api/v1/services/:id/photo
// @access  Private/Admin
exports.servicePhotoUpload = asyncHandler(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this service`,
        401
      )
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

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${service.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/services/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await service.update({ imageUrl: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
