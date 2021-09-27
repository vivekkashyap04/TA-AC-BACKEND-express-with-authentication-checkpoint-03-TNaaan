var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var incomerouter = require('./routes/income');
var expenserouter = require('./routes/expenses');
var dashboardrouter = require('./routes/dashboard');
var auth = require('./middleware/auth');
const { env } = require('process');

var app = express();
require('./modules/passport');

mongoose.connect('mongodb://localhost/expenses', (err) => {
  console.log(err ? err : 'database connected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost/expenses',
    }),
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(auth.loggedInUser);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/expenses', expenserouter);
app.use('/incomes', incomerouter);
app.use('/dashboard', dashboardrouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
