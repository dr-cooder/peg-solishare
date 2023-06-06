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
const { countSampleBinName, countSampleBinNameNoExt } = require('../common/puzzle.js');

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

const timelineDirectory = process.env.TIMELINE_DIRECTORY;
const timelineUrlPattern = process.env.TIMELINE_URL_PATTERN;
if (timelineDirectory && timelineUrlPattern) {
  const urlPatternSplit = timelineUrlPattern.split('|');
  const urlLeft = urlPatternSplit[0];
  const urlRight = urlPatternSplit[1] || '';
  fetch(timelineDirectory).then((response) => {
    response.json().then((json) => {
      start(async (count, sample) => {
        const binName = countSampleBinNameNoExt(count, sample);
        const binId = json[binName];
        // Assume that empty files are not in directory (presumably not uploaded either)
        if (!binId) return Buffer.alloc(0);
        const url = `${urlLeft}${binId}${urlRight}`;
        const partResponse = await fetch(url);
        const partStatus = partResponse.status;
        const partType = partResponse.headers.get('content-type');
        // If anything but the expected file is returned
        // (i.e. a 429 HTML page or a file that isn't an "octet-stream")
        // it will still be read as raw binary, and as such a false-positive, incorrect
        // Sacred Timeline will be read without any way of knowing!
        if (partStatus !== 200 || partType !== 'application/octet-stream') throw new Error(`Requesting timeline part ${binName} from ${url} returned status ${partStatus} and type ${partType} - Please ensure that your host of choice permits automated requests!`);
        const partArrayBuffer = await partResponse.arrayBuffer();
        console.log(`Received timeline part ${binName} from ${url}`);
        return Buffer.from(partArrayBuffer);
      });
    }).catch((err) => {
      console.error('Unable to parse timeline directory JSON!');
      throw err;
    });
  }).catch((err) => {
    console.error('Unable to fetch external timeline directory! Please ensure the environment variable is a working link, and that your host of choice permits automated requests!');
    throw err;
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
