(()=>{var e={689:e=>{const{Component:t}=React;e.exports=class extends t{constructor(e){super(e),this.state={color:"danger",message:"",linkText:"",linkHref:"#"},this.clearMessage=()=>{this.setState({color:"danger",message:"",linkText:"",linkHref:"#"})},this.showError=e=>{this.setState({color:"danger",message:e,linkText:"",linkHref:"#"})},this.showSuccess=(e,t,o)=>{this.setState({color:"success",message:e,linkText:t,linkHref:o||"#"})}}render(){return React.createElement("div",{className:"errorMessageContainer"},React.createElement("h3",{className:`text-${this.state.color}`},this.state.message),React.createElement("a",{href:this.state.linkHref},this.state.linkText))}}},303:(e,t,o)=>{const{emptyBoard:n,width:r,height:a,validMoveDeltas:s,validMoveDeltaCount:l,isCode:i,isPuzzle:c,codeToPuzzle:d,puzzleToCode:u,defaultCodeBase:h,countBalls:m,validateMoveStruct:f,findMoveDelta:p}=o(175);e.exports=class{constructor(e){e?c(e)?this.puzzle=e:i(e)?this.puzzle=d(e):i(e,2)?this.puzzle=d(e,2):this.puzzle=n():this.puzzle=n(),this.moveHistory=[]}validateMove(e,t){if(!f(e))return null;const o=e.from.x,n=e.from.y,s=e.to.x,l=e.to.y,i=p(o,n,s,l);if(!i)return null;const c=i.middle,d=o+c.x,u=n+c.y;if(o<0||o>=r)return null;if(n<0||n>=a)return null;if(s<0||s>=r)return null;if(l<0||l>=a)return null;const h=t?0:1,m=t?0:1,g=t?1:0;return this.puzzle[n][o]!==h||this.puzzle[u][d]!==m||this.puzzle[l][s]!==g?null:{matchingDelta:i,moveMid:{x:d,y:u}}}allValidMoves(e){const t=[];for(let o=0;o<a;o++)for(let n=0;n<r;n++)if(1===this.puzzle[o][n])for(let r=0;r<l;r++){const a=s[r],l=e?{from:{x:n-a.x,y:o-a.y},to:{x:n,y:o}}:{from:{x:n,y:o},to:{x:n+a.x,y:o+a.y}};this.validateMove(l,e)&&t.push(l)}return t}makeMove(e,t,o){const n=this.validateMove(e,t);if(!n)return!1;const{moveMid:r}=n,a=e.from,s=e.to,l=t?1:0,i=t?1:0,c=t?0:1;return this.puzzle[a.y][a.x]=l,this.puzzle[r.y][r.x]=i,this.puzzle[s.y][s.x]=c,o||this.moveHistory.push(e),!0}toggleBall(e,t,o){const n=this.puzzle[t][e];return 2!==n&&(this.puzzle[t][e]=0===n?1:0,o||this.moveHistory.push({toggle:{x:e,y:t}}),!0)}undo(e){const t=this.moveHistory.pop();if(!t)return;const{toggle:o}=t;o?this.toggleBall(o.x,o.y,!0):this.makeMove(t,!e,!0)}countBalls(){return m(this.puzzle)}puzzleToString(){return this.puzzle.map((e=>Array.from(e).map((e=>[".","O"," "][e])).join(" "))).join("\n")}code(e=h){return u(this.puzzle,e)}}},273:(e,t,o)=>{const{Component:n,createRef:r}=React,{distanceNoSqrt:a,loadImage:s}=o(718),l=o(303),{emptyBoard:i,width:c,height:d,defaultCodeBase:u,validateMoveStruct:h}=o(175);e.exports=class extends n{constructor(e){super(e),this.state={disabled:!1,holdingBall:!1},this.canvasRef=r(),this.canvasOuterRef=r(),this.game=new l(e.basis),this.code=(e=u)=>this.game.code(e),this.editMode=e.editMode,this.onMove=e.onMove||(()=>{}),this.undo=()=>{this.game.undo(this.editMode),this.hintOnDisplay=null,this.onMove()},this.hintOnDisplay=null,this.displayHint=e=>{h(e)&&(this.hintOnDisplay=e)}}static getDerivedStateFromProps(e,t){return e.disabled!==t.disabled?{disabled:e.disabled,holdingBall:!e.disabled&&t.holdingBall}:null}componentDidMount(){const e=this.canvasRef.current,t=e.width,o=e.height,n=this.canvasOuterRef.current,r=e.getContext("2d"),l=i(),u=382/c,h=382/d,m=[];for(let e=0;e<d;e++){const t=[],o=h*(e+.5)+109,n=h*e+109;for(let r=0;r<c;r++)2!==l[e][r]&&(t[r]={x:u*(r+.5)+109,y:o,left:u*r+109,top:n});m[e]=t}const f=Object.entries({board:"board.png",ball:"ball.png",ballShadow:"ball-shadow.png"}),p=f.length,g={};let y=t/2,v=o/2;const b=t=>{if(!t)return;let o,r;const a=t.type.slice(0,5);"touch"===a?(o=t.touches[0].pageX,r=t.touches[0].pageY):"mouse"===a&&(o=t.pageX,r=t.pageY),y=(o-n.offsetLeft)*(e.width/n.offsetWidth),v=(r-n.offsetTop)*(e.height/n.offsetHeight)};let x=Math.floor(c/2),z=Math.floor(d/2);const w=e=>{b(e),x=Math.floor((y-109)/u),z=Math.floor((v-109)/h)};let M=0,R=0;const S=e=>{if(this.state.disabled)return;w(e);const t=this.game.puzzle[z];if(t){const e=t[x];if(void 0!==e){const t=m[z][x];a(y,v,t.x,t.y)<400&&("toggleBalls"===this.editMode?this.game.toggleBall(x,z)&&this.onMove():1===e&&(this.setState({holdingBall:!0}),M=x,R=z))}}},B=e=>{if(this.state.disabled||!this.state.holdingBall||"toggleBalls"===this.editMode)return;this.setState({holdingBall:!1}),w(e);const t={from:{x:M,y:R},to:{x,y:z}};let o;o="solveReverse"===this.editMode?this.game.makeMove({from:t.to,to:t.from},!0):this.game.makeMove(t),o&&(this.hintOnDisplay=null,this.onMove())};n.onmousedown=S,n.onmousemove=b,n.onmouseup=B,n.onmouseout=B,n.ontouchstart=S,n.ontouchmove=b,n.ontouchend=B,n.ontouchcancel=B;const E=()=>{requestAnimationFrame(E),r.clearRect(0,0,t,o),r.drawImage(g.board,0,0,t,o),r.lineWidth=3,r.lineJoin="miter",r.strokeStyle="black",r.fillStyle="black";for(let e=0;e<d;e++)for(let t=0;t<c;t++){const o=m[e][t];o&&(1!==this.game.puzzle[e][t]||this.state.holdingBall&&t===M&&e===R||r.drawImage(g.ballShadow,o.x-26,o.y-26,52,52))}if(this.hintOnDisplay){r.lineWidth=6,r.lineJoin="round",r.strokeStyle="red",r.fillStyle="red";const e=this.hintOnDisplay.from,t=m[e.y][e.x],o=t.x,n=t.y,a=this.hintOnDisplay.to,s=m[a.y][a.x],l=s.x-o,i=s.y-n,c=o+.75*l,d=n+.75*i,u=.05*i,h=.05*l;r.beginPath(),r.moveTo(o+.25*l,n+.25*i),r.lineTo(c,d),r.lineTo(c+u,d+h),r.lineTo(o+.85*l,n+.85*i),r.lineTo(c-u,d-h),r.lineTo(c,d),r.closePath(),r.stroke(),r.fill()}this.state.holdingBall&&r.drawImage(g.ball,y-26,v-26,52,52)},C=[];for(let e=0;e<p;e++)C[e]=s(`assets/img/${f[e][1]}`);Promise.all(C).then((e=>{for(let t=0;t<p;t++)g[f[t][0]]=e[t];E()}))}render(){return React.createElement("div",{ref:this.canvasOuterRef,className:"gameBoardCanvasOuter"},React.createElement("div",{className:"ratio1x1"},React.createElement("div",{className:"ratioContainer"},React.createElement("canvas",{ref:this.canvasRef,className:"gameBoardCanvas",width:"600",height:"600"}))))}}},718:e=>{const t=e=>{const t=Math.floor(e/36e5),o=Math.floor(e/6e4)%60,n=Math.floor(e/1e3)%60,r=e%1e3;return`${t.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}.${r.toString().padStart(3,"0")}`};e.exports={distanceNoSqrt:(e,t,o,n)=>{const r=o-e,a=n-t;return r*r+a*a},byteToBits:e=>e.toString(2).padStart(8,"0"),byteFromBitRemainder:e=>parseInt(e.padEnd(8,"0"),2),formatTime:t,progressPercent:(e,t)=>{const o=e.toString().padStart(2,"0").padStart(4," "),n=` [32m${o.slice(0,-1)}.${o.slice(-1)}%[39m`;process.stdout.cursorTo(t),process.stdout.write(n)},doneHavingStartedAt:e=>{const o=Date.now()-e;process.stdout.write(`\nDone after ${t(o)}\n`)},loadImage:e=>new Promise(((t,o)=>{const n=new Image;n.crossOrigin="Anonymous",n.src=e,n.onload=()=>{t(n)},n.onerror=e=>{o(e)}})),sendPost:async(e,t)=>{const o=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),n=await o.json();return n.redirect&&(window.location=n.redirect),n}}},175:e=>{const t=()=>{const e=[new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2])];return Object.seal(e),e},o=[{name:"right",x:2,y:0,middle:{x:1,y:0}},{name:"up",x:0,y:-2,middle:{x:0,y:-1}},{name:"left",x:-2,y:0,middle:{x:-1,y:0}},{name:"down",x:0,y:2,middle:{x:0,y:1}}],n=[[2,1,0,5,4,3,12,11,10,9,8,7,6,19,18,17,16,15,14,13,26,25,24,23,22,21,20,29,28,27,32,31,30],[30,31,32,27,28,29,20,21,22,23,24,25,26,13,14,15,16,17,18,19,6,7,8,9,10,11,12,3,4,5,0,1,2],[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],[6,13,20,7,14,21,0,3,8,15,22,27,30,1,4,9,16,23,28,31,2,5,10,17,24,29,32,11,18,25,12,19,26],[26,19,12,25,18,11,32,29,24,17,10,5,2,31,28,23,16,9,4,1,30,27,22,15,8,3,0,21,14,7,20,13,6],[12,19,26,11,18,25,2,5,10,17,24,29,32,1,4,9,16,23,28,31,0,3,8,15,22,27,30,7,14,21,6,13,20],[20,13,6,21,14,7,30,27,22,15,8,3,0,31,28,23,16,9,4,1,32,29,24,17,10,5,2,25,18,11,26,19,12]],r=n.length,a=(e,t)=>{const o=n[t];let r="";for(let t=0;t<33;t++)r+=e.charAt(o[t]);return r},s=parseInt("1".repeat(33),2),l=[];for(let e=2;e<=36;e++)l[e]=(i=e,s.toString(i).length);var i;const c=(e,t,o)=>parseInt(e,t).toString(o).padStart(l[o],"0"),d=[];for(let e=2;e<=36;e++)d[e]=new RegExp(`^[${"0123456789abcdefghijklmnopqrstuvwxyz".slice(0,e)}]{${l[e]}}$`);const u=[4,8,10,14,18,22,24,28],h=u.length,m=2**h;e.exports={emptyBoard:t,width:7,height:7,slotCount:33,validMoveDeltas:o,validMoveDeltaCount:4,findMoveDelta:(e,t,n,r)=>{const a=n-e,s=r-t;let l=null;for(let e=0;e<4;e++){const t=o[e];t.x===a&&t.y===s&&(l=t)}return l},codeRegExps:d,isCode:(e,t=36)=>d[t].test(e),isPuzzle:e=>{if(!e)return!1;const o=t();if(!Array.isArray(e))return!1;const n=e.length;if(7!==n)return!1;for(let t=0;t<n;t++){const n=e[t];if(!(n instanceof Uint8Array))return!1;const r=n.length;if(7!==r)return!1;for(let e=0;e<r;e++){const r=n[e];if(0!==r&&1!==r&&2!==r)return!1;if(2===o[t][e]!=(2===r))return!1}}return!0},copyPuzzle:e=>{const t=[];for(let o=0;o<7;o++)t[o]=new Uint8Array(e[o]);return Object.seal(t),t},codeToPuzzle:(e,o=36)=>{const n=2===o?e:c(e,o,2),r=t();let a=0;for(let e=0;e<7;e++){const t=r[e];for(let e=0;e<7;e++)2!==t[e]&&(t[e]=n[a],a++)}return r},puzzleToCode:(e,t=36)=>{let o="";for(let t=0;t<7;t++){const n=e[t];for(let e=0;e<7;e++){const t=n[e];2!==t&&(o+=t)}}return 2===t?o:c(o,2,t)},convertCodeBase:c,defaultCodeBase:36,transform:a,isometryCount:r,codeImages:e=>{const t=new Set;t.add(e);for(let o=0;o<r;o++)t.add(a(e,o));return Array.from(t)},countBalls:e=>{let t=0;for(let o=0;o<7;o++)for(let n=0;n<7;n++)1===e[o][n]&&t++;return t},codeSampleRange:m,sampleCode:e=>{let t="";for(let o=0;o<h;o++)t+=e.charAt(u[o]);return parseInt(t,2)},validateMoveStruct:e=>e&&e.from&&"number"==typeof e.from.x&&"number"==typeof e.from.y&&e.to&&"number"==typeof e.to.x&&"number"==typeof e.from.y}}},t={};function o(n){var r=t[n];if(void 0!==r)return r.exports;var a=t[n]={exports:{}};return e[n](a,a.exports,o),a.exports}(()=>{const e=o(273),t=o(689),{useState:n,createRef:r,useRef:a}=React,{sendPost:s}=o(718),l=o=>{const[l,i]=n(!1),[c,d]=n(!1),[u,h]=n(!1),[m,f]=n(!1),[p,g]=n(o.startingHintBalance),y=r(),v=a();return React.createElement(React.Fragment,null,React.createElement(e,{ref:y,disabled:c,basis:o.code,onMove:()=>(v.current.clearMessage(),i(!1),void f(!1))}),React.createElement("div",{className:"buttonContainerFlex buttonContainerHoriz"},React.createElement("button",{id:"hintButton",type:"button",className:"btn btn-warning btn-lg",disabled:m||c||u,onClick:()=>(async(e,t)=>{const o=e.code();if(c||u)return null;d(!0);const n=await fetch(`/hint?code=${o}`),{hint:r,unsolvable:a,alreadySolved:s,error:l,updatedBalance:h}=await n.json();"number"==typeof h&&g(h),d(!1),200!==n.status?t.showError(l):a?(i(!0),f(!0),t.clearMessage()):s?t.showError("This puzzle has already been solved!"):r?(e.displayHint(r),f(!0),t.clearMessage()):t.showError("Unexpected server response.")})(y.current,v.current)},c?React.createElement("span",{className:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"}):React.createElement("i",{className:m?"fa-solid fa-arrow-"+(l?"right":"up"):"fa-regular fa-lightbulb"})," Hints: ",p),React.createElement("button",{id:"undoButton",type:"button",className:"btn btn-secondary btn-lg "+(l?"undoButtonHighlighted":""),disabled:c,onClick:()=>y.current.undo()},React.createElement("i",{className:"fa-solid fa-arrow-rotate-left"})," Undo")),React.createElement("div",null,React.createElement("button",{className:"btn btn-outline-warning btn-lg hintPurchaseBtn",disabled:c||u,onClick:()=>(async e=>{if(c||u)return null;h(!0);const{updatedBalance:t}=await s("/buy-hints",{howMany:5,_csrf:o.csrf});"number"==typeof t&&g(t),h(!1)})(0,v.current)},u?React.createElement("span",{className:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"}):React.createElement("i",{className:"fa-regular fa-credit-card"})," Buy more hints")),React.createElement(t,{ref:v}))};window.onload=async()=>{const e=await fetch("/token"),t=await e.json(),o=document.getElementById("playUiRoot");ReactDOM.createRoot(o).render(React.createElement(l,{code:o.dataset.code,startingHintBalance:parseInt(o.dataset.startingHintBalance,10),csrf:t.csrfToken}))}})()})();