const MuscleGroup = require('../models/MuscleGroup');
const ExerciseGroup = require('../models/ExerciseGroup');

/**
 * Standard API response format
 */
const sendResponse = (res, statusCode, success, data, message) => {
  res.status(statusCode).json({
    success,
    data,
    message,
  });
};

/**
 * MUSCLE GROUP CONTROLLERS
 */

/**
 * POST /muscle-groups
 * Create muscle group
 */
const createMuscleGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return sendResponse(res, 400, false, null, 'Muscle group name required');
    }

    const muscleGroup = new MuscleGroup({ name, description });
    await muscleGroup.save();

    sendResponse(res, 201, true, muscleGroup, 'Muscle group created');
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 409, false, null, 'Muscle group already exists');
    }
    console.error('Create muscle group error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /muscle-groups
 * Get all muscle groups
 */
const getAllMuscleGroups = async (req, res) => {
  try {
    const muscleGroups = await MuscleGroup.find().sort({ name: 1 });
    sendResponse(res, 200, true, muscleGroups, 'Muscle groups fetched');
  } catch (error) {
    console.error('Get muscle groups error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /muscle-groups/:id
 * Get specific muscle group
 */
const getMuscleGroup = async (req, res) => {
  try {
    const muscleGroup = await MuscleGroup.findById(req.params.id);

    if (!muscleGroup) {
      return sendResponse(res, 404, false, null, 'Muscle group not found');
    }

    sendResponse(res, 200, true, muscleGroup, 'Muscle group fetched');
  } catch (error) {
    console.error('Get muscle group error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * EXERCISE GROUP CONTROLLERS
 */

/**
 * POST /exercise-groups
 * Create exercise group
 */
const createExerciseGroup = async (req, res) => {
  try {
    const { name, muscle_group_ids, description } = req.body;

    if (!name || !muscle_group_ids || muscle_group_ids.length === 0) {
      return sendResponse(res, 400, false, null, 'Name and muscle groups required');
    }

    const exerciseGroup = new ExerciseGroup({
      name,
      muscle_group_ids,
      description,
    });

    await exerciseGroup.save();
    await exerciseGroup.populate('muscle_group_ids');

    sendResponse(res, 201, true, exerciseGroup, 'Exercise group created');
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 409, false, null, 'Exercise group already exists');
    }
    console.error('Create exercise group error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /exercise-groups
 * Get all exercise groups
 */
const getAllExerciseGroups = async (req, res) => {
  try {
    const exerciseGroups = await ExerciseGroup.find()
      .populate('muscle_group_ids')
      .sort({ name: 1 });

    sendResponse(res, 200, true, exerciseGroups, 'Exercise groups fetched');
  } catch (error) {
    console.error('Get exercise groups error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /exercise-groups/:id
 * Get specific exercise group
 */
const getExerciseGroup = async (req, res) => {
  try {
    const exerciseGroup = await ExerciseGroup.findById(req.params.id)
      .populate('muscle_group_ids');

    if (!exerciseGroup) {
      return sendResponse(res, 404, false, null, 'Exercise group not found');
    }

    sendResponse(res, 200, true, exerciseGroup, 'Exercise group fetched');
  } catch (error) {
    console.error('Get exercise group error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * PUT /exercise-groups/:id
 * Update exercise group
 */
const updateExerciseGroup = async (req, res) => {
  try {
    const { name, muscle_group_ids, description } = req.body;

    const exerciseGroup = await ExerciseGroup.findByIdAndUpdate(
      req.params.id,
      { name, muscle_group_ids, description },
      { new: true }
    ).populate('muscle_group_ids');

    if (!exerciseGroup) {
      return sendResponse(res, 404, false, null, 'Exercise group not found');
    }

    sendResponse(res, 200, true, exerciseGroup, 'Exercise group updated');
  } catch (error) {
    console.error('Update exercise group error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * DELETE /exercise-groups/:id
 * Delete exercise group
 */
const deleteExerciseGroup = async (req, res) => {
  try {
    const exerciseGroup = await ExerciseGroup.findByIdAndDelete(req.params.id);

    if (!exerciseGroup) {
      return sendResponse(res, 404, false, null, 'Exercise group not found');
    }

    sendResponse(res, 200, true, null, 'Exercise group deleted');
  } catch (error) {
    console.error('Delete exercise group error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

module.exports = {
  createMuscleGroup,
  getAllMuscleGroups,
  getMuscleGroup,
  createExerciseGroup,
  getAllExerciseGroups,
  getExerciseGroup,
  updateExerciseGroup,
  deleteExerciseGroup,
};
