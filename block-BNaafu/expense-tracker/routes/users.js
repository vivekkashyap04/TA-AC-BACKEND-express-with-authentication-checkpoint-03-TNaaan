var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Income = require('../models/income');
var nodemailer = require('nodemailer');
const income = require('../models/income');

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.userId) {
    res.render('onboarding');
  }
});

//register

const randomString = () => {
  let str = '';
  for (var i = 0; i <= 8; i++) {
    const ch = Math.floor(Math.random() * 10 + 1);
    str += ch;
  }
  return str;
};

router.get('/register', function (req, res, next) {
  var error = req.flash('error')[0];
  res.render('register', { error });
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
        var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'vivekk8211@gmail.com',
            pass: process.env.PASSWORD,
          },
        });
        var mailOptions = {
          from: 'vivekk8211@gmail.com',
          to: data.email,
          subject: 'Account Verification Link',
          html: `please verify your email account by clicking this link <a href="http://localhost:3000/users/verify/${data._id}>here</a>to verify your email thanks`,
        };
        transporter.sendMail(mailOptions, function (err) {
          if (err) {
            console.log(err, 'error');
          } else {
            console.log('success');
          }
        });
        res.redirect('/users/login');
      });
    }
  });
});

router.get('/verify/:id', async (req, res, next) => {
  var id = req.params.id;
  console.log(id);
  console.log(req.params);
  await User.findById(id, (err, user) => {
    console.log(user);
    if (user) {
      user.isVerified = true;
      user.save();
      res.redirect('/users/login');
    } else {
      res.redirect('/users/register');
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
