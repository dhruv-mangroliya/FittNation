const mongoose = require('mongoose');

const bodyWeightSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    set: (val) => {
      const d = new Date(val);
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },
  weight_kg: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

bodyWeightSchema.index({ user_id: 1, date: -1 });

module.exports = mongoose.model('BodyWeight', bodyWeightSchema);
