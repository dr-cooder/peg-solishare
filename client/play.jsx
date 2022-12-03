const GameBoardUI = require('./GameBoardUI.jsx');
const ErrorMessage = require('./ErrorMessage.jsx');
const { useState, createRef, useRef } = React;

const PlayUI = (props) => {
  const [undoHighlighted, setUndoHighlighted] = useState(false);
  const [hintWaiting, setHintWaiting] = useState(false);
  const [hintIsOnDisplay, setHintIsOnDisplay] = useState(false);
  const [hintCount, setHintCount] = useState(5);
  const gameRef = createRef();
  const errorMessageRef = useRef();

  const getHint = async (gameRefCurrent, errorMessageRefCurrent) => {
    const code = gameRefCurrent.code();
    if (hintWaiting) return null;
    setHintWaiting(true);
    // setHintText(<><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div> Finding hint...</>);
    const response = await fetch(`/hint?code=${code}`);
    const { hint, unsolvable, alreadySolved, message } = await response.json();
    setHintWaiting(false);
    if (response.status !== 200) {
      errorMessageRefCurrent.showError(message);
    } else if (unsolvable) {
      setUndoHighlighted(true);
      setHintIsOnDisplay(true);
      setHintCount(hintCount - 1);
      if (hintCount < 0) setHintCount(0);
      errorMessageRefCurrent.clearMessage();
    } else if (alreadySolved) {
      errorMessageRefCurrent.showError('This puzzle has already been solved!');
    } else if (hint) {
      gameRefCurrent.displayHint(hint);
      setHintIsOnDisplay(true);
      setHintCount(hintCount - 1);
      if (hintCount < 0) setHintCount(0);
      errorMessageRefCurrent.clearMessage();
    } else {
      errorMessageRefCurrent.showError('Unexpected server response.');
    }
  }

  const handleMove = (errorMessageRefCurrent) => {
    errorMessageRefCurrent.clearMessage();
    setUndoHighlighted(false);
    setHintIsOnDisplay(false);
  }

  return (
    <>
      <GameBoardUI ref={gameRef} disabled={hintWaiting} basis={props.code} onMove={() => handleMove(errorMessageRef.current)}/>
      <div className="buttonContainerFlex buttonContainerHoriz">
        <button id="hintButton" type="button" className="btn btn-warning btn-lg" disabled={hintIsOnDisplay || hintWaiting}
          onClick={() => getHint(gameRef.current, errorMessageRef.current)}>
            {hintWaiting ?
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              :
              <i className={hintIsOnDisplay ? `fa-solid fa-arrow-${undoHighlighted ? 'right' : 'up'}` : 'fa-regular fa-lightbulb'}></i>
            } Hints: {hintCount}
        </button>
        <button id="undoButton" type="button" className={`btn btn-secondary btn-lg ${undoHighlighted ? 'undoButtonHighlighted' : ''}`} disabled={hintWaiting}
          onClick={() => gameRef.current.undo()}><i className="fa-solid fa-arrow-rotate-left"></i> Undo</button>
      </div>
      <div>
        <a href="#" id="hintPurchaseLink" onClick={() => {setHintCount(hintCount + 5)}}>Buy more hints</a>
      </div>
      <ErrorMessage ref={errorMessageRef}/>
    </>
  );
}

const init = () => {
  const playUiRootEl = document.getElementById('playUiRoot');
  const playUiRoot = ReactDOM.createRoot(playUiRootEl);
  playUiRoot.render(<PlayUI code={playUiRootEl.dataset.code} />);
}

window.onload = init;
