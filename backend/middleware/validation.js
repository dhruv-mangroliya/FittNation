/**
 * Validation utilities for fitness tracking API
 */

/**
 * Validate set data
 */
const validateSet = (set) => {
  if (!set || typeof set !== 'object') {
    return { valid: false, message: 'Set must be an object' };
  }

  if (set.reps !== undefined && (typeof set.reps !== 'number' || set.reps < 1)) {
    return { valid: false, message: 'Reps must be a positive number' };
  }

  if (set.weight !== undefined && (typeof set.weight !== 'number' || set.weight < 0)) {
    return { valid: false, message: 'Weight must be a non-negative number' };
  }

  if (set.duration !== undefined && (typeof set.duration !== 'number' || set.duration < 0)) {
    return { valid: false, message: 'Duration must be a non-negative number (seconds)' };
  }

  // At least one metric must be provided
  if (set.reps === undefined && set.weight === undefined && set.duration === undefined) {
    return { valid: false, message: 'At least one of reps, weight, or duration must be provided' };
  }

  return { valid: true };
};

/**
 * Validate sets array
 */
const validateSets = (sets) => {
  if (!Array.isArray(sets)) {
    return { valid: false, message: 'Sets must be an array' };
  }

  if (sets.length === 0) {
    return { valid: false, message: 'At least one set must be provided' };
  }

  for (let i = 0; i < sets.length; i++) {
    const validation = validateSet(sets[i]);
    if (!validation.valid) {
      return { valid: false, message: `Set ${i + 1}: ${validation.message}` };
    }
  }

  return { valid: true };
};

/**
 * Validate workout creation request
 */
const validateCreateWorkoutRequest = (body) => {
  if (!body.exerciseId) {
    return { valid: false, message: 'exerciseId is required' };
  }

  if (!body.exerciseName) {
    return { valid: false, message: 'exerciseName is required' };
  }

  if (typeof body.exerciseName !== 'string') {
    return { valid: false, message: 'exerciseName must be a string' };
  }

  const setsValidation = validateSets(body.sets);
  if (!setsValidation.valid) {
    return setsValidation;
  }

  return { valid: true };
};

/**
 * Validate exercise creation request
 */
const validateCreateExerciseRequest = (body) => {
  if (!body.name || typeof body.name !== 'string') {
    return { valid: false, message: 'name is required and must be a string' };
  }

  if (!body.group_id) {
    return { valid: false, message: 'group_id is required' };
  }

  if (!Array.isArray(body.muscle_group_ids) || body.muscle_group_ids.length === 0) {
    return { valid: false, message: 'muscle_group_ids must be a non-empty array' };
  }

  const validUnits = ['kg', 'reps', 'seconds', 'miles', 'km'];
  if (!body.unit || !validUnits.includes(body.unit)) {
    return { valid: false, message: `unit must be one of: ${validUnits.join(', ')}` };
  }

  return { valid: true };
};

/**
 * Validation middleware
 */
const validateCreateWorkout = (req, res, next) => {
  const validation = validateCreateWorkoutRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      data: null,
      message: validation.message,
    });
  }
  next();
};

const validateCreateExercise = (req, res, next) => {
  const validation = validateCreateExerciseRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      data: null,
      message: validation.message,
    });
  }
  next();
};

module.exports = {
  validateSet,
  validateSets,
  validateCreateWorkoutRequest,
  validateCreateExerciseRequest,
  validateCreateWorkout,
  validateCreateExercise,
};
