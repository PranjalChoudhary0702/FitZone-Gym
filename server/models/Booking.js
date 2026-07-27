const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    confirmationCode: {
      type: String,
      unique: true,
      uppercase: true,
      default: () => 'FZ-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    },
    type: {
      type: String,
      enum: ['Free Trial Pass', 'Class Reservation', 'Personal Training Consultation'],
      default: 'Free Trial Pass'
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    guestPhone: {
      type: String,
      required: [true, 'Guest phone is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please provide a valid phone number']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    classSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSchedule',
      required: false
    },
    className: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'attended', 'cancelled'],
      default: 'confirmed'
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ confirmationCode: 1, guestEmail: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
