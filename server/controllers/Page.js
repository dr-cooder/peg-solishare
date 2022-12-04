const encodeUrl = require('encodeurl');
const { getAccount } = require('./controllerHelpers.js');
const { Account, Puzzle } = require('../models');

const notFound = (req, res, customMessage) => res.status(404).render('notFound', {
  username: getAccount(req).username,
  customMessage: customMessage || 'The requested page was not found.',
});

const notFoundJSON = (req, res) => res.status(404).json({ error: 'Resource not found.' });

const home = (req, res) => res.render('home', { username: getAccount(req).username });

const play = async (req, res) => {
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) return res.redirect(`/login?next=${encodeUrl(req.url)}`);

  const { code, by } = req.query;
  if (!code || !by) return res.status(400).redirect('/explore');

  return Puzzle.findByCodeAndCreator(code, by, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred.' });
    }

    // Don't let people play a puzzle that isn't in the database; it might not be solvable
    if (!doc) return notFound(req, res, 'That puzzle was not found in the database.');

    return res.render('play', {
      title: doc.title,
      creator: by,
      code,
      startingHintBalance: account.hintBalance,
    });
  });
  // return res.render('play', {
  //   title: 'Disappearing Act 3',
  //   creator: 'Rory',
  //   code: '000010001110001111101111111000000',
  //   startingHintBalance: account.hintBalance,
  // });
};

const login = (req, res) => res.render('login', {
  csrfToken: req.csrfToken(),
  initial: typeof req.query.signup !== 'undefined' ? 'signup' : 'login',
  username: getAccount(req).username,
  next: decodeURIComponent(req.query.next),
});

const create = (req, res) => res.render('create');

const explore = (req, res) => res.render('explore', { username: getAccount(req).username });

const accountSettings = (req, res) => res.render('accountSettings');

module.exports = {
  home,
  play,
  login,
  create,
  explore,
  accountSettings,
  notFound,
  notFoundJSON,
};
