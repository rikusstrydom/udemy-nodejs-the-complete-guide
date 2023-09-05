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

//Add Mongoose User to all requests
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//Add data to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session.user);
  res.locals.csrfToken = req.csrfToken();
  next();
});

//Add Routes
app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('server started!');
    app.listen(3000);
  })
  .catch((err) => console.log(err));
