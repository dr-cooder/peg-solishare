const GameBoardUI = require('./GameBoardUI.jsx');
const ErrorMessage = require('./ErrorMessage.jsx');
const { useState, useRef } = React;
const { sendPost } = require('../common/helpers.js');

const PlayUI = (props) => {
  const [undoHighlighted, setUndoHighlighted] = useState(false);
  const [hintWaiting, setHintWaiting] = useState(false);
  const [buyHintWaiting, setBuyHintWaiting] = useState(false);
  const [hintIsOnDisplay, setHintIsOnDisplay] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [hintCount, setHintCount] = useState(props.startingHintBalance);
  const gameRef = useRef();
  const errorMessageRef = useRef();

  const getHint = async (gameRefCurrent, errorMessageRefCurrent) => {
    const code = gameRefCurrent.code();
    if (hintWaiting || buyHintWaiting) return null;
    setHintWaiting(true);
    const response = await fetch(`/hint?code=${code}`);
    const { hint, unsolvable, alreadySolved, error, updatedBalance } = await response.json();
    if (typeof updatedBalance === 'number') setHintCount(updatedBalance);
    setHintWaiting(false);
    if (response.status !== 200) {
      errorMessageRefCurrent.showError(error);
    } else if (unsolvable) {
      setUndoHighlighted(true);
      setHintIsOnDisplay(true);
      errorMessageRefCurrent.clearMessage();
    } else if (alreadySolved) {
      errorMessageRefCurrent.showError('This puzzle has already been solved!');
    } else if (hint) {
      gameRefCurrent.displayHint(hint);
      setHintIsOnDisplay(true);
      errorMessageRefCurrent.clearMessage();
    } else {
      errorMessageRefCurrent.showError('Unexpected server response.');
    }
  }

  const buyHints = async (howMany) => {
    if (hintWaiting || buyHintWaiting) return null;
    setBuyHintWaiting(true);
    const { updatedBalance } = await sendPost('/buy-hints', {
      howMany,
      _csrf: props.csrf,
    });
    if (typeof updatedBalance === 'number') setHintCount(updatedBalance);
    setBuyHintWaiting(false);
  }

  const handleMove = (errorMessageRefCurrent) => {
    errorMessageRefCurrent.clearMessage();
    setUndoHighlighted(false);
    setHintIsOnDisplay(false);
  }

  const submitSolution = async (gameRefCurrent, errorMessageRefCurrent) => {
    setPuzzleSolved(true);
    errorMessageRefCurrent.showSpinner();
    const { error } = await sendPost('/solved', {
      code: props.code,
      solution: gameRefCurrent.history(),
      _csrf: props.csrf,
    });
    if (error) {
      errorMessageRefCurrent.showError(error);
    } else {
      errorMessageRefCurrent.showSuccess('Congratulations!', 'Return to puzzle explorer', '/explore');
    }
  }

  return (
    <>
      <GameBoardUI ref={gameRef} disabled={hintWaiting || puzzleSolved} basis={props.code}
        onMove={() => handleMove(errorMessageRef.current)} onSolve={() => submitSolution(gameRef.current, errorMessageRef.current)}/>
      <div className="buttonContainerFlex buttonContainerHoriz">
        <button id="hintButton" type="button" className="btn btn-warning btn-lg" disabled={hintIsOnDisplay || hintWaiting || buyHintWaiting || puzzleSolved}
          onClick={() => getHint(gameRef.current, errorMessageRef.current)}>
            {hintWaiting ?
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              :
              <i className={hintIsOnDisplay ? `fa-solid fa-arrow-${undoHighlighted ? 'right' : 'up'}` : 'fa-regular fa-lightbulb'}></i>
            } Hints: {hintCount}
        </button>
        <button id="undoButton" type="button" className={`btn btn-secondary btn-lg ${undoHighlighted ? 'undoButtonHighlighted' : ''}`} disabled={hintWaiting || puzzleSolved}
          onClick={() => gameRef.current.undo()}><i className="fa-solid fa-arrow-rotate-left"></i> Undo</button>
      </div>
      <div>
        <button className="btn btn-outline-warning btn-lg hintPurchaseBtn" disabled={hintWaiting || buyHintWaiting || puzzleSolved}
          onClick={() => buyHints(5, errorMessageRef.current)}>
            {buyHintWaiting ?
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              :
              <i className='fa-regular fa-credit-card'></i>
            } Buy more hints
        </button>
      </div>
      <ErrorMessage ref={errorMessageRef}/>
    </>
  );
}

const init = async () => {
  const response = await fetch('/token');
  const data = await response.json();

  const playUiRootEl = document.getElementById('playUiRoot');
  const playUiRoot = ReactDOM.createRoot(playUiRootEl);
  playUiRoot.render(<PlayUI
    code={playUiRootEl.dataset.code}
    startingHintBalance={parseInt(playUiRootEl.dataset.startingHintBalance, 10)}
    csrf={data.csrfToken}
  />);
}

window.onload = init;
