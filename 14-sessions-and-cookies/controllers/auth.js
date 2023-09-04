const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.user,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('64f1f7e0da795a65455919ac')
    .then((user) => {
      req.session.user = user;
      req.session.save((err) => {
        res.redirect('/');
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
