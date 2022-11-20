const Game = require('../../client/Game.js');

const homepage = (req, res) => res.render('homepage');

const solve = (req, res) => {
  const { code } = req.query;
  const game = new Game(code);
  const solution = game.solve();
  return res.status(200).json({ solution });
};

module.exports = {
  homepage,
  solve,
};
