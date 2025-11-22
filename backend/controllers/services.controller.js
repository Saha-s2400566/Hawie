const { Service } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// @desc    Get all services
// @route   GET /api/v1/services
// @access  Public
exports.getServices = asyncHandler(async (req, res, next) => {
  // For public access, only return active services
  const where = { isActive: true };
  
  // For admins, allow filtering by active status
  if (req.user?.role === 'admin' && req.query.isActive) {
    where.isActive = req.query.isActive === 'true';
  }

  const services = await Service.findAll({
    where,
    order: [['name', 'ASC']]
  });

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

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Create new service
// @route   POST /api/v1/services
// @access  Private/Admin
exports.createService = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;

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

  // Update service
  service = await service.update(req.body);

  res.status(200).json({
    success: true,
    data: service
  });
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

  // Soft delete by setting isActive to false
  await service.update({ isActive: false });
  // Or hard delete with: await service.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
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
  file.name = `photo_${service.id}${path.parse(file.name).ext}`;

  // Create uploads directory if it doesn't exist
  const uploadPath = path.join(__dirname, '../public/uploads/services');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Delete old photo if exists
  if (service.photo) {
    const oldPhotoPath = path.join(uploadPath, service.photo);
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

    // Update service with photo filename
    await service.update({ photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc    Get services by search query
// @route   GET /api/v1/services/search
// @access  Public
exports.searchServices = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorResponse('Please provide a search term', 400));
  }

  const services = await Service.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ],
      isActive: true
    },
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});
