const router = require('express').Router();
const { logWeight, getWeightHistory } = require('../controllers/bodyWeightController');

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  next();
};

router.post('/', isAuthenticated, logWeight);
router.get('/', isAuthenticated, getWeightHistory);

module.exports = router;
