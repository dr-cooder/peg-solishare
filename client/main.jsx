const { puzzleToCode } = require('./puzzle.js');
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
  const [hintText, setHintText] = useState();
  const [hintWaiting, setHintWaiting] = useState(false);
  const gameRef = createRef();

  const somethingWentWrong = () => {
    setHintWaiting(false);
    setHintText('Something went wrong...');
  }

  const getHint = async (code) => {
    if (hintWaiting) return null;
    setHintWaiting(true);
    setHintText('Awaiting hint...');
    const { hint, unsolvable, alreadySolved } = await (
      await fetch(`/hint?code=${code}`).catch(somethingWentWrong)
      ).json().catch(somethingWentWrong);
    setHintWaiting(false);
    if (unsolvable) {
      setHintText('Not solvable from this point! Please undo.');
    } else if (alreadySolved) {
      setHintText('This puzzle has already been solved!');
    } else if (hint) {
      setHintText(<>
        {'('}{hint.from.x + 1}, {hint.from.y + 1}{')'} <i className="fa fa-solid fa-arrow-right"></i> {'('}{hint.to.x + 1}, {hint.to.y + 1}{')'}
      </>);
    } else {
      setHintText('Unexpected server response...');
    }
  }

  const handleMove = () => {
    setHintText('');
  }

  return (
    <>
      <div><GameBoardUI ref={gameRef} code={puzzleToCode(samples[props.puzzleName])} onMove={handleMove}/></div>
      <div>The selected puzzle is: {props.puzzleName}</div>
      <button id="hintButton" type="button" className="btn btn-warning" disabled={hintWaiting}
        onClick={() => {
          // Actually get the current code of the game board UI
          getHint(gameRef.current.code());
        }}><i className="fa-regular fa-lightbulb"></i> Hint</button>
      <button id="undoButton" type="button" className="btn btn-secondary" disabled={hintWaiting}
        onClick={() => {
          gameRef.current.undo();
        }}><i className="fa-solid fa-arrow-rotate-left"></i> Undo</button>
      <h3>{hintText}</h3>
    </>
  );
}

const init = () => {
  ReactDOM.createRoot(document.getElementById('app')).render(<GamePage puzzleName="generated2"/>);
}

window.onload = init;
