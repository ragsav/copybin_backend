const mongoose = require('mongoose');
const textEntry = new mongoose.Schema(
  {
    encodedText: {
      type: String,
      required: true,
    },
    isPassword: {
      type: Boolean,
      required: true,
    },
    password: {
      type: String,
    },
    expiry: {
      type: Date,
      default: new Date(Date.now() + 3600 * 1000),
    },
    editable: {
      type: Boolean,
      default: false,
    },
    // createdAt: { type: Date, expires:600, default: Date.now },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('textEntry', textEntry);
