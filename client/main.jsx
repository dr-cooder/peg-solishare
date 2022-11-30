const GameBoardUI = require('./GameBoardUI.jsx');
const { useState, createRef } = React;

const samples = {
  disappearingAct1: [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 1, 0, 2, 2]),
    new Uint8Array([0, 0, 1, 1, 1, 0, 0]),
    new Uint8Array([0, 0, 0, 1, 0, 0, 0]),
    new Uint8Array([0, 0, 0, 1, 0, 0, 0]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ],
  disappearingAct2: [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 1, 0, 2, 2]),
    new Uint8Array([0, 0, 0, 1, 0, 0, 0]),
    new Uint8Array([0, 1, 1, 1, 1, 1, 0]),
    new Uint8Array([0, 0, 0, 1, 0, 0, 0]),
    new Uint8Array([2, 2, 0, 1, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ],
  disappearingAct3: [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 1, 0, 2, 2]),
    new Uint8Array([0, 0, 1, 1, 1, 0, 0]),
    new Uint8Array([0, 1, 1, 1, 1, 1, 0]),
    new Uint8Array([1, 1, 1, 1, 1, 1, 1]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ],
  spaceInvader: [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 1, 0, 2, 2]),
    new Uint8Array([0, 0, 1, 1, 1, 0, 0]),
    new Uint8Array([0, 1, 0, 1, 0, 1, 0]),
    new Uint8Array([1, 1, 0, 1, 0, 1, 1]),
    new Uint8Array([2, 2, 1, 0, 1, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ],
  puroMask: [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 1, 0, 2, 2]),
    new Uint8Array([0, 0, 1, 1, 1, 0, 0]),
    new Uint8Array([0, 1, 0, 1, 0, 1, 0]),
    new Uint8Array([0, 0, 1, 1, 1, 0, 0]),
    new Uint8Array([2, 2, 1, 0, 1, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ],
  disappearingAct4: [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([0, 0, 0, 0, 0, 0, 0]),
    new Uint8Array([0, 0, 1, 0, 1, 0, 0]),
    new Uint8Array([0, 0, 1, 1, 1, 0, 0]),
    new Uint8Array([2, 2, 1, 1, 1, 2, 2]),
    new Uint8Array([2, 2, 1, 1, 1, 2, 2]),
  ],
  generated: [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 1, 0, 2, 2]),
    new Uint8Array([0, 0, 1, 1, 0, 0, 0]),
    new Uint8Array([1, 1, 1, 1, 0, 0, 0]),
    new Uint8Array([1, 1, 0, 0, 0, 0, 0]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ],
  generated2: [
    new Uint8Array([2, 2, 0, 0, 1, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([0, 1, 1, 0, 1, 1, 0]),
    new Uint8Array([0, 0, 1, 1, 1, 1, 0]),
    new Uint8Array([1, 1, 1, 0, 0, 0, 0]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ],
  baseGame: [
    new Uint8Array([2, 2, 1, 1, 1, 2, 2]),
    new Uint8Array([2, 2, 1, 1, 1, 2, 2]),
    new Uint8Array([1, 1, 1, 1, 1, 1, 1]),
    new Uint8Array([1, 1, 1, 0, 1, 1, 1]),
    new Uint8Array([1, 1, 1, 1, 1, 1, 1]),
    new Uint8Array([2, 2, 1, 1, 1, 2, 2]),
    new Uint8Array([2, 2, 1, 1, 1, 2, 2]),
  ],
};

const GamePage = (props) => {
  const [errorMessage, setErrorMessage] = useState();
  const [undoHighlighted, setUndoHighlighted] = useState(false);
  const [hintWaiting, setHintWaiting] = useState(false);
  const [hintIsOnDisplay, setHintIsOnDisplay] = useState(false);
  const gameRef = createRef();

  const getHint = async (gameRefCurrent) => {
    const code = gameRefCurrent.code();
    if (hintWaiting) return null;
    setHintWaiting(true);
    // setHintText(<><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div> Finding hint...</>);
    const response = await fetch(`/hint?code=${code}`);
    const { hint, unsolvable, alreadySolved, message } = await response.json();
    setHintWaiting(false);
    if (response.status !== 200) {
      setErrorMessage(message)
    } else if (unsolvable) {
      setUndoHighlighted(true);
      setHintIsOnDisplay(true);
    } else if (alreadySolved) {
      setErrorMessage('This puzzle has already been solved!');
    } else if (hint) {
      gameRefCurrent.displayHint(hint);
      setHintIsOnDisplay(true);
    } else {
      setErrorMessage('Unexpected server response.');
    }
  }

  const handleMove = () => {
    setErrorMessage('');
    setUndoHighlighted(false);
    setHintIsOnDisplay(false);
  }

  return (
    <div className="wrapper">
      <h1>Disappearing Act 3</h1>
      <h2>Created by: Rory</h2>
      <GameBoardUI ref={gameRef} disabled={hintWaiting} basis={samples[props.puzzleName]} onMove={handleMove}/>
      <div className="buttonContainer">
        <button id="hintButton" type="button" className="btn btn-warning btn-lg" disabled={hintIsOnDisplay || hintWaiting}
          onClick={() => {
            getHint(gameRef.current);
          }}>
            {hintWaiting ?
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              :
              <i className={hintIsOnDisplay ? `fa-solid fa-arrow-${undoHighlighted ? 'right' : 'up'}` : 'fa-regular fa-lightbulb'}></i>
            } Hint
        </button>
        <button id="undoButton" type="button" className={`btn btn-secondary btn-lg ${undoHighlighted ? 'undoButtonHighlighted' : ''}`} disabled={hintWaiting}
          onClick={() => {
            gameRef.current.undo();
          }}><i className="fa-solid fa-arrow-rotate-left"></i> Undo</button>
      </div>
      <h3>{errorMessage}</h3>
    </div>
  );
}

const init = () => {
  ReactDOM.createRoot(document.getElementById('app')).render(<GamePage puzzleName="disappearingAct3"/>);
}

window.onload = init;
