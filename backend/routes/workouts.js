const router = require('express').Router();
const workoutController = require('../controllers/workoutController');

// Middleware to check authentication (adjust based on your setup)
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

/**
 * POST /api/workouts
 * Create or update workout
 */
router.post('/', isAuthenticated, workoutController.createWorkout);

/**
 * GET /api/workouts/today
 * Get today's workout
 */
router.get('/today', isAuthenticated, workoutController.getTodayWorkout);

/**
 * GET /api/workouts/calendar
 * Get calendar with workout dates
 */
router.get('/calendar', isAuthenticated, workoutController.getCalendar);

/**
 * GET /api/workouts/stats
 * Get workout statistics
 */
router.get('/stats', isAuthenticated, workoutController.getStats);

/**
 * GET /api/workouts/:id
 * Get specific workout
 */
router.get('/:id', isAuthenticated, workoutController.getWorkout);

/**
 * GET /api/workouts
 * Get all workouts for user (paginated)
 */
router.get('/', isAuthenticated, workoutController.getAllWorkouts);

/**
 * DELETE /api/workouts/:id
 * Delete workout
 */
router.delete('/:id', isAuthenticated, workoutController.deleteWorkout);

module.exports = router;
