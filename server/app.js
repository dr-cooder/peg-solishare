const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const expressHandlebars = require('express-handlebars');
const mongoose = require('mongoose');
const fs = require('fs');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const csrf = require('csurf');
const { Storage } = require('@google-cloud/storage');

const config = require('./config.js');

const router = require('./router.js');
const { countSampleBinName } = require('../common/puzzle.js');

mongoose.connect(config.connections.mongo, (err) => {
  if (err) {
    console.error('Could not connect to MongoDB!');
    throw err;
  }
});

const redisClient = redis.createClient({
  legacyMode: true,
  url: config.connections.redis,
});
redisClient.connect().catch(console.error);

const app = express();

// https://stackoverflow.com/questions/68605754/helmet-content-security-policy-blocking-react-js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://ajax.googleapis.com',
        'https://stackpath.bootstrapcdn.com',
        'https://cdn.jsdelivr.net',
        'https://unpkg.com/',
      ],
      styleSrc: [
        "'self'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
        'https://fonts.googleapis.com/',
      ],
      imgSrc: ['*', 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
}));

app.use('/assets', express.static(path.resolve(config.staticAssets.path)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));

app.use(session({
  key: 'sessionId',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: config.secret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));

app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());
app.disable('x-powered-by');

app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.error('Missing CSRF token!');
  console.error(req.url);
  return false;
});

// Don't start until the timeline directory has been loaded
const start = (getTimelinePart) => {
  router(app, getTimelinePart);
  app.listen(config.connections.http.port, (err) => {
    if (err) throw err;
    console.log(`Listening on port ${config.connections.http.port}`);
  });
};

const googleConnection = config.connections.google;
if (googleConnection) {
  // https://www.youtube.com/watch?v=pGSzMfKBV9Q
  const gc = new Storage(googleConnection.options);
  const bucketName = googleConnection.bucket;
  start(async (count, sample) => {
    const binName = countSampleBinName(count, sample);
    try {
      const download = await gc.bucket(bucketName).file(binName).download();
      // https://github.com/googleapis/nodejs-storage/issues/676
      return Buffer.from(download[0]);
    } catch (err) {
      // Assume cloud Sacred Timeline is complete
      return Buffer.alloc(0);
    }
  });
} else {
  start(async (count, sample) => {
    try {
      return fs.readFileSync(`${__dirname}/../sacredTimeline/count-sample/${countSampleBinName(count, sample)}`);
    } catch (err) {
      // Assume local Sacred Timeline is complete
      return Buffer.alloc(0);
    }
  });
}
