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

    return res.json({ redirect: req.body.next || '/explore' });
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
    return res.json({ redirect: req.body.next || '/explore' });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username is already in use!' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const changePassword = async (req, res) => {
  const { username, _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) {
    return res.status(401).json({ error: 'You must be signed in to change your password!' });
  }

  const oldPass = `${req.body.oldPass}`;
  const newPass = `${req.body.newPass}`;
  const newPass2 = `${req.body.newPass2}`;

  if (!oldPass || !newPass || !newPass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  return Account.authenticate(username, oldPass, async (authErr, matchingAaccount) => {
    if (authErr || !matchingAaccount) {
      return res.status(401).json({ error: 'Old password is incorrect! (they are cAse-sENsItiVE)' });
    }

    try {
      const newHash = await Account.generateHash(newPass);
      account.password = newHash;
      await account.save();
      return res.json({ message: 'Password update successful!' });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
  });
};

const buyHints = async (req, res) => {
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) {
    return res.status(401).json({ error: 'You must be signed in to buy hints!' });
  }
  const { howMany } = req.body;
  const updatedBalance = account.hintBalance + howMany;
  account.hintBalance = updatedBalance;
  try {
    await account.save();
    return res.status(200).json({ updatedBalance });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const getToken = (req, res) => res.json({ csrfToken: req.csrfToken() });

module.exports = {
  logout,
  login,
  signup,
  changePassword,
  buyHints,
  getToken,
};
