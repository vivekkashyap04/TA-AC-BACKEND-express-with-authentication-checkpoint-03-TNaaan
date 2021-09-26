var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Expense = require('../models/expenses');
var Income = require('../models/income');

router.get('/', (req, res) => {
  console.log(req.query.source);
  User.findById(req.session.userId)
    .populate('incomeId')
    .exec((err, users) => {
      let incomes = [];
      let expenses = [];
      let balance = 0;
      console.log(users);
      res.render('dashboard');
    });
});

router.post('/filterdate', (req, res, next) => {
  var { startDate, endDate } = req.body;
  console.log(req.body);
  Income.find(
    { date: { $gt: new Date(startDate), $lt: new Date(endDate) } },
    (err, incomes) => {
      if (err) return next(err);
      console.log(data);
      Expense.find(
        { date: { $gt: new Date(startDate), $lt: new Date(endDate) } },
        (err, expenses) => {
          if (err) return next(err);
          let sumOfExpenses = expenses.reduce(
            (acc, curr) => acc + Number(curr.amount),
            0
          );
          let sumOfIncomes = incomes.reduce(
            (acc, curr) => acc + Number(curr.amount),
            0
          );
          let balance = sumOfIncomes - sumOfExpenses;
          res.render('dashboard', { incomes, expenses, balance });
        }
      );
    }
  );
});

module.exports = router;
