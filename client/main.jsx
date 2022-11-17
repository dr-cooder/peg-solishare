const Configuration = require('./Configuration.js');

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
          {'('}{step.from.x}, {step.from.y}{')'} <i className="fa fa-solid fa-arrow-right"></i> {'('}{step.to.x}, {step.to.y}{')'}
        </li>
      );
    }));
  }

  return (
    <>
      <button id="solveButton" type="button" className="btn btn-primary" disabled={solving}
        onClick={() => {
          const code = new Configuration(samples[props.puzzleName]).code();
          getSolution(code);//.catch(somethingWentWrong);
        }}>Solve!</button>
      <h3>{status}</h3>
      <ol id="steps">{stepNodes}</ol>
    </>
  );
}

const init = () => {
  ReactDOM.createRoot(document.getElementById('solveUIContainer')).render(<SolveUI puzzleName="disappearingAct1"/>);
}

window.onload = init;
