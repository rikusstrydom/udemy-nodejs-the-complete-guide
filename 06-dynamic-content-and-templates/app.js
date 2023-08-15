const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rootDir = require('./util/path');
const { engine } = require('express-handlebars');

const app = express();

// Express handlebars setup
// app.engine(
//   'handlebars',
//   engine({ layoutsDir: 'views/layouts/', defaultLayout: 'main.handlebars', extname: 'handlebars' })
// );
// app.set('view engine', 'handlebars');

// Pug setup
// app.set('view engine', 'pug');

// Ejs setup
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin').routes;
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));

//Grant access to static files
app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
  // res.status(404).sendFile(path.join(rootDir, './views/404.html'));
  res.status(404).render('404', { pageTitle: '404', path: '' });
});

app.listen(3000);
