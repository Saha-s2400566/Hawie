const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { login, register, getMe, updateDetails, updatePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// Import middleware
const { protect } = require('../middleware/auth');

// Public routes
router.post(
  '/register',
  [
    check('name', 'Please add a name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  login
);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

module.exports = router;