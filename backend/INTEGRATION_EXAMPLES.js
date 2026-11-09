/**
 * FITNESS TRACKING API - INTEGRATION EXAMPLES
 * Real-world usage patterns for your frontend or mobile app
 */

// ============================================================================
// 1. INITIALIZATION & SETUP
// ============================================================================

const API_BASE = 'http://localhost:5001/api';

/**
 * Generic API call function
 */
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // For session-based auth
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message);
  }

  return json.data;
}

// ============================================================================
// 2. SETUP EXERCISES (One-time)
// ============================================================================

/**
 * Initialize exercises for a new user
 * This typically runs once during app setup
 */
async function initializeExercisesForUser() {
  try {
    // Get all exercise groups
    const exerciseGroups = await apiCall('/exercise-groups', 'GET');
    console.log('Exercise Groups:', exerciseGroups);

    // Get all exercises
    const exercises = await apiCall('/exercises', 'GET');
    console.log('Available Exercises:', exercises.data);

    return { exerciseGroups, exercises };
  } catch (error) {
    console.error('Failed to initialize exercises:', error);
  }
}

// ============================================================================
// 3. LOGGING WORKOUTS (Main feature)
// ============================================================================

/**
 * Log a single exercise for today
 * Call this for each exercise the user performs
 */
async function logExercise(exerciseId, exerciseName, sets) {
  try {
    const workout = await apiCall('/workouts', 'POST', {
      exerciseId,
      exerciseName,
      sets, // Array of { reps, weight, duration, notes }
      date: new Date().toISOString().split('T')[0],
    });

    console.log('Exercise logged:', workout);
    return workout;
  } catch (error) {
    console.error('Failed to log exercise:', error);
  }
}

/**
 * Real example: User does a workout session
 */
async function userWorkoutSession() {
  try {
    // Exercise 1: Bench Press
    await logExercise(
      'BENCH_PRESS_ID', // Replace with actual ObjectId
      'Bench Press',
      [
        { reps: 10, weight: 100, notes: 'Good form' },
        { reps: 8, weight: 110, notes: 'Felt strong' },
        { reps: 6, weight: 115, notes: 'Last rep was hard' },
      ]
    );

    // Exercise 2: Incline Dumbbell Press
    await logExercise(
      'INCLINE_DB_ID',
      'Incline Dumbbell Press',
      [
        { reps: 12, weight: 35, notes: 'Per side' },
        { reps: 10, weight: 40, notes: 'Per side' },
      ]
    );

    // Exercise 3: Shoulder Press
    await logExercise(
      'SHOULDER_PRESS_ID',
      'Shoulder Press',
      [{ reps: 10, weight: 60 }, { reps: 8, weight: 65 }, { reps: 6, weight: 70 }]
    );

    console.log('✅ Workout completed!');
  } catch (error) {
    console.error('Failed to log workout:', error);
  }
}

// ============================================================================
// 4. VIEWING TODAY'S WORKOUT
// ============================================================================

/**
 * View what user logged today
 */
async function getTodayWorkout() {
  try {
    const workout = await apiCall('/workouts/today', 'GET');

    if (!workout) {
      console.log('No workout logged today');
      return null;
    }

    console.log('Today\'s Workout:');
    workout.exercises.forEach((ex) => {
      console.log(`\n${ex.name}:`);
      ex.sets.forEach((set, idx) => {
        const metrics = [];
        if (set.reps) metrics.push(`${set.reps} reps`);
        if (set.weight) metrics.push(`${set.weight}kg`);
        if (set.volume) metrics.push(`Volume: ${set.volume}`);
        console.log(`  Set ${idx + 1}: ${metrics.join(', ')}`);
      });
    });

    return workout;
  } catch (error) {
    console.error('Failed to fetch today\'s workout:', error);
  }
}

// ============================================================================
// 5. PROGRESS TRACKING - GROWTH DATA
// ============================================================================

/**
 * Get growth data for an exercise (for graphing)
 * Perfect for Chart.js, Recharts, or D3
 */
