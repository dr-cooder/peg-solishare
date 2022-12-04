const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app, getTimelinePart) => {
  app.get('/token', mid.requiresSecure, controllers.Account.getToken);

  app.get('/', controllers.Page.home);
  app.get('/play', controllers.Page.play);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Page.login);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresSecure, mid.requiresLogin, controllers.Account.logout);

  app.get('/explore', mid.requiresLogin, controllers.Page.explore);
  app.get('/create', mid.requiresLogin, controllers.Page.create);
  app.get('/account', mid.requiresLogin, controllers.Page.accountSettings);

  app.get('/hint', mid.requiresSecure, mid.requiresLogin, (req, res) => controllers.Puzzle.hint(req, res, getTimelinePart));
  app.post('/buy-hints', mid.requiresSecure, mid.requiresLogin, controllers.Account.buyHints);

  // https://stackoverflow.com/questions/6528876/how-to-redirect-404-errors-to-a-page-in-expressjs
  app.get('*', controllers.Page.notFound);
};

module.exports = router;
