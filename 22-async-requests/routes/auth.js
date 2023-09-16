const express = require('express');
const { check, body } = require('express-validator');
const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', getLogin);

router.get('/signup', getSignup);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .isAlphanumeric()
      .withMessage('Please enter a valid password')
      .trim(),
  ],
  postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Email already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 6 characters long.')
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords does not match!');
        }
        return true;
      })
      .trim(),
  ],
  postSignup
);

router.post('/logout', postLogout);

router.get('/reset', getReset);

router.post('/reset', postReset);

router.get('/reset/:token', getNewPassword);

router.post('/new-password', postNewPassword);

module.exports = router;
