const Game = require('../../client/Game.js');

const homepage = (req, res) => res.render('homepage');

const hint = (req, res) => {
  const { code } = req.query;
  const game = new Game(code);
  if (game.countBalls() === 1) {
    return res.status(200).json({ alreadySolved: true });
  }
  const solution = game.solve();
  if (!solution) {
    return res.status(200).json({ unsolvable: true });
  }
  return res.status(200).json({
    hint: solution[0],
  });
};

module.exports = {
  homepage,
  hint,
};
