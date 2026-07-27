const mongoose = require('mongoose');

const classScheduleSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true
    },
    dayOfWeek: {
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: [true, 'Day of week is required'],
      lowercase: true
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g. 06:00 AM)'],
      trim: true
    },
    durationMinutes: {
      type: Number,
      default: 45
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: false
    },
    trainerName: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['strength', 'hiit', 'boxing', 'recovery', 'general'],
      default: 'general'
    },
    locationRoom: {
      type: String,
      default: 'Main Studio'
    },
    intensityTag: {
      type: String,
      default: 'All Levels'
    },
    maxCapacity: {
      type: Number,
      default: 25
    },
    reservedSeats: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

classScheduleSchema.index({ dayOfWeek: 1, startTime: 1 });

module.exports = mongoose.model('ClassSchedule', classScheduleSchema);
