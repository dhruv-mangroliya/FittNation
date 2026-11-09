const BodyWeight = require('../models/BodyWeight');

const sendResponse = (res, status, success, data, message) =>
  res.status(status).json({ success, data, message });

// POST /api/bodyweight — log or update today's weight
const logWeight = async (req, res) => {
  try {
    const { weight_kg, date } = req.body;
    if (!weight_kg) return sendResponse(res, 400, false, null, 'weight_kg is required');

    const dateVal = date ? new Date(date) : new Date();
    dateVal.setHours(0, 0, 0, 0);

    const entry = await BodyWeight.findOneAndUpdate(
      { user_id: req.user._id, date: dateVal },
      { weight_kg },
      { upsert: true, new: true }
    );

    sendResponse(res, 200, true, entry, 'Weight logged');
  } catch (err) {
    sendResponse(res, 500, false, null, err.message);
  }
};

// GET /api/bodyweight?days=90 — fetch history
const getWeightHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries = await BodyWeight.find({
      user_id: req.user._id,
      date: { $gte: since },
    }).sort({ date: 1 });

    sendResponse(res, 200, true, entries, 'Weight history fetched');
  } catch (err) {
    sendResponse(res, 500, false, null, err.message);
  }
};

module.exports = { logWeight, getWeightHistory };
