const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Trainer role/title is required'],
      trim: true
    },
    specialtyCategory: {
      type: String,
      enum: ['strength', 'hiit', 'boxing', 'recovery', 'yoga'],
      required: true
    },
    certifications: [{
      type: String,
      trim: true
    }],
    experienceYears: {
      type: Number,
      required: true,
      min: 0
    },
    bio: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      default: 'assets/images/trainer_1.jpg'
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

trainerSchema.index({ name: 'text', role: 'text' });

module.exports = mongoose.model('Trainer', trainerSchema);
