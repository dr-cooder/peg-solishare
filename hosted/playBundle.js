(()=>{var t={303:(t,e,o)=>{const{emptyBoard:n,width:a,height:r,validMoveDeltas:s,validMoveDeltaCount:l,isCode:i,isPuzzle:d,codeToPuzzle:c,puzzleToCode:u,defaultCodeBase:h,countBalls:m,validateMoveStruct:f,findMoveDelta:p}=o(175);t.exports=class{constructor(t){t?d(t)?this.puzzle=t:i(t)?this.puzzle=c(t):i(t,2)?this.puzzle=c(t,2):this.puzzle=n():this.puzzle=n(),this.moveHistory=[]}validateMove(t,e){if(!f(t))return null;const o=t.from.x,n=t.from.y,s=t.to.x,l=t.to.y,i=p(o,n,s,l);if(!i)return null;const d=i.middle,c=o+d.x,u=n+d.y;if(o<0||o>=a)return null;if(n<0||n>=r)return null;if(s<0||s>=a)return null;if(l<0||l>=r)return null;const h=e?0:1,m=e?0:1,g=e?1:0;return this.puzzle[n][o]!==h||this.puzzle[u][c]!==m||this.puzzle[l][s]!==g?null:{matchingDelta:i,moveMid:{x:c,y:u}}}allValidMoves(t){const e=[];for(let o=0;o<r;o++)for(let n=0;n<a;n++)if(1===this.puzzle[o][n])for(let a=0;a<l;a++){const r=s[a],l=t?{from:{x:n-r.x,y:o-r.y},to:{x:n,y:o}}:{from:{x:n,y:o},to:{x:n+r.x,y:o+r.y}};this.validateMove(l,t)&&e.push(l)}return e}makeMove(t,e,o){const n=this.validateMove(t,e);if(!n)return!1;const{moveMid:a}=n,r=t.from,s=t.to,l=e?1:0,i=e?1:0,d=e?0:1;return this.puzzle[r.y][r.x]=l,this.puzzle[a.y][a.x]=i,this.puzzle[s.y][s.x]=d,o||this.moveHistory.push(t),!0}toggleBall(t,e,o){const n=this.puzzle[e][t];2!==n&&(this.puzzle[e][t]=0===n?1:0,o||this.moveHistory.push({toggle:{x:t,y:e}}))}undo(t){const e=this.moveHistory.pop();if(!e)return;const{toggle:o}=e;o?this.toggleBall(o.x,o.y,!0):this.makeMove(e,!t,!0)}countBalls(){return m(this.puzzle)}puzzleToString(){return this.puzzle.map((t=>Array.from(t).map((t=>[".","O"," "][t])).join(" "))).join("\n")}code(t=h){return u(this.puzzle,t)}}},273:(t,e,o)=>{const{Component:n,createRef:a}=React,{distanceNoSqrt:r,loadImage:s}=o(718),l=o(303),{emptyBoard:i,width:d,height:c,defaultCodeBase:u,validateMoveStruct:h}=o(175);t.exports=class extends n{constructor(t){super(t),this.state={disabled:!1,holdingBall:!1},this.canvasRef=a(),this.canvasOuterRef=a(),this.game=new l(t.basis),this.code=(t=u)=>this.game.code(t),this.editMode=t.editMode,this.onMove=t.onMove||(()=>{}),this.undo=()=>{this.game.undo(this.editMode),this.hintOnDisplay=null,this.onMove()},this.hintOnDisplay=null,this.displayHint=t=>{h(t)&&(this.hintOnDisplay=t)}}static getDerivedStateFromProps(t,e){return t.disabled!==e.disabled?{disabled:t.disabled,holdingBall:!t.disabled&&e.holdingBall}:null}componentDidMount(){const t=this.canvasRef.current,e=t.width,o=t.height,n=this.canvasOuterRef.current,a=t.getContext("2d"),l=i(),u=382/d,h=382/c,m=[];for(let t=0;t<c;t++){const e=[],o=h*(t+.5)+109,n=h*t+109;for(let a=0;a<d;a++)2!==l[t][a]&&(e[a]={x:u*(a+.5)+109,y:o,left:u*a+109,top:n});m[t]=e}const f=Object.entries({board:"board.png",ball:"ball.png",ballShadow:"ball-shadow.png"}),p=f.length,g={};let y=e/2,v=o/2;const z=e=>{if(!e)return;let o,a;const r=e.type.slice(0,5);"touch"===r?(o=e.touches[0].pageX,a=e.touches[0].pageY):"mouse"===r&&(o=e.pageX,a=e.pageY),y=(o-n.offsetLeft)*(t.width/n.offsetWidth),v=(a-n.offsetTop)*(t.height/n.offsetHeight)};let b=Math.floor(d/2),x=Math.floor(c/2);const w=t=>{z(t),b=Math.floor((y-109)/u),x=Math.floor((v-109)/h)};let M=0,S=0;const R=t=>{if(this.state.disabled)return;w(t);const e=this.game.puzzle[x];if(e){const t=e[b];if(void 0!==t){const e=m[x][b];r(y,v,e.x,e.y)<400&&("toggleBalls"===this.editMode?this.game.toggleBall(b,x):1===t&&(this.setState({holdingBall:!0}),M=b,S=x))}}},B=t=>{if(this.state.disabled||!this.state.holdingBall||"toggleBalls"===this.editMode)return;this.setState({holdingBall:!1}),w(t);const e={from:{x:M,y:S},to:{x:b,y:x}};let o;o="solveReverse"===this.editMode?this.game.makeMove({from:e.to,to:e.from},!0):this.game.makeMove(e),o&&(this.hintOnDisplay=null,this.onMove())};n.onmousedown=R,n.onmousemove=z,n.onmouseup=B,n.onmouseout=B,n.ontouchstart=R,n.ontouchmove=z,n.ontouchend=B,n.ontouchcancel=B;const C=()=>{requestAnimationFrame(C),a.clearRect(0,0,e,o),a.drawImage(g.board,0,0,e,o),a.lineWidth=3,a.lineJoin="miter",a.strokeStyle="black",a.fillStyle="black";for(let t=0;t<c;t++)for(let e=0;e<d;e++){const o=m[t][e];o&&(1!==this.game.puzzle[t][e]||this.state.holdingBall&&e===M&&t===S||a.drawImage(g.ballShadow,o.x-26,o.y-26,52,52))}if(this.hintOnDisplay){a.lineWidth=6,a.lineJoin="round",a.strokeStyle="red",a.fillStyle="red";const t=this.hintOnDisplay.from,e=m[t.y][t.x],o=e.x,n=e.y,r=this.hintOnDisplay.to,s=m[r.y][r.x],l=s.x-o,i=s.y-n,d=o+.75*l,c=n+.75*i,u=.05*i,h=.05*l;a.beginPath(),a.moveTo(o+.25*l,n+.25*i),a.lineTo(d,c),a.lineTo(d+u,c+h),a.lineTo(o+.85*l,n+.85*i),a.lineTo(d-u,c-h),a.lineTo(d,c),a.closePath(),a.stroke(),a.fill()}this.state.holdingBall&&a.drawImage(g.ball,y-26,v-26,52,52)},E=[];for(let t=0;t<p;t++)E[t]=s(`assets/img/${f[t][1]}`);Promise.all(E).then((t=>{for(let e=0;e<p;e++)g[f[e][0]]=t[e];C()}))}render(){return React.createElement("div",{ref:this.canvasOuterRef,className:"gameBoardCanvasOuter"},React.createElement("div",{className:"ratio1x1"},React.createElement("div",{className:"ratioContainer"},React.createElement("canvas",{ref:this.canvasRef,className:"gameBoardCanvas",width:"600",height:"600"}))))}}},718:t=>{const e=t=>{const e=Math.floor(t/36e5),o=Math.floor(t/6e4)%60,n=Math.floor(t/1e3)%60,a=t%1e3;return`${e.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}.${a.toString().padStart(3,"0")}`};t.exports={distanceNoSqrt:(t,e,o,n)=>{const a=o-t,r=n-e;return a*a+r*r},byteToBits:t=>t.toString(2).padStart(8,"0"),byteFromBitRemainder:t=>parseInt(t.padEnd(8,"0"),2),formatTime:e,progressPercent:(t,e)=>{const o=t.toString().padStart(2,"0").padStart(4," "),n=` [32m${o.slice(0,-1)}.${o.slice(-1)}%[39m`;process.stdout.cursorTo(e),process.stdout.write(n)},doneHavingStartedAt:t=>{const o=Date.now()-t;process.stdout.write(`\nDone after ${e(o)}\n`)},loadImage:t=>new Promise(((e,o)=>{const n=new Image;n.crossOrigin="Anonymous",n.src=t,n.onload=()=>{e(n)},n.onerror=t=>{o(t)}})),sendPost:async(t,e,o)=>{const n=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),a=await n.json();a.redirect&&(window.location=a.redirect),o&&o(a)}}},175:t=>{const e=()=>{const t=[new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2])];return Object.seal(t),t},o=[{name:"right",x:2,y:0,middle:{x:1,y:0}},{name:"up",x:0,y:-2,middle:{x:0,y:-1}},{name:"left",x:-2,y:0,middle:{x:-1,y:0}},{name:"down",x:0,y:2,middle:{x:0,y:1}}],n=[[2,1,0,5,4,3,12,11,10,9,8,7,6,19,18,17,16,15,14,13,26,25,24,23,22,21,20,29,28,27,32,31,30],[30,31,32,27,28,29,20,21,22,23,24,25,26,13,14,15,16,17,18,19,6,7,8,9,10,11,12,3,4,5,0,1,2],[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],[6,13,20,7,14,21,0,3,8,15,22,27,30,1,4,9,16,23,28,31,2,5,10,17,24,29,32,11,18,25,12,19,26],[26,19,12,25,18,11,32,29,24,17,10,5,2,31,28,23,16,9,4,1,30,27,22,15,8,3,0,21,14,7,20,13,6],[12,19,26,11,18,25,2,5,10,17,24,29,32,1,4,9,16,23,28,31,0,3,8,15,22,27,30,7,14,21,6,13,20],[20,13,6,21,14,7,30,27,22,15,8,3,0,31,28,23,16,9,4,1,32,29,24,17,10,5,2,25,18,11,26,19,12]],a=n.length,r=(t,e)=>{const o=n[e];let a="";for(let e=0;e<33;e++)a+=t.charAt(o[e]);return a},s=parseInt("1".repeat(33),2),l=[];for(let t=2;t<=36;t++)l[t]=(i=t,s.toString(i).length);var i;const d=(t,e,o)=>parseInt(t,e).toString(o).padStart(l[o],"0"),c=[];for(let t=2;t<=36;t++)c[t]=new RegExp(`^[${"0123456789abcdefghijklmnopqrstuvwxyz".slice(0,t)}]{${l[t]}}$`);const u=[4,8,10,14,18,22,24,28],h=u.length,m=2**h;t.exports={emptyBoard:e,width:7,height:7,slotCount:33,validMoveDeltas:o,validMoveDeltaCount:4,findMoveDelta:(t,e,n,a)=>{const r=n-t,s=a-e;let l=null;for(let t=0;t<4;t++){const e=o[t];e.x===r&&e.y===s&&(l=e)}return l},codeRegExps:c,isCode:(t,e=36)=>c[e].test(t),isPuzzle:t=>{if(!t)return!1;const o=e();if(!Array.isArray(t))return!1;const n=t.length;if(7!==n)return!1;for(let e=0;e<n;e++){const n=t[e];if(!(n instanceof Uint8Array))return!1;const a=n.length;if(7!==a)return!1;for(let t=0;t<a;t++){const a=n[t];if(0!==a&&1!==a&&2!==a)return!1;if(2===o[e][t]!=(2===a))return!1}}return!0},copyPuzzle:t=>{const e=[];for(let o=0;o<7;o++)e[o]=new Uint8Array(t[o]);return Object.seal(e),e},codeToPuzzle:(t,o=36)=>{const n=2===o?t:d(t,o,2),a=e();let r=0;for(let t=0;t<7;t++){const e=a[t];for(let t=0;t<7;t++)2!==e[t]&&(e[t]=n[r],r++)}return a},puzzleToCode:(t,e=36)=>{let o="";for(let e=0;e<7;e++){const n=t[e];for(let t=0;t<7;t++){const e=n[t];2!==e&&(o+=e)}}return 2===e?o:d(o,2,e)},convertCodeBase:d,defaultCodeBase:36,transform:r,isometryCount:a,codeImages:t=>{const e=new Set;e.add(t);for(let o=0;o<a;o++)e.add(r(t,o));return Array.from(e)},countBalls:t=>{let e=0;for(let o=0;o<7;o++)for(let n=0;n<7;n++)1===t[o][n]&&e++;return e},codeSampleRange:m,sampleCode:t=>{let e="";for(let o=0;o<h;o++)e+=t.charAt(u[o]);return parseInt(e,2)},validateMoveStruct:t=>t&&t.from&&"number"==typeof t.from.x&&"number"==typeof t.from.y&&t.to&&"number"==typeof t.to.x&&"number"==typeof t.from.y}}},e={};function o(n){var a=e[n];if(void 0!==a)return a.exports;var r=e[n]={exports:{}};return t[n](r,r.exports,o),r.exports}(()=>{const t=o(273),{useState:e,createRef:n}=React,a=o=>{const[a,r]=e(),[s,l]=e(!1),[i,d]=e(!1),[c,u]=e(!1),[h,m]=e(5),f=n();return React.createElement(React.Fragment,null,React.createElement(t,{ref:f,disabled:i,basis:o.code,onMove:()=>{r(""),l(!1),u(!1)}}),React.createElement("div",{className:"buttonContainerFlex buttonContainerHoriz"},React.createElement("button",{id:"hintButton",type:"button",className:"btn btn-warning btn-lg",disabled:c||i,onClick:()=>{(async t=>{const e=t.code();if(i)return null;d(!0);const o=await fetch(`/hint?code=${e}`),{hint:n,unsolvable:a,alreadySolved:s,message:c}=await o.json();d(!1),200!==o.status?r(c):a?(l(!0),u(!0),m(h-1),h<0&&m(0)):s?r("This puzzle has already been solved!"):n?(t.displayHint(n),u(!0),m(h-1),h<0&&m(0)):r("Unexpected server response.")})(f.current)}},i?React.createElement("span",{className:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"}):React.createElement("i",{className:c?"fa-solid fa-arrow-"+(s?"right":"up"):"fa-regular fa-lightbulb"})," Hints: ",h),React.createElement("button",{id:"undoButton",type:"button",className:"btn btn-secondary btn-lg "+(s?"undoButtonHighlighted":""),disabled:i,onClick:()=>f.current.undo()},React.createElement("i",{className:"fa-solid fa-arrow-rotate-left"})," Undo")),React.createElement("div",null,React.createElement("a",{href:"#",id:"hintPurchaseLink",onClick:()=>{m(h+5)}},"Buy more hints")),React.createElement("h3",{className:"spacedHeader"},a))};window.onload=()=>{const t=document.getElementById("playUiRoot");ReactDOM.createRoot(t).render(React.createElement(a,{code:t.dataset.code}))}})()})();