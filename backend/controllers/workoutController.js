const Workout = require('../models/Workout');
const PersonalRecord = require('../models/PersonalRecord');
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
 * POST /workouts
 * Create or update workout for today with exercises
 */
const createWorkout = async (req, res) => {
  try {
    const { exerciseId, exerciseName, sets, date } = req.body;
    const userId = req.user._id;

    if (!exerciseId || !exerciseName || !sets || !Array.isArray(sets)) {
      return sendResponse(res, 400, false, null, 'Invalid exercise data');
    }

    const workoutDate = date ? new Date(date) : new Date();
    const workout = await workoutService.addExerciseToWorkout(
      userId,
      exerciseId,
      exerciseName,
      sets,
      workoutDate
    );

    sendResponse(res, 201, true, workout, 'Exercise added to workout');
  } catch (error) {
    console.error('Create workout error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /workouts/today
 * Get today's workout
 */
const getTodayWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const workout = await workoutService.getTodayWorkout(userId);
    res.set('Cache-Control', 'no-store');
    sendResponse(res, 200, true, workout, 'Today\'s workout fetched');
  } catch (error) {
    console.error('Get today workout error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /workouts/:id
 * Get specific workout
 */
const getWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const workout = await Workout.findById(workoutId).populate('exercises.exercise_id');

    if (!workout) {
      return sendResponse(res, 404, false, null, 'Workout not found');
    }

    // Verify ownership
    if (workout.user_id.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, null, 'Unauthorized access');
    }

    sendResponse(res, 200, true, workout, 'Workout fetched');
  } catch (error) {
    console.error('Get workout error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /workouts
 * Get all workouts for user with pagination
 */
const getAllWorkouts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Workout.countDocuments({ user_id: userId });
    const workouts = await Workout.find({ user_id: userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('exercises.exercise_id');

    const totalPages = Math.ceil(total / limit);

    sendResponse(res, 200, true, {
      data: workouts,
      pagination: { page, limit, total, totalPages },
    }, 'Workouts fetched');
  } catch (error) {
    console.error('Get all workouts error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /workouts/calendar
 * Get calendar with workout dates
 */
const getCalendar = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let dateRange = null;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    const dates = await workoutService.getWorkoutCalendar(userId, dateRange);

    sendResponse(res, 200, true, dates, 'Calendar data fetched');
  } catch (error) {
    console.error('Get calendar error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * GET /workouts/stats
 * Get workout statistics
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await workoutService.getWorkoutStats(userId, { start, end });

    sendResponse(res, 200, true, stats, 'Statistics fetched');
  } catch (error) {
    console.error('Get stats error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

/**
 * DELETE /workouts/:id
 * Delete workout
 */
const deleteWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return sendResponse(res, 404, false, null, 'Workout not found');
    }

    if (workout.user_id.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, null, 'Unauthorized access');
    }

    await Workout.findByIdAndDelete(workoutId);
    sendResponse(res, 200, true, null, 'Workout deleted');
  } catch (error) {
    console.error('Delete workout error:', error);
    sendResponse(res, 500, false, null, 'Server error: ' + error.message);
  }
};

module.exports = {
  createWorkout,
  getTodayWorkout,
  getWorkout,
  getAllWorkouts,
  getCalendar,
  getStats,
  deleteWorkout,
};
