const GameBoardUI = require('./GameBoardUI.jsx');
const { useState, createRef } = React;

const CreateUI = () => {
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
  const gameRef = createRef();
  const nameInputRef = createRef();
  const starterCode = `${'0'.repeat(16)}1${'0'.repeat(16)}`; // One ball in the middle
  const editModeRadioChanged = (e) => {
    gameRef.current.editMode = e;
    setCurrentEditMode(e);
  }

  return (
    <>
      <GameBoardUI ref={gameRef} basis={starterCode} editMode={editModeDefault}/>
      <h3>Edit mode</h3>
      <div className="editModeContainer">
        {editModes.map((e, i) => {
          return (
            <div className="form-check" key={i}>
              {/* https://stackoverflow.com/questions/45592277/radio-button-not-working */}
              <input className="form-check-input" type="radio" name="editMode" checked={currentEditMode === e.value} onChange={() => editModeRadioChanged(e.value)} />
              <label htmlFor="toggleBall">{e.name}</label>
            </div>
          )
        })}
      </div>
      <div className="buttonContainerFlex buttonContainerVert">
        <button id="undoButton" type="button" className={"btn btn-secondary btn-lg"}
          onClick={() => gameRef.current.undo()}><i className="fa-solid fa-arrow-rotate-left"></i> Undo</button>
        <h3 className="spacedHeader">Name and upload</h3>
        <input type="text" ref={nameInputRef}/>
        <button type="button" className="btn btn-success btn-lg"
          onClick={() => console.log(gameRef.current.code(), nameInputRef.current.value)}><i className="fa-solid fa-upload"></i> Upload</button>
      </div>
    </>
  );
}

const init = () => {
  const createUiRoot = ReactDOM.createRoot(document.getElementById('createUiRoot'));
  createUiRoot.render(<CreateUI/>);
}

window.onload = init;
