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

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/PegSoliShare';
mongoose.connect(dbURI, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

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
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());
app.disable('x-powered-by');

// Don't start until the timeline directory has been loaded
const start = (getTimelinePart) => {
  router(app, getTimelinePart);
  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
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
