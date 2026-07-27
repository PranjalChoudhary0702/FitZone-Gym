const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    monthlyPrice: {
      type: Number,
      required: [true, 'Monthly price is required'],
      min: 0
    },
    annualMonthlyPrice: {
      type: Number,
      required: [true, 'Annual monthly price is required'],
      min: 0
    },
    billingPeriod: {
      type: String,
      enum: ['per pass', 'per month', 'per year'],
      default: 'per month'
    },
    features: [{
      type: String,
      required: true
    }],
    disabledFeatures: [{
      type: String
    }],
    isPopular: {
      type: Boolean,
      default: false
    },
    badgeText: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
