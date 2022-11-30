const controllers = require('./controllers');

const router = (app, getTimelinePart) => {
  app.get('/', controllers.home);
  app.get('/play', controllers.play);
  app.get('/hint', (req, res) => controllers.hint(req, res, getTimelinePart));
};

module.exports = router;
