const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.homepage);
  app.get('/hint', controllers.hint);
  app.get('/speedTest', controllers.testHerokuDownloadSpeed);
};

module.exports = router;
