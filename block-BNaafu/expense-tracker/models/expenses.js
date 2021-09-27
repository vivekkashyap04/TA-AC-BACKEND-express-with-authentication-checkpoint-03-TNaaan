const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema(
  {
    name: String,
    category: [String],
    amount: Number,
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ date: 1 });
expenseSchema.indexes({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
