var express = require('express');
const { render } = require('../app');
var router = express.Router();
var User = require('../models/user');
var Income = require('../models/income');

router.get('/', function (req, res, next) {
  res.render('income');
});

router.post('/', (req, res, next) => {
  req.body.userId = req.session.userId;
  Income.create(req.body, (err, income) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.session.userId,
      { $push: { incomeId: income._id } },
      (err, user) => {
        res.redirect('/users');
      }
    );
  });
});

module.exports = router;
