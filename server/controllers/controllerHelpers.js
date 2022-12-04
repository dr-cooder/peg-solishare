const getAccount = (req) => (req.session && req.session.account) || {};

module.exports = { getAccount };
