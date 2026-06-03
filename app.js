require('dotenv').config();

const nodeCrypto = (() => {
  try {
    return require('crypto');
  } catch (error) {
    return null;
  }
})();

if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
  if (nodeCrypto?.webcrypto?.getRandomValues) {
    globalThis.crypto = nodeCrypto.webcrypto;
  } else if (typeof nodeCrypto?.randomBytes === 'function') {
    globalThis.crypto = {
      getRandomValues: (array) => {
        const bytes = nodeCrypto.randomBytes(array.length);
        array.set(bytes);
        return array;
      }
    };
  } else {
    throw new Error('No crypto implementation available for MongoDB driver');
  }
}

global.crypto = globalThis.crypto;

globalThis.crypto = globalThis.crypto;


Object.defineProperty(globalThis, 'crypto', {
  value: globalThis.crypto,
  writable: true,
  configurable: true,
  enumerable: true,
});

global.crypto = globalThis.crypto;

globalThis.crypto = global.crypto;

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

// FIX: 'views' ki jagah absolute path dein __dirname ka use karke
app.set('views', path.join(__dirname, 'views'));

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
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(cartTotalMiddleware);

/* GLOBAL VARIABLES */

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session?.isLoggedIn || false;
  res.locals.isHostLoggedIn = req.session?.isHostLoggedIn || false;
  res.locals.user = req.session?.user || null;
  res.locals.host = req.session?.host || null;
  res.locals.query = req.query?.q || '';
  res.locals.isloginpage = false;
  res.locals.ishostloginpage = false;
  next();
});

/* ROUTES */

app.use('/host', hostRouter);
app.use(storeRouter);

/* 404 */

app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 2006;

async function startApp() {
  if (DB_PATH) {
    try {
      await mongoose.connect(DB_PATH, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log('MongoDB Connected');
    } catch (err) {
      console.error('Error while connecting to MongoDB:', err);
      console.warn('MongoDB connection failed, continuing without database.');
    }
  } else {
    console.warn('Warning: MONGODB_URI is not set. Running without database connection.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
}

startApp();

console.log('EMAIL:', process.env.EMAIL_USER || 'not set');
console.log('PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Not Loaded');