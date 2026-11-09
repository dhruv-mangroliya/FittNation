const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:  { type: Number, required: true },
  plan:    { type: String, enum: ['Monthly', '6 Months', 'Annual'], required: true },
  branch:  { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  date:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
