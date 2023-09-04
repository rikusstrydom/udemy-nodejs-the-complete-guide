const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const { connect } = require('mongoose');

const rootDir = require('./util/path');

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

const MONGODB_URI = 'mongodb+srv://rikusstrydom:nodecomplete@cluster0.u1xpiz9.mongodb.net/shop?w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store }));
app.use(bodyParser.urlencoded({ extended: false }));

//Grant access to static files
app.use(express.static(path.join(rootDir, 'public')));

// Add Mongoose User to all requests
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

app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);

connect(MONGODB_URI)
  .then(() => {
    console.log('server started!');
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: 'Rikus',
          email: 'rikus@nodeshop.com',
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(3000);
  })
  .catch((err) => console.log(err));
