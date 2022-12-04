const { getAccount } = require('./controllerHelpers.js');
const { Account } = require('../models');

const home = (req, res) => res.render('home', { username: getAccount(req).username });

const play = async (req, res) => {
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) return res.redirect('/login');
  return res.render('play', {
    title: 'Disappearing Act 3',
    creator: 'Rory',
    code: '000010001110001111101111111000000',
    startingHintBalance: account.hintBalance,
  });
};

const login = (req, res) => res.render('login', {
  csrfToken: req.csrfToken(),
  initial: typeof req.query.signup !== 'undefined' ? 'signup' : 'login',
  username: getAccount(req).username,
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
