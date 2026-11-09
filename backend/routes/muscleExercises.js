const router = require('express').Router();
const MuscleGroupExercises = require('../models/MuscleGroupExercises');

const DEFAULT_EXERCISES = {
  // Strength
  'Chest':      ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Chest Fly', 'Push-ups', 'Cable Crossovers'],
  'Back':       ['Deadlift', 'Pull-ups', 'Chin-ups', 'Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'T-Bar Row'],
  'Shoulders':  ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly', 'Arnold Press'],
  'Biceps':     ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl'],
  'Triceps':    ['Tricep Dips', 'Tricep Pushdown', 'Overhead Extension', 'Close-Grip Bench Press', 'Skull Crushers'],
  'Legs':       ['Squats', 'Leg Press', 'Lunges', 'Leg Extension', 'Bulgarian Split Squat'],
  'Glutes':     ['Hip Thrust', 'Glute Bridge', 'Cable Kickbacks', 'Romanian Deadlift', 'Step-ups'],
  'Hamstrings': ['Leg Curl', 'Romanian Deadlift', 'Stiff-Leg Deadlift'],
  'Calves':     ['Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise'],
  'Core':       ['Plank', 'Crunches', 'Leg Raises', 'Russian Twists', 'Bicycle Crunch'],
  // Cardio
  'Basic Cardio':      ['Running', 'Jogging', 'Walking (Brisk Walk)', 'Cycling (Outdoor)', 'Cycling (Stationary)'],
  'Machine Cardio':    ['Treadmill', 'Elliptical', 'Rowing Machine', 'Stair Climber'],
  'HIIT':              ['Jump Rope', 'Burpees', 'Mountain Climbers', 'High Knees', 'Jump Squats'],
  'Low-Impact Cardio': ['Swimming', 'Yoga Flow', 'Pilates', 'Elliptical (Low Resistance)'],
  'Sports Cardio':     ['Football', 'Basketball', 'Badminton', 'Tennis'],
  'Lifestyle Cardio':  ['Steps Tracking', 'Climbing Stairs', 'Hiking', 'Daily Movement (NEAT)'],
};

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const isSuperAdmin = req.user.email === process.env.ADMIN_EMAIL;
  if (!isSuperAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
};

const STRENGTH_GROUPS = ['Chest','Back','Shoulders','Biceps','Triceps','Legs','Glutes','Hamstrings','Calves','Core'];
const CARDIO_GROUPS   = ['Basic Cardio','Machine Cardio','HIIT','Low-Impact Cardio','Sports Cardio','Lifestyle Cardio'];

// GET /api/muscle-exercises — used by tracker
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let docs = await MuscleGroupExercises.find().sort({ muscle_group: 1 });

    // Seed defaults only if collection is completely empty
    if (docs.length === 0) {
      await Promise.all(
        Object.entries(DEFAULT_EXERCISES).map(([muscle_group, exercises]) =>
          MuscleGroupExercises.create({ muscle_group, exercises })
        )
      );
      docs = await MuscleGroupExercises.find().sort({ muscle_group: 1 });
    }

    const map = {};
    docs.forEach(d => { map[d.muscle_group] = d.exercises; });
    res.json({ success: true, data: map, strengthGroups: STRENGTH_GROUPS, cardioGroups: CARDIO_GROUPS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/muscle-exercises/:muscle/exercises — admin: add exercise
router.post('/:muscle/exercises', isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Exercise name required' });
    const doc = await MuscleGroupExercises.findOneAndUpdate(
      { muscle_group: req.params.muscle },
      { $addToSet: { exercises: name.trim() } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/muscle-exercises/:muscle/exercises — admin: remove exercise
router.delete('/:muscle/exercises', isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const doc = await MuscleGroupExercises.findOneAndUpdate(
      { muscle_group: req.params.muscle },
      { $pull: { exercises: name } },
      { new: true }
    );
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
