const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const path = require('path');
const csurf = require('csurf');

const rootDir = require('./util/path');

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

const MONGODB_URI = 'mongodb+srv://rikusstrydom:@cluster0.u1xpiz9.mongodb.net/shop?w=majority';

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

//Grant access to static files
app.use(express.static(path.join(rootDir, 'public')));

//Add mongodb session store
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store }));

//Add CSRF protection
const csurfProtection = csurf();
app.use(csurfProtection);

//Add connect flash
app.use(flash());

//Add data to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session.user);
  res.locals.csrfToken = req.csrfToken();
  next();
});

//Add Mongoose User to all requests
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

//Add Routes
app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((err, req, res, next) => {
  console.log(err);
  // res.status(err.httpStatusCode).render(...);
  // res.redirect('/500');
  res
    .status(500)
    .render('500', { pageTitle: 'Error!', path: '/500', isAuthenticated: Boolean(req.session.user) });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('server started!');
    app.listen(3000);
  })
  .catch((err) => console.log(err));
