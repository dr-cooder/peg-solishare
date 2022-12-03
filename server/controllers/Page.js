const getUname = (req) => req.session && req.session.account && req.session.account.username;

const home = (req, res) => res.render('home', { username: getUname(req) });

const play = (req, res) => res.render('play', {
  title: 'Disappearing Act 3',
  creator: 'Rory',
  code: '000010001110001111101111111000000',
});

const login = (req, res) => res.render('login', {
  csrfToken: req.csrfToken(),
  initial: typeof req.query.signup !== 'undefined' ? 'signup' : 'login',
  username: getUname(req),
});

const create = (req, res) => res.render('create');

const explore = (req, res) => res.render('explore');

const accountSettings = (req, res) => res.render('accountSettings');

const notFound = (req, res) => res.status(404).json({
  message: 'Page not found.',
  id: 'notFound',
});

module.exports = {
  home,
  play,
  login,
  create,
  explore,
  accountSettings,
  notFound,
};
