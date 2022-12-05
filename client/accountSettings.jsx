const { sendPost } = require('./helpers.js');
const { renderNav } = require('./jsxHelpers.jsx');
const { createRef } = React;
const ErrorMessage = require('./ErrorMessage.jsx');

const AccountSettingsContent = (props) => {
  const errorMessageRef = createRef();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    errorMessageRef.current.showSpinner();

    const oldPass = e.target.querySelector('#oldPass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!oldPass || !newPass || !newPass2) {
      errorMessageRef.current.showError('All fields are required!');
      return false;
    }

    if (newPass !== newPass2) {
      errorMessageRef.current.showError('New passwords do not match!');
      return false;
    }

    const { error } = await sendPost(e.target.action, {
      oldPass, newPass, newPass2, _csrf
    });
    if (error) {
      errorMessageRef.current.showError(error);
    } else {
      errorMessageRef.current.showSuccess('Password updated successfully!');
    }
  
    return false;
  }

  return (
    <>
      <h2 className="spacedHeader">Change password</h2>
      <form id="passwordChangeForm"
        name="passwordChangeForm"
        onSubmit={(e) => handlePasswordChange(e)}
        action="/change-password">
        <div className="formTextboxes">
          <label htmlFor="oldPass">Old password: </label>
          <input id="oldPass" type="password" name="oldPass" placeholder="old password" />
          <label htmlFor="newPass">New password: </label>
          <input id="newPass" type="password" name="newPass" placeholder="new password" />
          <label htmlFor="newPass2">Retype new password: </label>
          <input id="newPass2" type="password" name="newPass2" placeholder="retype new password" />
        </div>
        <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
        <div className="buttonContainerFlex">
          <input className="btn btn-primary btn-lg" type="submit" value="Change password" />
        </div>
      </form>
      <ErrorMessage ref={errorMessageRef}/>
    </>
  )
}

const init = async () => {
  renderNav();

  const response = await fetch('/token');
  const data = await response.json();

  const acctSettingsContentRootEl = document.getElementById('acctSettingsContent');
  const acctSettingsContentRoot = ReactDOM.createRoot(acctSettingsContentRootEl);
  acctSettingsContentRoot.render(<AccountSettingsContent csrf={data.csrfToken} />);
};

window.onload = init;
