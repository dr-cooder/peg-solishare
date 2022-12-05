const {
  Component,
  createRef,
} = React;
const {
  distanceNoSqrt,
  loadImage,
} = require('./helpers.js');
const Game = require('./Game.js');
const {
  emptyBoard,
  width,
  height,
  defaultCodeBase,
  validateMoveStruct,
} = require('./puzzle.js');

class GameBoardUI extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      holdingBall: false,
    };

    this.canvasRef = createRef();
    this.canvasOuterRef = createRef();
    this.game = new Game(props.basis);

    this.code = (base = defaultCodeBase) => this.game.code(base);
    this.history = () => this.game.moveHistory;

    this.editMode = props.editMode;

    this.onMove = props.onMove || (() => {});
    this.onSolve = props.onSolve || (() => {});
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
    const canvasWidth = canvasEl.width;
    const canvasHeight = canvasEl.height;
    const canvasOuterEl = this.canvasOuterRef.current;
    const ctx = canvasEl.getContext('2d');

    const emptyBoardRef = emptyBoard();
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

    const slots = [];
    for (let v = 0; v < height; v++) {
      const thisRow = [];
      const thisRowY = spaceHeight * (v + 0.5) + gridTop;
      const thisRowTop = spaceHeight * v + gridTop;
      for (let u = 0; u < width; u++) {
        if (emptyBoardRef[v][u] !== 2) {
          thisRow[u] = {
            x: spaceWidth * (u + 0.5) + gridLeft,
            y: thisRowY,
            left: spaceWidth * u + gridLeft,
            top: thisRowTop
          };
        }
      }
      slots[v] = thisRow;
    }

    const imgFilenames = {
      board: 'board.png',
      ball: 'ball.png',
      ballShadow: 'ball-shadow.png',
    };
    const imgFilenameKvps = Object.entries(imgFilenames);
    const imageCount = imgFilenameKvps.length;
    const imgs = {};

    let mouseX = canvasWidth / 2;
    let mouseY = canvasHeight / 2;
    const updateMouse = (e) => {
      if (!e) return;

      let rawX;
      let rawY;

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

    let tempMoveX = 0;
    let tempMoveY = 0;
    const moveMadeCallback = () => {
      this.hintOnDisplay = null;
      this.onMove();
      if (this.game.countBalls() === 1) this.onSolve();
    }
    const mouseDownHandler = (e) => {
      if (this.state.disabled) return;
      updateMouseGrid(e);
      const clickedRow = this.game.puzzle[mouseGridY];
      if (clickedRow) {
        const clickedSpaceValue = clickedRow[mouseGridX];
        if (typeof clickedSpaceValue !== 'undefined') {
          const thisSlot = slots[mouseGridY][mouseGridX];
          if (distanceNoSqrt(mouseX, mouseY, thisSlot.x, thisSlot.y) < ballRadiusSquared) {
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
      if (this.editMode === 'solveReverse') {
        moveMade = this.game.makeMove({
          from: newMove.to,
          to: newMove.from,
        }, true);
      } else {
        moveMade = this.game.makeMove(newMove);
      }
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

      ctx.lineWidth = 3;
      ctx.lineJoin = 'miter';
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';
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

      if (this.state.holdingBall) {
        ctx.drawImage(imgs.ball, mouseX - ballImgCenterX, mouseY - ballImgCenterY, ballImgWidth, ballImgHeight);
      }
    };

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
            <canvas ref={this.canvasRef} className="gameBoardCanvas" width="600" height="600"/>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = GameBoardUI;
