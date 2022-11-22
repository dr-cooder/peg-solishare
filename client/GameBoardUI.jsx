const {
  Component, createRef,
} = React;
const { distanceNoSqrt } = require('./helpers.js');
const Game = require('./Game.js');
const {
  emptyBoard,
  width,
  height,
  defaultCodeBase,
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

    this.undo = (reverse) => {
      this.game.undo(reverse);
      this.props.onMove();
    };
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
    const gridTop = 100;
    const gridLeft = 100;
    const gridWidth = 400;
    const gridHeight = 400;
    const spaceWidth = gridWidth / width;
    const spaceHeight = gridHeight / height;
    const ballRadius = 20;
    const ballRadiusSquared = ballRadius * ballRadius;

    const slots = [];
    for (let v = 0; v < height; v++) {
      const thisRow = [];
      const thisRowY = spaceHeight * (v + 0.5) + gridTop;
      for (let u = 0; u < width; u++) {
        if (emptyBoardRef[v][u] !== 2) {
          thisRow[u] = {
            x: spaceWidth * (u + 0.5) + gridLeft,
            y: thisRowY,
          };
        }
      }
      slots[v] = thisRow;
    }

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
    const pickUpBall = (e) => {
      if (this.state.disabled) return;
      updateMouseGrid(e);
      if (this.game.puzzle[mouseGridY][mouseGridX] === 1) {
        const thisSlot = slots[mouseGridY][mouseGridX];
        if (thisSlot
          && distanceNoSqrt(mouseX, mouseY, thisSlot.x, thisSlot.y) < ballRadiusSquared) {
          this.setState({ holdingBall: true });
          tempMoveX = mouseGridX;
          tempMoveY = mouseGridY;
        }
      }
    };

    const dropBall = (e) => {
      if (this.state.disabled || !this.state.holdingBall) return;
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
      if (this.game.makeMove(newMove)) this.props.onMove();
    };

    canvasOuterEl.onmousedown = pickUpBall;
    canvasOuterEl.onmousemove = updateMouse;
    canvasOuterEl.onmouseup = dropBall;
    canvasOuterEl.onmouseout = dropBall;

    canvasOuterEl.ontouchstart = pickUpBall;
    canvasOuterEl.ontouchmove = updateMouse;
    canvasOuterEl.ontouchend = dropBall;
    canvasOuterEl.ontouchcancel = dropBall;

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';

    const loop = () => {
      requestAnimationFrame(loop);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let v = 0; v < height; v++) {
        for (let u = 0; u < width; u++) {
          const thisSlot = slots[v][u];
          if (thisSlot) {
            ctx.beginPath();
            ctx.rect(spaceWidth * u + gridLeft, spaceHeight * v + gridTop, spaceWidth, spaceHeight);
            ctx.closePath();
            ctx.stroke();

            if (this.game.puzzle[v][u] === 1
              && !(this.state.holdingBall && u === tempMoveX && v === tempMoveY)) {
              ctx.beginPath();
              ctx.arc(thisSlot.x, thisSlot.y, ballRadius, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      if (this.state.holdingBall) {
        ctx.fillStyle = 'red';

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, ballRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'black';
      }

      ctx.beginPath();
    };

    loop();
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
