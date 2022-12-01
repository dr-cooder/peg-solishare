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

const config = require('./config.js');

const router = require('./router.js');

mongoose.connect(config.connections.mongo, (err) => {
  if (err) {
    console.log('Could not connect to database');
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
        'https://unpkg.com/',
      ],
      styleSrc: [
        "'self'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
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

  console.log('Missing CSRF token!');
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

const timelineDirectory = process.env.TIMELINE_DIRECTORY;
const timelineUrlPattern = process.env.TIMELINE_URL_PATTERN;
if (timelineDirectory && timelineUrlPattern) {
  const urlPatternSplit = timelineUrlPattern.split('|');
  const urlLeft = urlPatternSplit[0];
  const urlRight = urlPatternSplit[1] || '';
  fetch(timelineDirectory).then((response) => {
    response.json().then((json) => {
      start(async (count, sample) => {
        const binId = json[`${count}-${sample}.bin`];
        if (!binId) return Buffer.from([]);
        const url = `${urlLeft}${binId}${urlRight}`;
        const partResponse = await fetch(url);
        console.log(`received ${url}`);
        const partArrayBuffer = await partResponse.arrayBuffer();
        return Buffer.from(partArrayBuffer);
      });
    }).catch((err) => {
      console.log('Unable to parse timeline directory JSON.');
      throw err;
    });
  }).catch((err) => {
    console.log('Unable to fetch timeline directory. Please ensure the environment variable is a working link.');
    throw err;
  });
} else {
  start((count, sample) => {
    try {
      return fs.readFileSync(`${__dirname}/../sacredTimeline/count-sample/${count}-${sample}.bin`);
    } catch (err) {
      return Buffer.from([]);
    }
  });
}
