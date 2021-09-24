var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Expense = require('../models/expenses');

router.get('/', function (req, res, next) {
  res.render('expenses');
});

router.post('/', (req, res, next) => {
  req.body.userId = req.session.userId;
  Expense.create(req.body, (err, expense) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.session.userId,
      { $push: { expenseId: expense._id } },
      (err, user) => {
        console.log(user);
        res.redirect('/users');
      }
    );
  });
});

module.exports = router;
