const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const rootDir = require('./util/path');
// const sequelize = require('./util/database');

// const Product = require('./models/product');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');
const { mongoConnect } = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

//Grant access to static files
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
  User.findById('64f1b79f0c0f5c8021634a47')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);

mongoConnect()
  .then(() => {
    console.log('server started!');
    app.listen(3000);
  })
  .catch((err) => console.log(err));
