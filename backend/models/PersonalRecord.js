const mongoose = require('mongoose');

const personalRecordSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exercise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  exercise_name: {
    type: String,
    required: true,
  },
  max_weight: {
    type: Number,
    default: null,
  },
  max_reps: {
    type: Number,
    default: null,
  },
  max_duration: {
    type: Number,
    default: null,
  },
  max_volume: {
    type: Number,
    default: null, // weight * reps
  },
  last_updated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique index for user + exercise combination
personalRecordSchema.index({ user_id: 1, exercise_id: 1 }, { unique: true });

module.exports = mongoose.model('PersonalRecord', personalRecordSchema);
