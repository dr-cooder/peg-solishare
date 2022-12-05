const { sendPost } = require('../common/helpers.js');
const GameBoardUI = require('./GameBoardUI.jsx');
const ErrorMessage = require('./ErrorMessage.jsx');
const { useState, createRef } = React;

const CreateUI = (props) => {
  const editModes = [
    {
      value: 'toggleBalls',
      name: 'Toggle balls manually',
    },
    {
      value: 'solveReverse',
      name: 'Solve in reverse',
    },
  ]
  const editModeDefault = editModes[0].value;
  const [currentEditMode, setCurrentEditMode] = useState(editModeDefault);
  const [uploadWaiting, setUploadWaiting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const gameRef = createRef();
  const nameInputRef = createRef();
  const errorMessageRef = createRef();
  const starterCode = `${'0'.repeat(16)}1${'0'.repeat(16)}`; // One ball in the middle
  const editModeRadioChanged = (e) => {
    gameRef.current.editMode = e;
    setCurrentEditMode(e);
  }

  const handleUpload = async () => {
    setUploadWaiting(true);
    const errorMessageRefCurrent = errorMessageRef.current;
    errorMessageRefCurrent.clearMessage();
    const {error} = await sendPost('/upload', {
      title: nameInputRef.current.value,
      code: gameRef.current.code(),
      _csrf: props.csrf,
    });
    if (error) {
      errorMessageRefCurrent.showError(error);
    } else {
      errorMessageRefCurrent.showSuccess('Puzzle uploaded!', 'Go to puzzle explorer', '/explore');
      setUploadSuccess(true);
    }
    setUploadWaiting(false);
  }

  return (
    <>
      <GameBoardUI ref={gameRef} disabled={uploadWaiting || uploadSuccess} basis={starterCode} editMode={editModeDefault}/>
      <h3>Edit mode</h3>
      <div className="editModeContainer">
        {editModes.map((e, i) => {
          return (
            <div className="form-check" key={i}>
              {/* https://stackoverflow.com/questions/45592277/radio-button-not-working */}
              <input className="form-check-input" type="radio" name="editMode" disabled={uploadWaiting || uploadSuccess}
                checked={currentEditMode === e.value} onChange={() => editModeRadioChanged(e.value)} />
              <label htmlFor="toggleBall">{e.name}</label>
            </div>
          )
        })}
      </div>
      <div className="buttonContainerFlex buttonContainerVert">
        <button id="undoButton" type="button" className={"btn btn-secondary btn-lg"} disabled={uploadWaiting || uploadSuccess}
          onClick={() => gameRef.current.undo()}><i className="fa-solid fa-arrow-rotate-left"></i> Undo</button>
        <h3 className="spacedHeader">Name and upload</h3>
        <input type="text" ref={nameInputRef} disabled={uploadWaiting || uploadSuccess}/>
        <button type="button" className="btn btn-success btn-lg" disabled={uploadWaiting || uploadSuccess}
          onClick={handleUpload}>
            {uploadWaiting ?
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              :
              <i className={`fa-solid fa-${uploadSuccess ? 'check' : 'upload'}`}></i>
            }
            {uploadSuccess ?
              ' Uploaded'
              :
              ' Upload'
            }
        </button>
      </div>
      <ErrorMessage ref={errorMessageRef}/>
    </>
  );
}

const init = async () => {
  const response = await fetch('/token');
  const data = await response.json();

  const createUiRoot = ReactDOM.createRoot(document.getElementById('createUiRoot'));
  createUiRoot.render(<CreateUI csrf={data.csrfToken}/>);
}

window.onload = init;