async function getExerciseGrowth(exerciseId) {
  try {
    const growthData = await apiCall(`/exercises/${exerciseId}/growth`, 'GET');

    console.log('Growth Data (for charting):');
    growthData.forEach((point) => {
      console.log(
        `${point.date}: max_weight=${point.max_weight}kg, volume=${point.total_volume}`
      );
    });

    // Return formatted for Chart.js
    return {
      labels: growthData.map((p) => new Date(p.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Max Weight (kg)',
          data: growthData.map((p) => p.max_weight || 0),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Total Volume',
          data: growthData.map((p) => p.total_volume || 0),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch growth data:', error);
  }
}

// ============================================================================
// 6. LAST RECORDS (Recent Performance)
// ============================================================================

/**
 * Show last 5 workouts for a specific exercise
 */
async function getLastRecords(exerciseId, limit = 5) {
  try {
    const records = await apiCall(
      `/exercises/${exerciseId}/last-records?limit=${limit}`,
      'GET'
    );

    console.log(`Last ${limit} records:`);
    records.forEach((record, idx) => {
      console.log(`\n${idx + 1}. ${new Date(record.date).toLocaleDateString()}`);
      record.sets.forEach((set, setIdx) => {
        const metrics = [];
        if (set.reps) metrics.push(`${set.reps} reps`);
        if (set.weight) metrics.push(`${set.weight}kg`);
        console.log(`   Set ${setIdx + 1}: ${metrics.join(', ')}`);
      });
    });

    return records;
  } catch (error) {
    console.error('Failed to fetch last records:', error);
  }
}

// ============================================================================
// 7. PAGINATED HISTORY
// ============================================================================

/**
 * Get full exercise history with pagination
 * Useful for "Exercise History" tab in app
 */
async function getExerciseHistory(exerciseId, page = 1, limit = 10) {
  try {
    const history = await apiCall(
      `/exercises/${exerciseId}/history?page=${page}&limit=${limit}`,
      'GET'
    );

    console.log(
      `History page ${history.page} of ${history.totalPages} (${history.total} total):`
    );

    history.data.forEach((record) => {
      console.log(`${new Date(record.date).toLocaleDateString()}: ${record.exercise_name}`);
    });

    return history;
  } catch (error) {
    console.error('Failed to fetch exercise history:', error);
  }
}

// ============================================================================
// 8. WORKOUT CALENDAR
// ============================================================================

/**
 * Get calendar - which days have at least one workout
 * Perfect for calendar UI showing workout streaks
 */
async function getWorkoutCalendar(startDate, endDate) {
  try {
    const workoutDates = await apiCall(
      `/workouts/calendar?startDate=${startDate}&endDate=${endDate}`,
      'GET'
    );

    console.log('Workout dates in range:');
    console.log(workoutDates);

    // Return formatted for calendar component
    return workoutDates.map((dateStr) => new Date(dateStr));
  } catch (error) {
    console.error('Failed to fetch workout calendar:', error);
  }
}

/**
 * Calculate workout streak
 */
async function calculateStreak() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  const startDate = `${year}-01-01`;
  const endDate = `${year}-${month}-${String(today.getDate()).padStart(2, '0')}`;

  const workoutDates = await getWorkoutCalendar(startDate, endDate);

  // Calculate current streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (workoutDates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  console.log(`Current streak: ${streak} days`);
  return streak;
}

// ============================================================================
// 9. STATISTICS
// ============================================================================

/**
 * Get overall statistics for a date range
 */
async function getStatistics(startDate, endDate) {
  try {
    const stats = await apiCall(
      `/workouts/stats?startDate=${startDate}&endDate=${endDate}`,
      'GET'
    );

    console.log('Statistics:');
    console.log(`  Total workouts: ${stats.total_workouts}`);
    console.log(`  Total exercises: ${stats.total_exercises}`);
    console.log(`  Total sets: ${stats.total_sets}`);
    console.log(`  Total volume: ${stats.total_volume}kg`);

    return stats;
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
  }
}

/**
 * Get this month's statistics
 */
async function getMonthStatistics() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return getStatistics(
    startOfMonth.toISOString().split('T')[0],
    endOfMonth.toISOString().split('T')[0]
  );
}

// ============================================================================
// 10. FULL WORKOUT APP FLOW
// ============================================================================

/**
 * Simulate a complete day in the app
 */
async function simulateDayInApp() {
  console.log('\n=== SIMULATING A DAY IN THE FITNESS APP ===\n');

  // Step 1: User opens app - fetch today's workout
  console.log('Step 1: Fetching today\'s workout...');
  await getTodayWorkout();

  // Step 2: User starts logging workouts
  console.log('\nStep 2: Logging exercises...');
  await logExercise(
    'BENCH_PRESS_ID',
    'Bench Press',
    [
      { reps: 10, weight: 100 },
      { reps: 8, weight: 110 },
      { reps: 6, weight: 115 },
    ]
  );

  // Step 3: User views their progress tab
  console.log('\nStep 3: Viewing progress...');
  await getExerciseGrowth('BENCH_PRESS_ID');

  // Step 4: User views their streak
  console.log('\nStep 4: Checking streak...');
  await calculateStreak();

  // Step 5: User checks statistics
  console.log('\nStep 5: Viewing monthly statistics...');
  await getMonthStatistics();

  console.log('\n=== DAY IN APP COMPLETE ===\n');
}

// ============================================================================
// 11. REACT COMPONENT EXAMPLE
// ============================================================================

/**
 * React Component: Today's Workout Display
 */
const TodayWorkoutComponent = () => {
  // const [workout, setWorkout] = useState(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchWorkout = async () => {
  //     try {
  //       const data = await apiCall('/workouts/today', 'GET');
  //       setWorkout(data);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchWorkout();
  // }, []);

  return `
    <div>
      <h2>Today's Workout</h2>
      {workout?.exercises.map((exercise) => (
        <div key={exercise._id}>
          <h3>{exercise.name}</h3>
          {exercise.sets.map((set, idx) => (
            <div key={idx}>
              Set {idx + 1}: {set.reps} reps × {set.weight}kg
            </div>
          ))}
        </div>
      ))}
    </div>
  `;
};

// ============================================================================
// 12. EXPORT FOR USE
// ============================================================================

module.exports = {
  apiCall,
  initializeExercisesForUser,
  logExercise,
  userWorkoutSession,
  getTodayWorkout,
  getExerciseGrowth,
  getLastRecords,
  getExerciseHistory,
  getWorkoutCalendar,
  calculateStreak,
  getStatistics,
  getMonthStatistics,
  simulateDayInApp,
};

// ============================================================================
// USAGE IN YOUR APP
// ============================================================================

/*

// In your React app:

import {
  logExercise,
  getTodayWorkout,
  getExerciseGrowth,
  getWorkoutCalendar,
  getStatistics
} from './api-examples';

// In a component:

export function WorkoutTracker() {
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [growth, setGrowth] = useState(null);

  useEffect(() => {
    // Fetch today's workout
    getTodayWorkout().then(setTodayWorkout);

    // Fetch growth for first exercise
    if (exercises.length > 0) {
      getExerciseGrowth(exercises[0]._id).then(setGrowth);
    }
  }, []);

  const handleLogExercise = async (exerciseId, sets) => {
    await logExercise(exerciseId, exercises.find(e => e._id === exerciseId).name, sets);
    // Refresh data
    getTodayWorkout().then(setTodayWorkout);
  };

  return (
    <div>
      <h1>Today's Workout</h1>
      {todayWorkout && (
        <div>
          {todayWorkout.exercises.map(ex => (
            <ExerciseCard key={ex._id} exercise={ex} />
          ))}
        </div>
      )}
      
      <h2>Progress Chart</h2>
      {growth && <LineChart data={growth} />}
    </div>
  );
}

*/
