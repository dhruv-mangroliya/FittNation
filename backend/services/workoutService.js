const Workout = require('../models/Workout');
const PersonalRecord = require('../models/PersonalRecord');
const Exercise = require('../models/Exercise');

/**
 * Service layer for workout operations
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Given any date input, return the UTC timestamp representing IST midnight of that IST day
// e.g. "2026-05-03" → 2026-05-02T18:30:00.000Z
const istDayStart = (input) => {
  const istStr = typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)
    ? input
    : new Date(new Date(input).getTime() + IST_OFFSET_MS).toISOString().split('T')[0];
  return new Date(`${istStr}T00:00:00+05:30`);
};

// IST day end = IST midnight + 24h - 1ms
const istDayEnd = (input) => new Date(istDayStart(input).getTime() + 24 * 60 * 60 * 1000 - 1);

// Convert stored UTC date back to IST date string YYYY-MM-DD
const toISTDateStr = (utcDate) =>
  new Date(new Date(utcDate).getTime() + IST_OFFSET_MS).toISOString().split('T')[0];

/**
 * Get or create workout for a specific date
 */
const getOrCreateWorkout = async (userId, date) => {
  const { Types: { ObjectId } } = require('mongoose');
  const start = istDayStart(date);
  const end   = istDayEnd(date);

  let workout = await Workout.findOne({
    user_id: new ObjectId(userId),
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  if (!workout) {
    workout = new Workout({ user_id: userId, date: start, exercises: [] });
    await workout.save();
  }
  return workout;
};

/**
 * Add exercise to workout (append or create new set)
 * @param {String} userId
 * @param {String} exerciseId
 * @param {String} exerciseName
 * @param {Array} sets - Array of set objects with reps, weight, duration
 * @param {Date} date
 * @returns {Object} Updated workout
 */
const addExerciseToWorkout = async (userId, exerciseId, exerciseName, sets, date = new Date()) => {
  const workout = await getOrCreateWorkout(userId, date);

  // Check if exercise already exists in today's workout by name
  const existingExerciseIndex = workout.exercises.findIndex(
    (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase()
  );

  // Precompute volume for each set
  const processedSets = sets.map((set) => ({
    reps: set.reps ? Number(set.reps) : null,
    weight: set.weight ? Number(set.weight) : null,
    duration: set.duration ? Number(set.duration) : null,
    volume: set.weight && set.reps ? Number(set.weight) * Number(set.reps) : null,
    notes: set.notes || '',
  }));

  if (existingExerciseIndex !== -1) {
    workout.exercises[existingExerciseIndex].sets.push(...processedSets);
  } else {
    workout.exercises.push({
      exercise_id: exerciseId,
      name: exerciseName,
      sets: processedSets,
    });
  }

  workout.updatedAt = new Date();
  await workout.save();

  // Only update PRs for real exercises (not dummy cardio ID)
  if (exerciseId !== '000000000000000000000000') {
    await updatePersonalRecords(userId, exerciseId, exerciseName, processedSets);
  }

  return workout;
};

/**
 * Update Personal Records based on new workout data
 * @param {String} userId
 * @param {String} exerciseId
 * @param {String} exerciseName
 * @param {Array} sets
 */
const updatePersonalRecords = async (userId, exerciseId, exerciseName, sets) => {
  let pr = await PersonalRecord.findOne({
    user_id: userId,
    exercise_id: exerciseId,
  });

  if (!pr) {
    pr = new PersonalRecord({
      user_id: userId,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
    });
  }

  // Calculate new maximums
  sets.forEach((set) => {
    if (set.weight && (!pr.max_weight || set.weight > pr.max_weight)) {
      pr.max_weight = set.weight;
    }
    if (set.reps && (!pr.max_reps || set.reps > pr.max_reps)) {
      pr.max_reps = set.reps;
    }
    if (set.duration && (!pr.max_duration || set.duration > pr.max_duration)) {
      pr.max_duration = set.duration;
    }
    if (set.volume && (!pr.max_volume || set.volume > pr.max_volume)) {
      pr.max_volume = set.volume;
    }
  });

  pr.last_updated = new Date();
  await pr.save();

  return pr;
};

/**
 * Get exercise growth data (for graphing)
 * Uses aggregation for performance
 * @param {String} userId
 * @param {String} exerciseId
 * @returns {Array} Array of {date, max_weight, total_volume}
 */
const getExerciseGrowth = async (userId, exerciseId) => {
  const growthData = await Workout.aggregate([
    {
      $match: {
        user_id: new (require('mongoose').Types.ObjectId)(userId),
      },
    },
    {
      $unwind: '$exercises',
    },
    {
      $match: {
        'exercises.exercise_id': new (require('mongoose').Types.ObjectId)(exerciseId),
      },
    },
    {
      $unwind: '$exercises.sets',
    },
    {
      $group: {
        _id: '$date',
        max_weight: {
          $max: '$exercises.sets.weight',
        },
        total_volume: {
          $sum: '$exercises.sets.volume',
        },
        max_reps: {
          $max: '$exercises.sets.reps',
        },
        sets_count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        max_weight: 1,
        total_volume: 1,
        max_reps: 1,
        sets_count: 1,
      },
    },
  ]);

  return growthData;
};

/**
 * Get last N records of an exercise
 * @param {String} userId
 * @param {String} exerciseId
 * @param {Number} limit - Default 5
 * @returns {Array} Last N workout records
 */
const getLastRecords = async (userId, exerciseId, limit = 5) => {
  const records = await Workout.aggregate([
    {
      $match: {
        user_id: new (require('mongoose').Types.ObjectId)(userId),
      },
    },
    {
      $sort: { date: -1 },
    },
    {
      $unwind: '$exercises',
    },
    {
      $match: {
        'exercises.exercise_id': new (require('mongoose').Types.ObjectId)(exerciseId),
      },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        date: 1,
        exercise_name: '$exercises.name',
        sets: '$exercises.sets',
      },
    },
  ]);

  return records;
};

/**
 * Get paginated exercise history
 * @param {String} userId
 * @param {String} exerciseId
 * @param {Number} page - Page number (1-indexed)
 * @param {Number} limit - Records per page
 * @returns {Object} {data, total, page, totalPages}
 */
const getExerciseHistory = async (userId, exerciseId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const total = await Workout.countDocuments({
    user_id: new (require('mongoose').Types.ObjectId)(userId),
    'exercises.exercise_id': new (require('mongoose').Types.ObjectId)(exerciseId),
  });

  const data = await Workout.aggregate([
    {
      $match: {
        user_id: new (require('mongoose').Types.ObjectId)(userId),
      },
    },
    {
      $sort: { date: -1 },
    },
    {
      $unwind: '$exercises',
    },
    {
      $match: {
        'exercises.exercise_id': new (require('mongoose').Types.ObjectId)(exerciseId),
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        date: 1,
        exercise_name: '$exercises.name',
        sets: '$exercises.sets',
      },
    },
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Get calendar data - dates where user has at least one workout
 * @param {String} userId
 * @param {Object} dateRange - {start: Date, end: Date} optional
 * @returns {Array} Array of dates (YYYY-MM-DD format)
 */
const getWorkoutCalendar = async (userId, dateRange = null) => {
  const matchStage = {
    user_id: new (require('mongoose').Types.ObjectId)(userId),
  };

  if (dateRange && dateRange.start && dateRange.end) {
    matchStage.date = {
      $gte: istDayStart(dateRange.start),
      $lte: istDayEnd(dateRange.end),
    };
  }

  const dates = await Workout.aggregate([
    { $match: matchStage },
    { $group: { _id: '$date' } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id' } },
  ]);

  return dates.map((d) => toISTDateStr(d.date));
};

/**
 * Get today's workout
 * @param {String} userId
 * @returns {Object} Today's workout or null
 */
const getTodayWorkout = async (userId) => {
  const start = istDayStart(new Date());
  const end   = istDayEnd(new Date());

  const workout = await Workout.findOne({
    user_id: new (require('mongoose').Types.ObjectId)(userId),
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 }).populate('exercises.exercise_id');

  return workout;
};

/**
 * Get workout statistics for a date range
 * @param {String} userId
 * @param {Object} dateRange - {start: Date, end: Date}
 * @returns {Object} Statistics object
 */
const getWorkoutStats = async (userId, dateRange) => {
  const stats = await Workout.aggregate([
    {
      $match: {
        user_id: new (require('mongoose').Types.ObjectId)(userId),
        date: {
          $gte: dateRange.start,
          $lte: dateRange.end,
        },
      },
    },
    {
      $group: {
        _id: null,
        total_workouts: { $sum: 1 },
        total_exercises: {
          $sum: { $size: '$exercises' },
        },
        total_sets: {
          $sum: {
            $sum: {
              $map: {
                input: '$exercises',
                as: 'exercise',
                in: { $size: '$$exercise.sets' },
              },
            },
          },
        },
        total_volume: {
          $sum: {
            $sum: {
              $map: {
                input: '$exercises',
                as: 'exercise',
                in: {
                  $sum: {
                    $map: {
                      input: '$$exercise.sets',
                      as: 'set',
                      in: '$$set.volume',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  return stats[0] || {
    total_workouts: 0,
    total_exercises: 0,
    total_sets: 0,
    total_volume: 0,
  };
};

module.exports = {
  getOrCreateWorkout,
  addExerciseToWorkout,
  updatePersonalRecords,
  getExerciseGrowth,
  getLastRecords,
  getExerciseHistory,
  getWorkoutCalendar,
  getTodayWorkout,
  getWorkoutStats,
};
