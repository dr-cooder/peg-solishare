const {
  useRef, useEffect, useState,
} = React;

const GameBoardUI = (props) => {
  // https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
  const canvasRef = useRef(null);
  const canvasOuterRef = useRef(null);
  const [holdingBall, setHoldingBall] = useState(false);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const canvasOuterEl = canvasOuterRef.current;
    const ctx = canvasEl.getContext('2d');

    let mouseX = 300;
    let mouseY = 300;

    const updateMouse = (e) => {
      if (!e) return;

      let rawX;
      let rawY;

      // https://stackoverflow.com/questions/60688935/my-canvas-drawing-app-wont-work-on-mobile/60689429#60689429
      if (e.type === 'touchmove') {
        rawX = e.touches[0].pageX;
        rawY = e.touches[0].pageY;
      } else if (e.type === 'mousemove') {
        rawX = e.pageX;
        rawY = e.pageY;
      }

      mouseX = (rawX - canvasOuterEl.offsetLeft)
        * (canvasEl.width / canvasOuterEl.offsetWidth);
      mouseY = (rawY - canvasOuterEl.offsetTop)
        * (canvasEl.height / canvasOuterEl.offsetHeight);
    };

    window.addEventListener('mousemove', updateMouse);

    const loop = () => {
      requestAnimationFrame(loop);

      ctx.clearRect(0, 0, 600, 600);

      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
    };

    loop();
  }, []);

  return (
    <div ref={canvasOuterRef} className='gameBoardCanvasOuter'>
      <canvas ref={canvasRef} width='600' height='600'/>
    </div>
  );
};

module.exports = GameBoardUI;
