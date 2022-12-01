const home = (req, res) => res.render('home');

const play = (req, res) => res.render('play', {
  title: 'Disappearing Act 3',
  creator: 'Rory',
  code: '000010001110001111101111111000000',
});

const login = (req, res) => res.render('login');

const create = (req, res) => res.render('create');

const explore = (req, res) => res.render('explore');

const accountSettings = (req, res) => res.render('accountSettings');

module.exports = {
  home,
  play,
  login,
  create,
  explore,
  accountSettings,
};
