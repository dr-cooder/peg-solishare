const {
  Component,
  createRef,
} = React;
const {
  distanceNoSqrt,
  loadImage,
} = require('../../common/helpers.js');
const Game = require('../../common/Game.js');
const {
  emptyBoard,
  width,
  height,
  defaultCodeBase,
  validateMoveStruct,
} = require('../../common/puzzle.js');

class GameBoardUI extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      holdingBall: false,
      noCanvas: false,
    };

    this.canvasRef = createRef();
    this.canvasOuterRef = createRef();
    this.game = new Game(props.basis);

    this.code = (base = defaultCodeBase) => this.game.code(base);
    this.history = () => this.game.moveHistory;

    this.editMode = props.editMode;

    this.onMove = props.onMove || (() => {});
    this.onSolve = props.onSolve || (() => {});
    this.onNoCanvas = props.onNoCanvas || (() => {});
    this.undo = () => {
      this.game.undo(this.editMode); // Any moves in the editor are in reverse
      this.hintOnDisplay = null;
      this.onMove();
    };

    this.hintOnDisplay = null;
    this.displayHint = (hint) => {
      if (validateMoveStruct(hint)) this.hintOnDisplay = hint;
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.disabled !== state.disabled) {
      return {
        disabled: props.disabled,
        holdingBall: props.disabled ? false : state.holdingBall,
      };
    }
    return null;
  }

  componentDidMount() {
    // https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
    const canvasEl = this.canvasRef.current;
    // https://stackoverflow.com/questions/2745432/best-way-to-detect-that-html5-canvas-is-not-supported
    if (!(canvasEl.getContext && canvasEl.getContext('2d'))) {
      this.setState({ noCanvas: true });
      this.onNoCanvas();
      return;
    }
    const canvasWidth = canvasEl.width;
    const canvasHeight = canvasEl.height;
    const canvasOuterEl = this.canvasOuterRef.current;
    const ctx = canvasEl.getContext('2d');

    // Establish some constants in pixels and grid units
    const gridTop = 109;
    const gridLeft = 109;
    const gridWidth = 382;
    const gridHeight = 382;
    const spaceWidth = gridWidth / width;
    const spaceHeight = gridHeight / height;
    const ballRadius = 20;
    const ballRadiusSquared = ballRadius * ballRadius;
    const ballImgWidth = 52;
    const ballImgHeight = 52;
    const ballImgCenterX = ballImgWidth / 2;
    const ballImgCenterY = ballImgHeight / 2;

    // Find the center x and y coordinates each slot represents
    const emptyBoardRef = emptyBoard();
    const slots = [];
    for (let v = 0; v < height; v++) {
      const thisRow = [];
      const thisRowY = spaceHeight * (v + 0.5) + gridTop;
      // const thisRowTop = spaceHeight * v + gridTop;
      for (let u = 0; u < width; u++) {
        if (emptyBoardRef[v][u] !== 2) {
          thisRow[u] = {
            x: spaceWidth * (u + 0.5) + gridLeft,
            y: thisRowY,
            // left: spaceWidth * u + gridLeft,
            // top: thisRowTop
          };
        }
      }
      slots[v] = thisRow;
    }

    // Establish image assets that will be needed
    const imgFilenames = {
      board: 'board.png',
      ball: 'ball.png',
      ballShadow: 'ball-shadow.png',
    };
    const imgFilenameKvps = Object.entries(imgFilenames);
    const imageCount = imgFilenameKvps.length;
    const imgs = {};

    // Get where the mouse is in the space of the canvas (taking location and scale into account)
    let mouseX = canvasWidth / 2;
    let mouseY = canvasHeight / 2;
    const updateMouse = (e) => {
      if (!e) return;

      let rawX;
      let rawY;

      // Account for touch screens, read as if mouse
      const inputType = e.type.slice(0, 5);
      if (inputType === 'touch') {
        rawX = e.touches[0].pageX;
        rawY = e.touches[0].pageY;
      } else if (inputType === 'mouse') {
        rawX = e.pageX;
        rawY = e.pageY;
      }

      mouseX = (rawX - canvasOuterEl.offsetLeft)
        * (canvasEl.width / canvasOuterEl.offsetWidth);
      mouseY = (rawY - canvasOuterEl.offsetTop)
        * (canvasEl.height / canvasOuterEl.offsetHeight);
    };

    let mouseGridX = Math.floor(width / 2);
    let mouseGridY = Math.floor(height / 2);
    const updateMouseGrid = (e) => {
      updateMouse(e);
      mouseGridX = Math.floor((mouseX - gridLeft) / spaceWidth);
      mouseGridY = Math.floor((mouseY - gridTop) / spaceHeight);
    };

    // Handle moves
    let tempMoveX = 0;
    let tempMoveY = 0;
    const moveMadeCallback = () => {
      this.hintOnDisplay = null;
      this.onMove();
      if (this.game.countBalls() === 1) this.onSolve();
    }
    const mouseDownHandler = (e) => {
      if (this.state.disabled) return;
      // Ensure the user clicked on a valid grid location
      updateMouseGrid(e);
      const clickedRow = this.game.puzzle[mouseGridY];
      if (clickedRow) {
        const clickedSpaceValue = clickedRow[mouseGridX];
        if (typeof clickedSpaceValue !== 'undefined') {
          const thisSlot = slots[mouseGridY][mouseGridX];
          if (distanceNoSqrt(mouseX, mouseY, thisSlot.x, thisSlot.y) < ballRadiusSquared) {
            // Handle move (or start of move) according to input mode
            if (this.editMode === 'toggleBalls') {
              if (this.game.toggleBall(mouseGridX, mouseGridY)) moveMadeCallback();
            } else {
              if (clickedSpaceValue === 1) {
                this.setState({ holdingBall: true });
                tempMoveX = mouseGridX;
                tempMoveY = mouseGridY;
              }
            }
          }
        }
      }
    };
    const mouseUpHandler = (e) => {
      // If in toggle balls mode this shouldn't do anything
      if (this.state.disabled || !this.state.holdingBall || this.editMode === 'toggleBalls') return;
      this.setState({ holdingBall: false });
      updateMouseGrid(e);
      const newMove = {
        from: {
          x: tempMoveX,
          y: tempMoveY,
        },
        to: {
          x: mouseGridX,
          y: mouseGridY,
        },
      };
      let moveMade;
      // If moving in reverse, the inputted "from" and "to" switch roles
      if (this.editMode === 'solveReverse') {
        moveMade = this.game.makeMove({
          from: newMove.to,
          to: newMove.from,
        }, true);
      } else {
        moveMade = this.game.makeMove(newMove);
      }
      // Leave determining whether the move was valid up to the Game class
      if (moveMade) moveMadeCallback();
    };

    canvasOuterEl.onmousedown = mouseDownHandler;
    canvasOuterEl.onmousemove = updateMouse;
    canvasOuterEl.onmouseup = mouseUpHandler;
    canvasOuterEl.onmouseout = mouseUpHandler;

    canvasOuterEl.ontouchstart = mouseDownHandler;
    canvasOuterEl.ontouchmove = updateMouse;
    canvasOuterEl.ontouchend = mouseUpHandler;
    canvasOuterEl.ontouchcancel = mouseUpHandler;

    const loop = () => {
      requestAnimationFrame(loop);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(imgs.board, 0, 0, canvasWidth, canvasHeight);

      for (let v = 0; v < height; v++) {
        for (let u = 0; u < width; u++) {
          const thisSlot = slots[v][u];
          if (thisSlot) {
            if (this.game.puzzle[v][u] === 1
              && !(this.state.holdingBall && u === tempMoveX && v === tempMoveY)) {
              ctx.drawImage(imgs.ballShadow, thisSlot.x - ballImgCenterX, thisSlot.y - ballImgCenterY, ballImgWidth, ballImgHeight);
            }
          }
        }
      }

      if (this.hintOnDisplay) {
        // Draw an arrow indicating the hint move
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';

        const thisHintFrom = this.hintOnDisplay.from;
        const fromSlot = slots[thisHintFrom.y][thisHintFrom.x];
        const fromSlotX = fromSlot.x;
        const fromSlotY = fromSlot.y;

        const thisHintTo = this.hintOnDisplay.to;
        const toSlot = slots[thisHintTo.y][thisHintTo.x];
        const toSlotX = toSlot.x;
        const toSlotY = toSlot.y;

        const slotDeltaX = toSlotX - fromSlotX;
        const slotDeltaY = toSlotY - fromSlotY;
        // Arrow point base is perpendicular to line
        const pointBottomX = fromSlotX + slotDeltaX * 0.75;
        const pointBottomY = fromSlotY + slotDeltaY * 0.75;
        const pointCornerX = slotDeltaY * 0.05;
        const pointCornerY = slotDeltaX * 0.05;

        ctx.beginPath();
        ctx.moveTo(fromSlotX + slotDeltaX * 0.25, fromSlotY + slotDeltaY * 0.25);
        ctx.lineTo(pointBottomX, pointBottomY);
        ctx.lineTo(pointBottomX + pointCornerX, pointBottomY + pointCornerY);
        ctx.lineTo(fromSlotX + slotDeltaX * 0.85, fromSlotY + slotDeltaY * 0.85);
        ctx.lineTo(pointBottomX - pointCornerX, pointBottomY - pointCornerY);
        ctx.lineTo(pointBottomX, pointBottomY);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      }

      // Draw the ball the user is holding above all else
      if (this.state.holdingBall) {
        ctx.drawImage(imgs.ball, mouseX - ballImgCenterX, mouseY - ballImgCenterY, ballImgWidth, ballImgHeight);
      }
    };

    // Load all image assets then start!
    const imgPromises = [];
    for (let i = 0; i < imageCount; i++) {
      imgPromises[i] = loadImage(`assets/img/${imgFilenameKvps[i][1]}`)
    }
    Promise.all(imgPromises).then((loadedImages) => {
      for (let i = 0; i < imageCount; i++) {
        imgs[imgFilenameKvps[i][0]] = loadedImages[i];
      }
      loop();
    })
  }

  render() {
    return (
      <div ref={this.canvasOuterRef} className="gameBoardCanvasOuter">
        <div className="ratio1x1">
          <div className="ratioContainer">
            {this.state.noCanvas?
              <div className="gameBoardNoCanvas">
                <h3>Canvas support is required by Peg SoliShare! Please use a newer browser!</h3>
              </div>
              :
              <canvas ref={this.canvasRef} className="gameBoardCanvas" width="600" height="600"/>
            }
          </div>
        </div>
      </div>
    );
  }
}

module.exports = GameBoardUI;
