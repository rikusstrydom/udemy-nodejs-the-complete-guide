const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('../models/user');

var transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '',
    pass: '',
  },
});

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
    oldInput: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      oldInput: { email, password },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          oldInput: { email, password },
          errorMessage: 'Invalid email or password',
          validationErrors: [{ path: 'email' }, { path: 'password' }],
        });
      }

      if (bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        return req.session.save((err) => {
          res.redirect('/');
        });
      }

      return res.status(422).render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        oldInput: { email, password },
        errorMessage: 'Invalid email or password',
        validationErrors: [{ path: 'email' }, { path: 'password' }],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      path: '/signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 12);

  const user = new User({ email, password: hashedPassword, cart: { items: [] } });
  return user
    .save()
    .then((result) => {
      const mailOptions = {
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Signup Succeeded!',
        text: '<h1>You successfully signed up!</h1>',
      };

      transport.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });

      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let errorMessage = req.flash('error');
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render('auth/reset', {
    pageTitle: 'Reset',
    path: '/reset',
    errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        transport.sendMail(
          {
            to: req.body.email,
            from: 'shop@node-complete.com',
            subject: 'Password reset',
            text: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset password.</p>
            `,
          },
          function (err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
            }
          }
        );
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash('error', 'No user found');
        return res.redirect('/reset');
      }

      let errorMessage = req.flash('error');
      if (errorMessage.length > 0) {
        errorMessage = errorMessage[0];
      } else {
        errorMessage = null;
      }

      res.render('auth/new-password', {
        pageTitle: 'New Password',
        path: '/new-password',
        errorMessage,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { password, userId, passwordToken } = req.body;

  User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      console.log(user);
      if (!user) return;

      user.password = bcrypt.hashSync(password, 12);
      user.resetToken = null;
      user.resetTokenExpiration = undefined;
      return user.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
