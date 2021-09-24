const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: Number,
    phone: Number,
    country: String,
    incomeId: [{ type: Schema.Types.ObjectId, ref: 'Income' }],
    expenseId: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  },
  { timestamps: true }
);

userSchema.index({ name: 'text' });

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, password) => {
      this.password = password;
      return next();
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

module.exports = mongoose.model('User', userSchema);
