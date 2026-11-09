const mongoose = require('mongoose');

const muscleGroupExercisesSchema = new mongoose.Schema({
  muscle_group: { type: String, required: true, unique: true, trim: true },
  exercises: [{ type: String, trim: true }],
}, { timestamps: true });

module.exports = mongoose.model('MuscleGroupExercises', muscleGroupExercisesSchema);
