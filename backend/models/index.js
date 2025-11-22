const { sequelize } = require('../config/db');

// Import all models
const User = require('./User.model');
const Staff = require('./Staff.model');
const Service = require('./Service.model');
const Booking = require('./Booking.model');
const Review = require('./Review.model');
const AnalyticsSnapshot = require('./AnalyticsSnapshot.model');

/**
 * Define model relationships
 */

// User relationships
User.hasMany(Booking, {
  foreignKey: 'userId',
  as: 'bookings'
});

User.hasMany(Review, {
  foreignKey: 'userId',
  as: 'reviews'
});

// Staff relationships
Staff.hasMany(Booking, {
  foreignKey: 'staffId',
  as: 'bookings'
});

// Service relationships
Service.hasMany(Booking, {
  foreignKey: 'serviceId',
  as: 'bookings'
});

// Booking relationships
Booking.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Booking.belongsTo(Staff, {
  foreignKey: 'staffId',
  as: 'staff'
});

Booking.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service'
});

Booking.hasOne(Review, {
  foreignKey: 'bookingId',
  as: 'review'
});

// Review relationships
Review.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Review.belongsTo(Booking, {
  foreignKey: 'bookingId',
  as: 'booking'
});

/**
 * Sync all models with the database
 */
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database & tables created/updated!');
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Staff,
  Service,
  Booking,
  Review,
  AnalyticsSnapshot,
  syncModels
};
