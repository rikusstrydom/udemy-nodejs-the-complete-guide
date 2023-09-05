const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash('error');
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }

      if (bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        return req.session.save((err) => {
          res.redirect('/');
        });
      }

      req.flash('error', 'Invalid email or password.');
      res.redirect('/login');
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  let errorMessage = req.flash('error');
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    isAuthenticated: false,
    errorMessage,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'Email already exists!');
        return res.redirect('/signup');
      }

      const hashedPassword = bcrypt.hashSync(password, 12);

      const user = new User({ email, password: hashedPassword, cart: { items: [] } });
      return user.save().then((result) => {
        res.redirect('/login');
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
};
