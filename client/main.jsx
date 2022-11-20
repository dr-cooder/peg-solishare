const Game = require('./Game.js');
const GameBoardUI = require('./GameBoardUI.jsx');

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

const SolveUI = (props) => {
  const [status, setStatus] = React.useState();
  const [stepNodes, setStepNodes] = React.useState();
  const [solving, setSolving] = React.useState(false);

  const somethingWentWrong = () => {
    setSolving(false);
    setStatus('Something went wrong...');
  }

  const getSolution = async (code) => {
    if (solving) return null;
    setSolving(true);
    setStatus('Calculating solution...');
    const { solution } = await (
      await fetch(`/solve?code=${code}`).catch(somethingWentWrong)
      ).json().catch(somethingWentWrong);
    setSolving(false);
    setStatus('Solution found!');
    setStepNodes(solution.map((step, index) => {
      return (
        <li key={index}>
          {'('}{step.from.x + 1}, {step.from.y + 1}{')'} <i className="fa fa-solid fa-arrow-right"></i> {'('}{step.to.x + 1}, {step.to.y + 1}{')'}
        </li>
      );
    }));
  }

  return (
    <>
      <div><GameBoardUI /></div>
      <div>The selected puzzle is: {props.puzzleName}</div>
      <button id="solveButton" type="button" className="btn btn-primary" disabled={solving}
        onClick={() => {
          const code = new Game(samples[props.puzzleName]).code();
          getSolution(code);//.catch(somethingWentWrong);
        }}>Solve!</button>
      <h3>{status}</h3>
      <ol id="steps">{stepNodes}</ol>
    </>
  );
}

const init = () => {
  ReactDOM.createRoot(document.getElementById('app')).render(<SolveUI puzzleName="generated2"/>);
}

window.onload = init;
