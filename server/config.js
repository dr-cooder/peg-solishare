require('dotenv').config();

const staticAssets = {
  development: {
    path: 'hosted/',
  },
  production: {
    path: 'hosted/',
  },
};

const googleAvailable = !!(process.env.GOOGLE_CLOUD_PROJECT_ID
  && process.env.GOOGLE_CLOUD_KEY
  && process.env.GOOGLE_CLOUD_BUCKET);

const connections = {
  development: {
    http: {
      port: 3000,
    },
    mongo: process.env.MONGODB_URI || 'mongodb://127.0.0.1/PegSoliShare',
    redis: process.env.REDISCLOUD_URL,
    google: googleAvailable && {
      options: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: JSON.parse(process.env.GOOGLE_CLOUD_KEY),
      },
      bucket: process.env.GOOGLE_CLOUD_BUCKET,
    },
  },

  production: {
    http: {
      port: process.env.PORT || process.env.NODE_PORT || 3000,
    },
    mongo: process.env.MONGODB_URI,
    redis: process.env.REDISCLOUD_URL,
    google: googleAvailable && {
      options: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: JSON.parse(process.env.GOOGLE_CLOUD_KEY),
      },
      bucket: process.env.GOOGLE_CLOUD_BUCKET,
    },
  },
};

module.exports = {
  env: process.env.NODE_ENV,
  staticAssets: staticAssets[process.env.NODE_ENV],
  connections: connections[process.env.NODE_ENV],
  secret: process.env.SECRET,
};
