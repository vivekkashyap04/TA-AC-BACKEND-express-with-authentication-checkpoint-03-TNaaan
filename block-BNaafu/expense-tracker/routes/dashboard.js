var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Expense = require('../models/expenses');
var Income = require('../models/income');
var moment = require('moment');

router.get('/', (req, res) => {
  console.log(req.query, 'query');
  var currMonth = moment().month();
  User.findById(req.session.userId, (err, user) => {
    Income.find({ userId: req.session.userId }, (err, incomes) => {
      Expense.find({ userId: req.session.userId }, (err, expenses) => {
        //month
        Income.aggregate([
          {
            $project: {
              income: 1,
              amount: 1,
              dateofmonth: { $month: '$date' },
            },
          },
          { $match: { dateofmonth: currMonth + 1 } },
          { $group: { _id: 'amount', total: { $sum: '$amount' } } },
        ]).exec((err, currentmonthInc) => {
          console.log(currentmonthInc, 'inc');
          //expenses
          Expense.aggregate([
            {
              $project: {
                income: 1,
                amount: 1,
                dateofmonth: { $month: '$date' },
              },
            },
            { $match: { dateofmonth: currMonth + 1 } },
            { $group: { _id: 'amount', total: { $sum: '$amount' } } },
          ]).exec((err, currentmonthExp) => {
            console.log(currentmonthExp, 'exp');
            let balance = currentmonthInc[0].total - currentmonthExp[0].total;
            console.log(balance, 'balance');
            res.render('dashboard', {
              incomes,
              expenses,
              currentmonthInc,
              currentmonthExp,
              balance,
            });
          });
        });
      });
    });
  });
});

router.post('/filterdate', (req, res, next) => {
  var { startDate, endDate } = req.body;
  console.log(req.body);
  Income.find(
    {
      date: { $gt: new Date(startDate), $lt: new Date(endDate) },
      userId: req.session.userId,
    },
    (err, incomes) => {
      if (err) return next(err);
      Expense.find(
        { date: { $gt: new Date(startDate), $lt: new Date(endDate) } },
        (err, expenses) => {
          Expense.aggregate([
            {
              $match: {
                date: { $gt: new Date(startDate), $lt: new Date(endDate) },
              },
            },
            { $group: { _id: 'amount', total: { $sum: '$amount' } } },
          ]).exec((err, currentmonthExp) => {
            Income.aggregate([
              {
                $match: {
                  date: { $gt: new Date(startDate), $lt: new Date(endDate) },
                },
              },
              { $group: { _id: 'amount', total: { $sum: '$amount' } } },
            ]).exec((err, currentmonthInc) => {
              let balance = currentmonthInc[0].total - currentmonthExp[0].total;
              console.log(balance, 'balance');
              res.render('dashboard', {
                incomes,
                expenses,
                currentmonthInc,
                currentmonthExp,
                balance,
              });
            });
          });
        }
      );
    }
  );
});

module.exports = router;

// Income.aggregate([
//   { $project: { income: 1, dateofmonth: { $month: '$date' } } },
//   { $match: { dateofmonth: 09 } },
// ]).exec((err, month) => {
//   console.log(month);
// });
// Expense.aggregate([
//   { $group: { _id: 'amount', total: { $sum: '$amount' } } },
// ]).exec((err, amount) => {
//   console.log(amount[0].total, 'amount');
//   Income.aggregate([
//     { $group: { _id: 'amount', total: { $sum: '$amount' } } },
//   ]).exec((err, income) => {
//     console.log(income[0].total, 'amount');
//   });
// });
