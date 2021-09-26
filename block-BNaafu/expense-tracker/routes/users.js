var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Income = require('../models/income');
var nodemailer = require('nodemailer');

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.userId) {
    var income = Income.aggregate([
      { $project: { income: 1, dateofmonth: { $month: '$date' } } },
      { $match: { dateofmonth: 09, userId: req.session.userId } },
    ]);
    console.log(income, 'income');
    res.render('onboarding');
  }
});

//register

router.get('/register', function (req, res, next) {
  var error = req.flash('error')[0];
  res.render('register');
});

router.post('/register', function (req, res, next) {
  var { email, password } = req.body;
  if (password < 5) {
    req.flash('error', 'password is too short');
    res.redirect('/users/register');
  }
  User.findOne({ email }, (err, user) => {
    if (user) {
      req.flash('error', 'email is already exist');
      res.redirect('/users/register');
    } else {
      User.create(req.body, (err, data) => {
        if (err) return next(err);
        // Send email (use credintials of SendGrid)
        var transporter = nodemailer.createTransport({
          service: 'Sendgrid',
          auth: {
            user: 'vivekk8211@gmail.com',
            pass: process.env.PASSWORD,
          },
        });
        var mailOptions = {
          from: 'vivekk8211@gmail.com.com',
          to: user.email,
          subject: 'Account Verification Link',
          text:
            'Hello ' +
            req.body.name +
            ',\n\n' +
            'Please verify your account by clicking the link: \nhttp://' +
            req.headers.host +
            '/confirmation/' +
            user.email +
            '/' +
            '\n\nThank You!\n',
        };
        transporter.sendMail(mailOptions, function (err) {
          if (err) {
            return res.status(500).send({
              msg: 'Some error occur',
            });
          } else {
            req.flash(
              'success',
              'A verification email has been sent to ' +
                user.email +
                '. It will expire after some time'
            );
            res.redirect('/users/login');
          }
        });
      });
    }
  });
});

//login
router.get('/login', function (req, res, next) {
  var error = req.flash('error')[0];
  res.render('login', { error });
});

router.post('/login', function (req, res, next) {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email/Password is required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    console.log(user);
    if (!user) {
      req.flash('error', 'user have to register first');
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      console.log(err, result);
      if (!result) {
        req.flash('error', 'password is incorrect');
        res.redirect('/users/login');
      }
      req.session.userId = user._id;
      res.redirect('/users');
    });
  });
});
//forgetpassword
router.get('/forgetpassword', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('forgetpassword', { error });
});

router.post('/forgetpassword', (req, res, next) => {
  var email = req.body.email;
  User.find({ email: email }, (err, info) => {
    console.log(info);
    if (info) {
      res.render('changepassword', { user: info });
    } else {
      req.flash('error', 'email is not correct');
    }
  });
});

router.post('/:id/changepassword', (req, res, next) => {
  var id = req.params.id;
  console.log(id);
  User.findByIdAndUpdate(id, req.body, (err, info) => {
    console.log(info);
    res.redirect('/users/login');
  });
});
//logout
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});
module.exports = router;
