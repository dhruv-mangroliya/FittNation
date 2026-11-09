const router = require('express').Router();
const exerciseController = require('../controllers/exerciseController');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

/**
 * POST /api/exercises
 * Create new exercise
 */
router.post('/', exerciseController.createExercise);

/**
 * GET /api/exercises
 * Get all exercises (paginated, filterable by group)
 */
router.get('/', exerciseController.getAllExercises);

/**
 * GET /api/exercises/:id/growth
 * Get exercise growth data (for graphing)
 */
router.get('/:id/growth', isAuthenticated, exerciseController.getExerciseGrowth);

/**
 * GET /api/exercises/:id/last-records
 * Get last 5 records of exercise
 */
router.get('/:id/last-records', isAuthenticated, exerciseController.getLastRecords);

/**
 * GET /api/exercises/:id/history
 * Get paginated exercise history
 */
router.get('/:id/history', isAuthenticated, exerciseController.getExerciseHistory);

/**
 * GET /api/exercises/:id
 * Get specific exercise
 */
router.get('/:id', exerciseController.getExercise);

/**
 * PUT /api/exercises/:id
 * Update exercise
 */
router.put('/:id', exerciseController.updateExercise);

/**
 * DELETE /api/exercises/:id
 * Delete exercise
 */
router.delete('/:id', exerciseController.deleteExercise);

module.exports = router;
