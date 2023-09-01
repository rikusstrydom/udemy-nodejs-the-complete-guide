const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { connect } = require('mongoose');

const rootDir = require('./util/path');

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

//Grant access to static files
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
  User.findById('64f1f7e0da795a65455919ac')
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.getErrorPage);

connect('mongodb+srv://rikusstrydom:@cluster0.u1xpiz9.mongodb.net/shop?retryWrites=true&w=majority')
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
