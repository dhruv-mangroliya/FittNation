const mongoose = require('mongoose');

const exerciseGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  muscle_group_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MuscleGroup',
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ExerciseGroup', exerciseGroupSchema);
