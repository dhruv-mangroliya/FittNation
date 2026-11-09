const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    default: null,
  },
  weight: {
    type: Number,
    default: null,
  },
  duration: {
    type: Number, // in seconds
    default: null,
  },
  volume: {
    type: Number,
    default: null, // weight * reps, precomputed
  },
  notes: {
    type: String,
    default: '',
  },
}, { _id: true });

const exerciseLogSchema = new mongoose.Schema({
  exercise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sets: [setSchema],
  notes: {
    type: String,
    default: '',
  },
}, { _id: true });

const workoutSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  exercises: [exerciseLogSchema],
  totalDuration: {
    type: Number, // in minutes
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast user/date lookups
workoutSchema.index({ user_id: 1, date: -1 });
workoutSchema.index({ user_id: 1, 'exercises.exercise_id': 1 });

module.exports = mongoose.model('Workout', workoutSchema);
