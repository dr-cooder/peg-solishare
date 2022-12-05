const { Nav } = require('./components');

const renderNav = (dontShowTitle, dontShowLogin) => {
  const navRootEl = document.getElementById('navRoot');
  const navRoot = ReactDOM.createRoot(navRootEl);
  navRoot.render(<Nav username={navRootEl.dataset.username} dontShowTitle={dontShowTitle} dontShowLogin={dontShowLogin}/>);
};

module.exports = {
  renderNav,
}