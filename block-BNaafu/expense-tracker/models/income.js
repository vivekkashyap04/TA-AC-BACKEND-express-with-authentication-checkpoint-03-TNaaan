const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomeSchema = new Schema(
  {
    income: Number,
    source: [String],
    amount: Number,
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

incomeSchema.index({ date: 1 });
incomeSchema.indexes({ source: 1 });

module.exports = mongoose.model('Income', incomeSchema);
