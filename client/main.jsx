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
  const [speedTestMessage, setSpeedTestMessage] = useState();
  const gameRef = createRef();

  const getHint = async (code) => {
    if (hintWaiting) return null;
    setHintWaiting(true);
    setHintText('Awaiting hint...');
    const response = await fetch(`/hint?code=${code}`);
    const { hint, unsolvable, alreadySolved, message } = await response.json();
    setHintWaiting(false);
    if (response.status !== 200) {
      setHintText(message)
    } else if (unsolvable) {
      setHintText('Not solvable from this point! Please undo.');
    } else if (alreadySolved) {
      setHintText('This puzzle has already been solved!');
    } else if (hint) {
      setHintText(<>
        {'('}{hint.from.x + 1}, {hint.from.y + 1}{')'} <i className="fa fa-solid fa-arrow-right"></i> {'('}{hint.to.x + 1}, {hint.to.y + 1}{')'}
      </>);
    } else {
      setHintText('Unexpected server response.');
    }
  }

  const handleMove = () => {
    setHintText('');
  }

  const speedTest = async () => {
    setSpeedTestMessage('Waiting...');
    const response = await fetch(`/speedTest`);
    const { message } = await response.json();
    setSpeedTestMessage(message);
  }

  return (
    <div className="wrapper">
      <h1>Disappearing Act 3</h1>
      <h2>Created by: Rory</h2>
      <GameBoardUI ref={gameRef} disabled={hintWaiting} basis={samples[props.puzzleName]} onMove={handleMove}/>
      <div className="buttonContainer">
        <button id="hintButton" type="button" className="btn btn-warning btn-lg" disabled={hintWaiting}
          onClick={() => {
            getHint(gameRef.current.code());
          }}><i className="fa-regular fa-lightbulb"></i> Hint</button>
        <button id="undoButton" type="button" className="btn btn-secondary btn-lg" disabled={hintWaiting}
          onClick={() => {
            gameRef.current.undo();
          }}><i className="fa-solid fa-arrow-rotate-left"></i> Undo</button>
      </div>
      <h3>{hintText}</h3>
      <div><a href="#" className="link-primary" onClick={speedTest}>Test Heroku speed</a></div>
      <div>{speedTestMessage}</div>
    </div>
  );
}

const init = () => {
  ReactDOM.createRoot(document.getElementById('app')).render(<GamePage puzzleName="disappearingAct3"/>);
}

window.onload = init;
