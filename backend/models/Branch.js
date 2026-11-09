const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  slug:       { type: String, unique: true, required: true },
  name:       { type: String, required: true },
  tag:        { type: String, default: null },
  address:    { type: String, required: true },
  phone:      { type: String, required: true },
  hours:      { type: String, required: true },
  facilities: [{ type: String }],
  mapUrl:     { type: String, default: '' },
  mapLink:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
