// Getting the request session account is common, but lint spec doesn't like ?. chaining
// This alternative is less graceful to type so it is reserved to a helper function
const getAccount = (req) => (req.session && req.session.account) || {};

module.exports = { getAccount };
