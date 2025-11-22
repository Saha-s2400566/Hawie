const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const path = require('path');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email template renderer
const renderTemplate = (template, data = {}) => {
  const templatePath = path.join(__dirname, `../views/emails/${template}.pug`);
  return pug.renderFile(templatePath, data);
};

// Send email function
const sendEmail = async (options) => {
  try {
    // If in development and not using ethereal, log the email instead of sending
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST.includes('ethereal')) {
      console.log('Email not sent in development (SMTP not configured)');
      console.log('Email options:', options);
      return { message: 'Email not sent in development (SMTP not configured)' };
    }

    // Define email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.text || htmlToText(options.html, { wordwrap: 130 }),
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Message sent: %s', info.messageId);
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { message: 'Email sent successfully', info };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('There was an error sending the email. Please try again later.');
  }
};

// Email templates
const sendWelcomeEmail = async (user) => {
  const html = renderTemplate('welcome', {
    name: user.name,
    supportEmail: process.env.SUPPORT_EMAIL,
  });

  await sendEmail({
    email: user.email,
    subject: 'Welcome to HAWO Salon!',
    html,
  });
};

const sendBookingConfirmation = async (booking, user) => {
  const html = renderTemplate('bookingConfirmation', {
    name: user.name,
    booking: {
      ...booking.toObject(),
      date: new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    supportEmail: process.env.SUPPORT_EMAIL,
  });

  await sendEmail({
    email: user.email,
    subject: `Your HAWO Salon Booking Confirmation - ${new Date(booking.date).toLocaleDateString()}`,
    html,
  });
};

const sendBookingReminder = async (booking, user) => {
  const html = renderTemplate('bookingReminder', {
    name: user.name,
    booking: {
      ...booking.toObject(),
      date: new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    supportEmail: process.env.SUPPORT_EMAIL,
  });

  await sendEmail({
    email: user.email,
    subject: `Reminder: Your HAWO Salon Appointment is Tomorrow!`,
    html,
  });
};

const sendBookingCancellation = async (booking, user, cancellationReason) => {
  const html = renderTemplate('bookingCancellation', {
    name: user.name,
    booking: {
      ...booking.toObject(),
      date: new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    cancellationReason,
    supportEmail: process.env.SUPPORT_EMAIL,
  });

  await sendEmail({
    email: user.email,
    subject: `Your HAWO Salon Booking Has Been Cancelled`,
    html,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = renderTemplate('passwordReset', {
    name: user.name,
    resetUrl,
    supportEmail: process.env.SUPPORT_EMAIL,
  });

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html,
  });
};

const sendStaffNotification = async (staff, booking) => {
  const html = renderTemplate('staffNotification', {
    staffName: staff.name,
    booking: {
      ...booking.toObject(),
      date: new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    dashboardUrl: `${process.env.FRONTEND_URL}/staff/dashboard`,
  });

  await sendEmail({
    email: staff.email,
    subject: 'New Booking Assigned',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingCancellation,
  sendPasswordResetEmail,
  sendStaffNotification,
};
