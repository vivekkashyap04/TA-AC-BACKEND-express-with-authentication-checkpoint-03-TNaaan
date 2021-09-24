var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Expense = require('../models/expenses');
var Income = require('../models/income');

router.get('/', (req, res) => {
  User.findById(req.session.userId)
    .populate('expenseId', 'incomeId')
    .exec((err, user) => {
      console.log(user);
      res.render('dashboard');
    });
});

router.post('/filterdate', (req, res, next) => {
  var { startDate, endDate } = req.body;
  console.log(req.body);
  Income.find(
    { date: { $gt: new Date(startDate), $lt: new Date(endDate) } },
    (err, data) => {
      console.log(data);
    }
  );
});

module.exports = router;
