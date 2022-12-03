const { sendPost } = require('./helpers.js');
const { renderNav } = require('./jsxHelpers.jsx');

const helper = {
  hideError: () => {},
  handleError: (e) => console.log(e),
};

const handleLogin = (e) => {
  e.preventDefault();
  helper.hideError();

  const username = e.target.querySelector('#user').value;
  const pass = e.target.querySelector('#pass').value;
  const _csrf = e.target.querySelector('#_csrf').value;

  if (!username || !pass) {
    helper.handleError('Username or password is empty!');
    return false;
  }

  sendPost(e.target.action, { username, pass, _csrf });

  return false;
};

const handleSignup = (e) => {
  e.preventDefault();
  helper.hideError();

  const username = e.target.querySelector('#user').value;
  const pass = e.target.querySelector('#pass').value;
  const pass2 = e.target.querySelector('#pass2').value;
  const _csrf = e.target.querySelector('#_csrf').value;

  if (!username || !pass || !pass2) {
    helper.handleError('All fields are required!');
    return false;
  }

  if (pass !== pass2) {
    helper.handleError('Passwords do not match!');
    return false;
  }

  sendPost(e.target.action, {
    username, pass, pass2, _csrf,
  });

  return false;
};

const LoginWindow = (props) => {
  return (
    <>
      <h1 className="loginTitle">Log in</h1>
      <form id="loginForm"
        name="loginForm"
        onSubmit={handleLogin}
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
    </>
  );
};

const SignupWindow = (props) => {
  return (
    <>
      <h1 className="loginTitle">Sign up</h1>
      <form id="signupForm"
        name="signupForm"
        onSubmit={handleSignup}
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
