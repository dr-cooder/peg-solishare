const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.homepage);
  app.get('/hint', controllers.hint);
};

module.exports = router;
