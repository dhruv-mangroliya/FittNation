const Exercise = require('../models/Exercise');
const workoutService = require('../services/workoutService');

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
 * POST /exercises
 * Create new exercise
 */
const createExercise = async (req, res) => {
  try {
    const { name, group_id, muscle_group_ids, unit, description } = req.body;

    if (!name || !group_id || !muscle_group_ids || !unit) {
      return sendResponse(res, 400, false, null, 'Missing required fields');
    }

    const exercise = new Exercise({
      name,
      group_id,
      muscle_group_ids,
      unit,
      description,
    });

    await exercise.save();
    sendResponse(res, 201, true, exercise, 'Exercise created');
  } catch (error) {
    console.error('Create exercise error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /exercises
 * Get all exercises with optional filtering
 */
const getAllExercises = async (req, res) => {
  try {
    const { group_id, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (group_id) query.group_id = group_id;

    const total = await Exercise.countDocuments(query);
    const exercises = await Exercise.find(query)
      .populate('group_id')
      .populate('muscle_group_ids')
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / limit);

    sendResponse(res, 200, true, {
      data: exercises,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages },
    }, 'Exercises fetched');
  } catch (error) {
    console.error('Get all exercises error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /exercises/:id
 * Get specific exercise
 */
const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('group_id')
      .populate('muscle_group_ids');

    if (!exercise) {
      return sendResponse(res, 404, false, null, 'Exercise not found');
    }

    sendResponse(res, 200, true, exercise, 'Exercise fetched');
  } catch (error) {
    console.error('Get exercise error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /exercises/:id/growth
 * Get exercise growth data for graphing
 */
const getExerciseGrowth = async (req, res) => {
  try {
    const userId = req.user._id;
    const exerciseId = req.params.id;

    const growthData = await workoutService.getExerciseGrowth(userId, exerciseId);

    sendResponse(res, 200, true, growthData, 'Growth data fetched');
  } catch (error) {
    console.error('Get exercise growth error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /exercises/:id/last-records
 * Get last N records of exercise
 */
const getLastRecords = async (req, res) => {
  try {
    const userId = req.user._id;
    const exerciseId = req.params.id;
    const limit = parseInt(req.query.limit) || 5;

    const records = await workoutService.getLastRecords(userId, exerciseId, limit);

    sendResponse(res, 200, true, records, 'Last records fetched');
  } catch (error) {
    console.error('Get last records error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /exercises/:id/history
 * Get paginated exercise history
 */
const getExerciseHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const exerciseId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const history = await workoutService.getExerciseHistory(userId, exerciseId, page, limit);

    sendResponse(res, 200, true, history, 'Exercise history fetched');
  } catch (error) {
    console.error('Get exercise history error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * PUT /exercises/:id
 * Update exercise
 */
const updateExercise = async (req, res) => {
  try {
    const { name, group_id, muscle_group_ids, unit, description } = req.body;

    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { name, group_id, muscle_group_ids, unit, description },
      { new: true }
    );

    if (!exercise) {
      return sendResponse(res, 404, false, null, 'Exercise not found');
    }

    sendResponse(res, 200, true, exercise, 'Exercise updated');
  } catch (error) {
    console.error('Update exercise error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * DELETE /exercises/:id
 * Delete exercise
 */
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);

    if (!exercise) {
      return sendResponse(res, 404, false, null, 'Exercise not found');
    }

    sendResponse(res, 200, true, null, 'Exercise deleted');
  } catch (error) {
    console.error('Delete exercise error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

module.exports = {
  createExercise,
  getAllExercises,
  getExercise,
  getExerciseGrowth,
  getLastRecords,
  getExerciseHistory,
  updateExercise,
  deleteExercise,
};
