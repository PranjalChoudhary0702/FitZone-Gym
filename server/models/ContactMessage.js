const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Sender email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Sender phone is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please provide a valid phone number']
    },
    fitnessGoal: {
      type: String,
      default: 'General Health & Wellness'
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'resolved'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

contactMessageSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
