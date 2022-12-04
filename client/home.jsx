const { renderNav } = require('./jsxHelpers.jsx');

const HeroButtons = (props) => {
  return (
    <>
      {props.signedIn ?
        <div className={'buttonContainerFlex buttonContainerHoriz'}>
          <a href="/explore" className="btn btn-success btn-xl"><i className="fa-solid fa-puzzle-piece"></i> Play</a>
          <a href="/create" className="btn btn-warning btn-xl"><i className="fa-solid fa-pen-to-square"></i> Create</a>
        </div>
        :
        <>
          <div className="buttonContainerFlex">
            <a href="/login?signup" className="btn btn-primary btn-xl">Get started</a>
          </div>
          <div className="loginSignupSwitch">
            Already have an account? <a href="/login">Log in</a>
          </div>
        </>
      }
    </>
  )
};

const init = () => {
  const heroBtnRootEl = document.getElementById('heroBtnRoot');
  const signedIn = Boolean(heroBtnRootEl.dataset.username);
  renderNav(true, !signedIn);
  const heroBtnRoot = ReactDOM.createRoot(heroBtnRootEl);
  heroBtnRoot.render(<HeroButtons signedIn={signedIn}/>);
};

window.onload = init;
