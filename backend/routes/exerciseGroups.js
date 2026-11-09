const router = require('express').Router();
const groupController = require('../controllers/exerciseGroupController');

/**
 * MUSCLE GROUP ROUTES
 */

/**
 * POST /api/muscle-groups
 * Create muscle group
 */
router.post('/muscle-groups', groupController.createMuscleGroup);

/**
 * GET /api/muscle-groups
 * Get all muscle groups
 */
router.get('/muscle-groups', groupController.getAllMuscleGroups);

/**
 * GET /api/muscle-groups/:id
 * Get specific muscle group
 */
router.get('/muscle-groups/:id', groupController.getMuscleGroup);

/**
 * EXERCISE GROUP ROUTES
 */

/**
 * POST /api/exercise-groups
 * Create exercise group
 */
router.post('/exercise-groups', groupController.createExerciseGroup);

/**
 * GET /api/exercise-groups
 * Get all exercise groups
 */
router.get('/exercise-groups', groupController.getAllExerciseGroups);

/**
 * GET /api/exercise-groups/:id
 * Get specific exercise group
 */
router.get('/exercise-groups/:id', groupController.getExerciseGroup);

/**
 * PUT /api/exercise-groups/:id
 * Update exercise group
 */
router.put('/exercise-groups/:id', groupController.updateExerciseGroup);

/**
 * DELETE /api/exercise-groups/:id
 * Delete exercise group
 */
router.delete('/exercise-groups/:id', groupController.deleteExerciseGroup);

module.exports = router;
