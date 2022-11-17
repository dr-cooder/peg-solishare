const Configuration = require('../../client/Configuration.js');

const homepage = (req, res) => res.render('homepage');

const solve = (req, res) => {
  const { code } = req.query;
  const config = new Configuration(code);
  const solution = config.solveOne();
  return res.status(200).json({ solution });
};

module.exports = {
  homepage,
  solve,
};
