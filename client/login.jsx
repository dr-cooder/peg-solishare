const { sendPost } = require('./helpers.js');
const { renderNav } = require('./jsxHelpers.jsx');
const { createRef } = React;
const ErrorMessage = require('./ErrorMessage.jsx');

const handleLogin = async (e, errMessage) => {
  e.preventDefault();
  errMessage.clearMessage();

  const username = e.target.querySelector('#user').value;
  const pass = e.target.querySelector('#pass').value;
  const _csrf = e.target.querySelector('#_csrf').value;

  if (!username || !pass) {
    errMessage.showError('Username or password is empty!');
    return false;
  }

  const { error } = await sendPost(e.target.action, { username, pass, _csrf });
  if (error) errMessage.showError(error);

  return false;
};

const handleSignup = async (e, errMessage) => {
  e.preventDefault();
  errMessage.clearMessage();

  const username = e.target.querySelector('#user').value;
  const pass = e.target.querySelector('#pass').value;
  const pass2 = e.target.querySelector('#pass2').value;
  const _csrf = e.target.querySelector('#_csrf').value;

  if (!username || !pass || !pass2) {
    errMessage.showError('All fields are required!');
    return false;
  }

  if (pass !== pass2) {
    errMessage.showError('Passwords do not match!');
    return false;
  }

  const { error } = await sendPost(e.target.action, {
    username, pass, pass2, _csrf,
  });
  if (error) errMessage.showError(error);

  return false;
};

const LoginWindow = (props) => {
  const errorMessageRef = createRef();

  return (
    <>
      <h1 className="spacedHeader">Log in</h1>
      <form id="loginForm"
        name="loginForm"
        onSubmit={(e) => handleLogin(e, errorMessageRef.current)}
        action="/login"
        method="POST"
        className="mainForm"
      >
        <div className="formTextboxes">
          <label htmlFor="username">Username: </label>
          <input id="user" type="text" name="username" placeholder="username" />
          <label htmlFor="pass">Password: </label>
          <input id="pass" type="password" name="pass" placeholder="password" />
        </div>
        <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <div className="buttonContainerFlex">
          <input className="btn btn-primary btn-lg" type="submit" value="Log in" />
        </div>
        <div className="loginSignupSwitch">
          Don't have an account? <a href="#" onClick={props.onSwitch}>Sign up</a>
        </div>
      </form>
      <ErrorMessage ref={errorMessageRef}/>
    </>
  );
};

const SignupWindow = (props) => {
  const errorMessageRef = createRef();

  return (
    <>
      <h1 className="spacedHeader">Sign up</h1>
      <form id="signupForm"
        name="signupForm"
        onSubmit={(e) => handleSignup(e, errorMessageRef.current)}
        action="/signup"
        method="POST"
        className="mainForm"
      >
        <div className="formTextboxes">
          <label htmlFor="username">Username: </label>
          <input id="user" type="text" name="username" placeholder="username" />
          <label htmlFor="pass">Password: </label>
          <input id="pass" type="password" name="pass" placeholder="password" />
          <label htmlFor="pass2">Retype password: </label>
          <input id="pass2" type="password" name="pass2" placeholder="retype password" />
        </div>
        <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <div className="buttonContainerFlex">
          <input className="btn btn-primary btn-lg" type="submit" value="Sign up" />
        </div>
        <div className="loginSignupSwitch">
          Already have an account? <a href="#" onClick={props.onSwitch}>Log in</a>
        </div>
      </form>
      <ErrorMessage ref={errorMessageRef}/>
    </>
  );
};

const init = async () => {
  const response = await fetch('/token');
  const data = await response.json();

  renderNav(false, true);

  const loginContentRootEl = document.getElementById('loginContentRoot');
  const { initial } = loginContentRootEl.dataset;
  const loginContentRoot = ReactDOM.createRoot(loginContentRootEl);

  const showWindow = (signup) => {
    if (signup) {
      document.title = 'Sign up - Peg SoliShare';
      loginContentRoot.render(<SignupWindow csrf={data.csrfToken} onSwitch={() => showWindow(false)}/>);
    } else {
      document.title = 'Login - Peg SoliShare';
      loginContentRoot.render(<LoginWindow csrf={data.csrfToken} onSwitch={() => showWindow(true)}/>);
    }
  }

  showWindow(initial === 'signup');
};

window.onload = init;
