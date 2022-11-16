const Configuration = require('../../client/Configuration.js')

const homepage = (req, res) => res.render('homepage', {
  buttonText: 'Button',
});

const solve = (req, res) => {
  const code = req.query.code;
  const config = new Configuration(code);
  console.log('Attempting to solve...');
  const solution = config.solveOne();
  console.log('Success!');
  return res.status(200).json({ solution });
}

module.exports = {
  homepage,
  solve,
};
