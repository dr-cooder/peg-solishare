const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.homepage);
};

module.exports = router;
