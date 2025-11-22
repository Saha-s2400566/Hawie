const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./config/db');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const staffRoutes = require('./routes/staff');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/staff', staffRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;
