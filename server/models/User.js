const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    membershipTier: {
      type: String,
      enum: ['Guest', 'Day Pass', 'All-Access Standard', 'VIP Elite'],
      default: 'Guest'
    },
    primaryGoal: {
      type: String,
      enum: ['Fat Loss', 'Muscle & Strength', 'HIIT & Endurance', 'Rehab & Mobility', 'General Wellness'],
      default: 'General Wellness'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Search Index
userSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);
