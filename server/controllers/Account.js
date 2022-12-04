const { getAccount } = require('./controllerHelpers.js');
const { Account } = require('../models');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password! (they are cAse-sENsItiVE)' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/explore' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/explore' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const buyHints = async (req, res) => {
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) {
    return res.status(401).json({
      message: 'You must be signed in to buy hints.',
      id: 'hintWithoutSignIn',
    });
  }
  const { howMany } = req.body;
  const updatedBalance = account.hintBalance + howMany;
  account.hintBalance = updatedBalance;
  account.save();
  return res.status(200).json({ updatedBalance });
};

const getToken = (req, res) => res.json({ csrfToken: req.csrfToken() });

module.exports = {
  logout,
  login,
  signup,
  buyHints,
  getToken,
};
