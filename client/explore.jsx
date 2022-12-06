const { renderNav } = require('./jsxHelpers.jsx');
const {
  defaultCodeBase,
  convertCodeBase,
  emptyBoard,
  width,
  height,
} = require('../common/puzzle.js');

const emptyBoardInstance = emptyBoard();
const PuzzleThumbnail = (props) => {
  // Represent puzzle as a CSS grid
  const { binCode } = props;
  let i = 0;
  const spaceEls = [];
  for (let v = 0; v < height; v++) {
    for (let u = 0; u < width; u++) {
      const space = emptyBoardInstance[v][u];
      spaceEls.push(
        <div key={v * width + u} className="ratio1x1">
          <div className={`ratioContainer${space !== 2 && ' puzzleThumbSlot'}`}>
            {binCode.charAt(i) === '1' && <div className="puzzleThumbBall"></div>}
          </div>
        </div>
      )
      if (space !== 2) i++;
    }
  }

  return (
    <div className="puzzleThumbGrid">
      {spaceEls}
    </div>
  )
}

const PuzzleList = (props) => {
  if (props.puzzles.length === 0) {
    // No puzzles found in database
    // https://youtu.be/yD2FSwTy2lw
    return (
      <h3 className="noPuzzles">No one's around to help. &#x1F63C;</h3>
    );
  }

  // Make a list of "tiles", each representing and linking to a puzzle
  const puzzleNodes = props.puzzles.map(puzzle => {
    return (
      <a href={`/play?code=${puzzle.code}&by=${puzzle.creatorName}`} key={puzzle._id} className="puzzleTile">
        <PuzzleThumbnail binCode={convertCodeBase(puzzle.code, defaultCodeBase, 2)}/>
        <div className="puzzleTileTitle">{puzzle.title}</div>
        <div>By {puzzle.creatorName}</div>
      </a>
    )
  });

  return (
    <div className="puzzleList">
      {puzzleNodes}
    </div>
  );
};

// Load puzzles from server and display them on the page via PuzzleList component
const loadPuzzlesFromServer = async (puzzleListRoot, _csrf) => {
  const response = await fetch('/get-puzzles');
  const data = await response.json();

  puzzleListRoot.render(<PuzzleList csrf={_csrf} puzzles={data.puzzles} />);
}

const init = async () => {
  const response = await fetch('/token');
  const data = await response.json();
  const _csrf = data.csrfToken;

  const puzzleListRootEl = document.getElementById('puzzleListRoot');
  const puzzleListRoot = ReactDOM.createRoot(puzzleListRootEl);

  renderNav();

  loadPuzzlesFromServer(puzzleListRoot, _csrf);
};

window.onload = init;
