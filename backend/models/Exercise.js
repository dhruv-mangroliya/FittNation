const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExerciseGroup',
    required: true,
  },
  muscle_group_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MuscleGroup',
      required: true,
    },
  ],
  unit: {
    type: String,
    enum: ['kg', 'reps', 'seconds', 'miles', 'km'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast lookups
exerciseSchema.index({ group_id: 1 });
exerciseSchema.index({ name: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
