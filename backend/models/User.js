const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId:    { type: String, unique: true, required: true },
  name:      { type: String, required: true },
  email:     { type: String, unique: true, required: true },
  phone:     { type: String, default: '' },
  googleId:  { type: String, default: null },
  plan:        { type: String, enum: ['Monthly', '6 Months', 'Annual'], required: true },
  branch:      { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  startDate:   { type: Date, default: Date.now },
  expiryDate:  { type: Date, required: true },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
