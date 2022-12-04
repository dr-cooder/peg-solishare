const encodeUrl = require('encodeurl');
const config = require('../config.js');

// Only for debugging purposes
const enableMiddleware = true;

const requiresLogin = (req, res, next) => {
  if (enableMiddleware && !req.session.account) {
    return res.redirect(`/login?next=${encodeUrl(req.url)}`);
  }
  return next();
};

const requiresLogout = (req, res, next) => {
  if (enableMiddleware && req.session.account) {
    return res.redirect('/');
  }
  return next();
};

const requiresSecure = (req, res, next) => {
  if (enableMiddleware && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

const bypassSecure = (req, res, next) => {
  next();
};

module.exports = {
  requiresLogin,
  requiresLogout,
  requiresSecure: config.env === 'production' ? requiresSecure : bypassSecure,
};
