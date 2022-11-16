const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.homepage);
  app.get('/solve', controllers.solve);
};

module.exports = router;
