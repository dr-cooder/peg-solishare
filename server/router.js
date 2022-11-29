const controllers = require('./controllers');

const router = (app, getTimelinePart) => {
  app.get('/', controllers.homepage);
  app.get('/hint', (req, res) => controllers.hint(req, res, getTimelinePart));
};

module.exports = router;
