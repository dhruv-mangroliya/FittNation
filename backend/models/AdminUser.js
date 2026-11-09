const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, unique: true, required: true },
  phone:   { type: String, default: '' },
  permissions: {
    members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
    analytics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
    branches:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
