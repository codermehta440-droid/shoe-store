require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const mongoose = require('mongoose');

const MongoDBStore = require('connect-mongodb-session')(session);

const root = require('./utils/pathUtils');

const hostRouter = require('./routers/hostRouter');
const storeRouter = require('./routers/storeRouter');
const cartTotalMiddleware = require('./middleware/cartTotal');

const app = express();

/* DATABASE */

const DB_PATH = process.env.MONGODB_URI;

/* VIEW ENGINE */

app.set('view engine', 'ejs');
app.set('views', 'views');

/* MIDDLEWARE */


app.use(express.urlencoded({ extended: true }));

// FIX: 'root' ki jagah seedhe '__dirname' ka use karein
app.use(express.static(path.join(__dirname, 'public')));

/* SESSION STORE */

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

/* SESSION */

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(cartTotalMiddleware);

/* GLOBAL VARIABLES */

app.use((req, res, next) => {

  res.locals.isLoggedIn =
    req.session.isLoggedIn || false;

  res.locals.isHostLoggedIn =
    req.session.isHostLoggedIn || false;

  res.locals.user =
    req.session.user || null;

  res.locals.host =
    req.session.host || null;

  next();

});

/* ROUTES */

app.use('/host', hostRouter);
app.use(storeRouter);

app.use((req, res, next) => {

  res.locals.isloginpage = false;
  res.locals.ishostloginpage = false;

  next();

});

/* 404 */

app.use((req, res) => {
  res.status(404).render('404');
});

/* SERVER */

const PORT = process.env.PORT || 2006;

mongoose
  .connect(DB_PATH)
  .then(() => {

    console.log('MongoDB Connected');

    app.listen(PORT, () => {

      console.log(
        `Server running on port ${PORT}`
      );

    });

  })
  .catch(err => {

    console.log(
      'Error while connecting to MongoDB:',
      err
    );

  });

console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");