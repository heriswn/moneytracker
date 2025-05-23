const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
