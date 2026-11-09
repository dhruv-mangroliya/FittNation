require('dotenv').config();
const mongoose = require('mongoose');
const MuscleGroup = require('./models/MuscleGroup');
const ExerciseGroup = require('./models/ExerciseGroup');
const Exercise = require('./models/Exercise');
const Workout = require('./models/Workout');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fittnation');
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    // await MuscleGroup.deleteMany({});
    // await ExerciseGroup.deleteMany({});
    // await Exercise.deleteMany({});

    // Create Muscle Groups
    const muscleGroups = await MuscleGroup.insertMany(
      [
        { name: 'Chest', description: 'Pectoral muscles' },
        { name: 'Back', description: 'Latissimus and back muscles' },
        { name: 'Shoulders', description: 'Deltoids and trap muscles' },
        { name: 'Biceps', description: 'Front arm muscles' },
        { name: 'Triceps', description: 'Back arm muscles' },
        { name: 'Forearms', description: 'Lower arm muscles' },
        { name: 'Legs', description: 'Quadriceps, hamstrings, glutes' },
        { name: 'Calves', description: 'Lower leg muscles' },
        { name: 'Core', description: 'Abdominal and core muscles' },
      ],
      { ordered: false }
    ).catch((err) => {
      if (err.code === 11000) {
        console.log('Muscle groups already exist');
        return MuscleGroup.find();
      }
      throw err;
    });

    console.log('Created/Found muscle groups:', muscleGroups.length);

    // Create Exercise Groups
    const exerciseGroups = await ExerciseGroup.insertMany(
      [
        {
          name: 'Push Day',
          description: 'Chest, shoulders, and triceps',
          muscle_group_ids: [
            muscleGroups.find((m) => m.name === 'Chest')._id,
            muscleGroups.find((m) => m.name === 'Shoulders')._id,
            muscleGroups.find((m) => m.name === 'Triceps')._id,
          ],
        },
        {
          name: 'Pull Day',
          description: 'Back and biceps',
          muscle_group_ids: [
            muscleGroups.find((m) => m.name === 'Back')._id,
            muscleGroups.find((m) => m.name === 'Biceps')._id,
          ],
        },
        {
          name: 'Leg Day',
          description: 'Legs and calves',
          muscle_group_ids: [
            muscleGroups.find((m) => m.name === 'Legs')._id,
            muscleGroups.find((m) => m.name === 'Calves')._id,
          ],
        },
        {
          name: 'Core & Cardio',
          description: 'Core strength and cardio',
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Core')._id],
        },
      ],
      { ordered: false }
    ).catch((err) => {
      if (err.code === 11000) {
        console.log('Exercise groups already exist');
        return ExerciseGroup.find();
      }
      throw err;
    });

    console.log('Created/Found exercise groups:', exerciseGroups.length);

    // Create Exercises
    const pushDayGroup = exerciseGroups.find((g) => g.name === 'Push Day');
    const pullDayGroup = exerciseGroups.find((g) => g.name === 'Pull Day');
    const legDayGroup = exerciseGroups.find((g) => g.name === 'Leg Day');

    const exercises = await Exercise.insertMany(
      [
        // Push Day exercises
        {
          name: 'Bench Press',
          group_id: pushDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Chest')._id],
          unit: 'kg',
          description: 'Barbell chest press',
        },
        {
          name: 'Incline Dumbbell Press',
          group_id: pushDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Chest')._id],
          unit: 'kg',
          description: 'Inclined dumbbell press',
        },
        {
          name: 'Shoulder Press',
          group_id: pushDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Shoulders')._id],
          unit: 'kg',
          description: 'Overhead shoulder press',
        },
        {
          name: 'Lateral Raises',
          group_id: pushDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Shoulders')._id],
          unit: 'kg',
          description: 'Lateral dumbbell raises',
        },
        {
          name: 'Tricep Dips',
          group_id: pushDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Triceps')._id],
          unit: 'kg',
          description: 'Bodyweight dips with added weight',
        },
        {
          name: 'Rope Tricep Pushdown',
          group_id: pushDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Triceps')._id],
          unit: 'kg',
          description: 'Cable rope tricep pushdown',
        },

        // Pull Day exercises
        {
          name: 'Deadlift',
          group_id: pullDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Back')._id],
          unit: 'kg',
          description: 'Conventional deadlift',
        },
        {
          name: 'Pull-ups',
          group_id: pullDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Back')._id],
          unit: 'reps',
          description: 'Bodyweight pull-ups',
        },
        {
          name: 'Barbell Rows',
          group_id: pullDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Back')._id],
          unit: 'kg',
          description: 'Bent over barbell rows',
        },
        {
          name: 'Barbell Curls',
          group_id: pullDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Biceps')._id],
          unit: 'kg',
          description: 'Standing barbell curls',
        },
        {
          name: 'Hammer Curls',
          group_id: pullDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Biceps')._id],
          unit: 'kg',
          description: 'Dumbbell hammer curls',
        },

        // Leg Day exercises
        {
          name: 'Squats',
          group_id: legDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Legs')._id],
          unit: 'kg',
          description: 'Barbell back squats',
        },
        {
          name: 'Leg Press',
          group_id: legDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Legs')._id],
          unit: 'kg',
          description: 'Machine leg press',
        },
        {
          name: 'Romanian Deadlift',
          group_id: legDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Legs')._id],
          unit: 'kg',
          description: 'RDL for hamstrings',
        },
        {
          name: 'Leg Curls',
          group_id: legDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Legs')._id],
          unit: 'kg',
          description: 'Machine leg curls',
        },
        {
          name: 'Calf Raises',
          group_id: legDayGroup._id,
          muscle_group_ids: [muscleGroups.find((m) => m.name === 'Calves')._id],
          unit: 'kg',
          description: 'Standing calf raises',
        },
      ],
      { ordered: false }
    ).catch((err) => {
      if (err.code === 11000) {
        console.log('Exercises already exist');
        return Exercise.find();
      }
      throw err;
    });

    console.log('Created/Found exercises:', exercises.length);

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if this is the main module
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
