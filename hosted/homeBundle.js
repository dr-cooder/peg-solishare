(()=>{var e={35:e=>{const{Component:t}=React;e.exports=class extends t{constructor(e){super(e),this.state={color:"danger",message:"",linkText:"",linkHref:"#"},this.clearMessage=()=>{this.setState({color:"danger",message:"",linkText:"",linkHref:"#"})},this.showSpinner=()=>{this.setState({color:"white",message:React.createElement("span",{className:"spinner-border",role:"status","aria-hidden":"true"}),linkText:"",linkHref:"#"})},this.showError=(e,t,o)=>{this.setState({color:"danger",message:e,linkText:t,linkHref:o||"#"})},this.showSuccess=(e,t,o)=>{this.setState({color:"success",message:e,linkText:t,linkHref:o||"#"})}}render(){return React.createElement("div",{className:"errorMessageContainer"},React.createElement("h3",{className:`text-${this.state.color}`},this.state.message),React.createElement("a",{href:this.state.linkHref},this.state.linkText))}}},489:(e,t,o)=>{const{Component:a,createRef:n}=React,{distanceNoSqrt:r,loadImage:s}=o(144),l=o(520),{emptyBoard:i,width:c,height:d,defaultCodeBase:h,validateMoveStruct:u}=o(245);e.exports=class extends a{constructor(e){super(e),this.state={disabled:!1,holdingBall:!1},this.canvasRef=n(),this.canvasOuterRef=n(),this.game=new l(e.basis),this.code=(e=h)=>this.game.code(e),this.history=()=>this.game.moveHistory,this.editMode=e.editMode,this.onMove=e.onMove||(()=>{}),this.onSolve=e.onSolve||(()=>{}),this.undo=()=>{this.game.undo(this.editMode),this.hintOnDisplay=null,this.onMove()},this.hintOnDisplay=null,this.displayHint=e=>{u(e)&&(this.hintOnDisplay=e)}}static getDerivedStateFromProps(e,t){return e.disabled!==t.disabled?{disabled:e.disabled,holdingBall:!e.disabled&&t.holdingBall}:null}componentDidMount(){const e=this.canvasRef.current,t=e.width,o=e.height,a=this.canvasOuterRef.current,n=e.getContext("2d"),l=i(),h=382/c,u=382/d,m=[];for(let e=0;e<d;e++){const t=[],o=u*(e+.5)+109,a=u*e+109;for(let n=0;n<c;n++)2!==l[e][n]&&(t[n]={x:h*(n+.5)+109,y:o,left:h*n+109,top:a});m[e]=t}const f=Object.entries({board:"board.png",ball:"ball.png",ballShadow:"ball-shadow.png"}),g=f.length,p={};let y=t/2,v=o/2;const x=t=>{if(!t)return;let o,n;const r=t.type.slice(0,5);"touch"===r?(o=t.touches[0].pageX,n=t.touches[0].pageY):"mouse"===r&&(o=t.pageX,n=t.pageY),y=(o-a.offsetLeft)*(e.width/a.offsetWidth),v=(n-a.offsetTop)*(e.height/a.offsetHeight)};let R=Math.floor(c/2),z=Math.floor(d/2);const S=e=>{x(e),R=Math.floor((y-109)/h),z=Math.floor((v-109)/u)};let w=0,b=0;const M=()=>{this.hintOnDisplay=null,this.onMove(),1===this.game.countBalls()&&this.onSolve()},E=e=>{if(this.state.disabled)return;S(e);const t=this.game.puzzle[z];if(t){const e=t[R];if(void 0!==e){const t=m[z][R];r(y,v,t.x,t.y)<400&&("toggleBalls"===this.editMode?this.game.toggleBall(R,z)&&M():1===e&&(this.setState({holdingBall:!0}),w=R,b=z))}}},B=e=>{if(this.state.disabled||!this.state.holdingBall||"toggleBalls"===this.editMode)return;this.setState({holdingBall:!1}),S(e);const t={from:{x:w,y:b},to:{x:R,y:z}};let o;o="solveReverse"===this.editMode?this.game.makeMove({from:t.to,to:t.from},!0):this.game.makeMove(t),o&&M()};a.onmousedown=E,a.onmousemove=x,a.onmouseup=B,a.onmouseout=B,a.ontouchstart=E,a.ontouchmove=x,a.ontouchend=B,a.ontouchcancel=B;const N=()=>{requestAnimationFrame(N),n.clearRect(0,0,t,o),n.drawImage(p.board,0,0,t,o),n.lineWidth=3,n.lineJoin="miter",n.strokeStyle="black",n.fillStyle="black";for(let e=0;e<d;e++)for(let t=0;t<c;t++){const o=m[e][t];o&&(1!==this.game.puzzle[e][t]||this.state.holdingBall&&t===w&&e===b||n.drawImage(p.ballShadow,o.x-26,o.y-26,52,52))}if(this.hintOnDisplay){n.lineWidth=6,n.lineJoin="round",n.strokeStyle="red",n.fillStyle="red";const e=this.hintOnDisplay.from,t=m[e.y][e.x],o=t.x,a=t.y,r=this.hintOnDisplay.to,s=m[r.y][r.x],l=s.x-o,i=s.y-a,c=o+.75*l,d=a+.75*i,h=.05*i,u=.05*l;n.beginPath(),n.moveTo(o+.25*l,a+.25*i),n.lineTo(c,d),n.lineTo(c+h,d+u),n.lineTo(o+.85*l,a+.85*i),n.lineTo(c-h,d-u),n.lineTo(c,d),n.closePath(),n.stroke(),n.fill()}this.state.holdingBall&&n.drawImage(p.ball,y-26,v-26,52,52)},C=[];for(let e=0;e<g;e++)C[e]=s(`assets/img/${f[e][1]}`);Promise.all(C).then((e=>{for(let t=0;t<g;t++)p[f[t][0]]=e[t];N()}))}render(){return React.createElement("div",{ref:this.canvasOuterRef,className:"gameBoardCanvasOuter"},React.createElement("div",{className:"ratio1x1"},React.createElement("div",{className:"ratioContainer"},React.createElement("canvas",{ref:this.canvasRef,className:"gameBoardCanvas",width:"600",height:"600"}))))}}},279:e=>{e.exports=e=>{const{username:t,dontShowLogin:o,dontShowTitle:a}=e;return React.createElement("nav",{className:"navFlex"},React.createElement("div",null,a?null:React.createElement("a",{href:"/",className:"logo logoLink"},React.createElement("span",{className:"logoPegSoli"},"Peg Soli"),React.createElement("span",{className:"logoShare"},"Share"))),React.createElement("div",null,o?null:t?React.createElement(React.Fragment,null,"Welcome, ",React.createElement("span",{className:"welcomeUsername"},t)," | ",React.createElement("a",{href:"/account"},"Settings")," | ",React.createElement("a",{href:"/logout"},"Log out")):React.createElement(React.Fragment,null,React.createElement("a",{className:"btn btn-primary",href:"/login?signup"},"Sign up")," or ",React.createElement("a",{href:"/login"},"log in"))))}},995:(e,t,o)=>{e.exports.ErrorMessage=o(35),e.exports.GameBoardUI=o(489),e.exports.Nav=o(279)},242:(e,t,o)=>{const{Nav:a}=o(995);e.exports={renderNav:(e,t)=>{const o=document.getElementById("navRoot");ReactDOM.createRoot(o).render(React.createElement(a,{username:o.dataset.username,dontShowTitle:e,dontShowLogin:t}))}}},520:(e,t,o)=>{const{emptyBoard:a,width:n,height:r,validMoveDeltas:s,validMoveDeltaCount:l,isCode:i,isPuzzle:c,codeToPuzzle:d,puzzleToCode:h,defaultCodeBase:u,countBalls:m,validateMoveStruct:f,findMoveDelta:g}=o(245);e.exports=class{constructor(e){e?c(e)?this.puzzle=e:i(e)?this.puzzle=d(e):i(e,2)?this.puzzle=d(e,2):this.puzzle=a():this.puzzle=a(),this.moveHistory=[]}validateMove(e,t){if(!f(e))return null;const o=e.from.x,a=e.from.y,s=e.to.x,l=e.to.y,i=g(o,a,s,l);if(!i)return null;const c=i.middle,d=o+c.x,h=a+c.y;if(o<0||o>=n)return null;if(a<0||a>=r)return null;if(s<0||s>=n)return null;if(l<0||l>=r)return null;const u=t?0:1,m=t?0:1,p=t?1:0;return this.puzzle[a][o]!==u||this.puzzle[h][d]!==m||this.puzzle[l][s]!==p?null:{matchingDelta:i,moveMid:{x:d,y:h}}}allValidMoves(e){const t=[];for(let o=0;o<r;o++)for(let a=0;a<n;a++)if(1===this.puzzle[o][a])for(let n=0;n<l;n++){const r=s[n],l=e?{from:{x:a-r.x,y:o-r.y},to:{x:a,y:o}}:{from:{x:a,y:o},to:{x:a+r.x,y:o+r.y}};this.validateMove(l,e)&&t.push(l)}return t}makeMove(e,t,o){const a=this.validateMove(e,t);if(!a)return!1;const{moveMid:n}=a,r=e.from,s=e.to,l=t?1:0,i=t?1:0,c=t?0:1;return this.puzzle[r.y][r.x]=l,this.puzzle[n.y][n.x]=i,this.puzzle[s.y][s.x]=c,o||this.moveHistory.push(e),!0}toggleBall(e,t,o){const a=this.puzzle[t][e];return 2!==a&&(this.puzzle[t][e]=0===a?1:0,o||this.moveHistory.push({toggle:{x:e,y:t}}),!0)}undo(e){const t=this.moveHistory.pop();if(!t)return;const{toggle:o}=t;o?this.toggleBall(o.x,o.y,!0):this.makeMove(t,!e,!0)}countBalls(){return m(this.puzzle)}puzzleToString(){return this.puzzle.map((e=>Array.from(e).map((e=>[".","O"," "][e])).join(" "))).join("\n")}code(e=u){return h(this.puzzle,e)}}},144:e=>{const t=e=>{const t=Math.floor(e/36e5),o=Math.floor(e/6e4)%60,a=Math.floor(e/1e3)%60,n=e%1e3;return`${t.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}.${n.toString().padStart(3,"0")}`};e.exports={distanceNoSqrt:(e,t,o,a)=>{const n=o-e,r=a-t;return n*n+r*r},byteToBits:e=>e.toString(2).padStart(8,"0"),byteFromBitRemainder:e=>parseInt(e.padEnd(8,"0"),2),formatTime:t,progressPercent:(e,t)=>{const o=e.toString().padStart(2,"0").padStart(4," "),a=` [32m${o.slice(0,-1)}.${o.slice(-1)}%[39m`;process.stdout.cursorTo(t),process.stdout.write(a)},doneHavingStartedAt:e=>{const o=Date.now()-e;process.stdout.write(`\nDone after ${t(o)}\n`)},loadImage:e=>new Promise(((t,o)=>{const a=new Image;a.crossOrigin="Anonymous",a.src=e,a.onload=()=>{t(a)},a.onerror=e=>{o(e)}})),sendPost:async(e,t)=>{const o=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),a=await o.json();return a.redirect&&(window.location=a.redirect),a}}},245:e=>{const t=()=>{const e=[new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2])];return Object.seal(e),e},o=[{name:"right",x:2,y:0,middle:{x:1,y:0}},{name:"up",x:0,y:-2,middle:{x:0,y:-1}},{name:"left",x:-2,y:0,middle:{x:-1,y:0}},{name:"down",x:0,y:2,middle:{x:0,y:1}}],a=[[2,1,0,5,4,3,12,11,10,9,8,7,6,19,18,17,16,15,14,13,26,25,24,23,22,21,20,29,28,27,32,31,30],[30,31,32,27,28,29,20,21,22,23,24,25,26,13,14,15,16,17,18,19,6,7,8,9,10,11,12,3,4,5,0,1,2],[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],[6,13,20,7,14,21,0,3,8,15,22,27,30,1,4,9,16,23,28,31,2,5,10,17,24,29,32,11,18,25,12,19,26],[26,19,12,25,18,11,32,29,24,17,10,5,2,31,28,23,16,9,4,1,30,27,22,15,8,3,0,21,14,7,20,13,6],[12,19,26,11,18,25,2,5,10,17,24,29,32,1,4,9,16,23,28,31,0,3,8,15,22,27,30,7,14,21,6,13,20],[20,13,6,21,14,7,30,27,22,15,8,3,0,31,28,23,16,9,4,1,32,29,24,17,10,5,2,25,18,11,26,19,12]],n=a.length,r=(e,t)=>{const o=a[t];let n="";for(let t=0;t<33;t++)n+=e.charAt(o[t]);return n},s=parseInt("1".repeat(33),2),l=[];for(let e=2;e<=36;e++)l[e]=(i=e,s.toString(i).length);var i;const c=(e,t,o)=>parseInt(e,t).toString(o).padStart(l[o],"0"),d=[];for(let e=2;e<=36;e++)d[e]=new RegExp(`^[${"0123456789abcdefghijklmnopqrstuvwxyz".slice(0,e)}]{${l[e]}}$`);const h=[4,8,10,14,18,22,24,28],u=h.length,m=2**u;e.exports={emptyBoard:t,width:7,height:7,slotCount:33,validMoveDeltas:o,validMoveDeltaCount:4,findMoveDelta:(e,t,a,n)=>{const r=a-e,s=n-t;let l=null;for(let e=0;e<4;e++){const t=o[e];t.x===r&&t.y===s&&(l=t)}return l},codeRegExps:d,isCode:(e,t=36)=>d[t].test(e),isPuzzle:e=>{if(!e)return!1;const o=t();if(!Array.isArray(e))return!1;const a=e.length;if(7!==a)return!1;for(let t=0;t<a;t++){const a=e[t];if(!(a instanceof Uint8Array))return!1;const n=a.length;if(7!==n)return!1;for(let e=0;e<n;e++){const n=a[e];if(0!==n&&1!==n&&2!==n)return!1;if(2===o[t][e]!=(2===n))return!1}}return!0},copyPuzzle:e=>{const t=[];for(let o=0;o<7;o++)t[o]=new Uint8Array(e[o]);return Object.seal(t),t},codeToPuzzle:(e,o=36)=>{const a=2===o?e:c(e,o,2),n=t();let r=0;for(let e=0;e<7;e++){const t=n[e];for(let e=0;e<7;e++)2!==t[e]&&(t[e]=a[r],r++)}return n},puzzleToCode:(e,t=36)=>{let o="";for(let t=0;t<7;t++){const a=e[t];for(let e=0;e<7;e++){const t=a[e];2!==t&&(o+=t)}}return 2===t?o:c(o,2,t)},convertCodeBase:c,defaultCodeBase:36,transform:r,isometryCount:n,codeImages:e=>{const t=new Set;t.add(e);for(let o=0;o<n;o++)t.add(r(e,o));return Array.from(t)},countBalls:e=>{let t=0;for(let o=0;o<7;o++)for(let a=0;a<7;a++)1===e[o][a]&&t++;return t},codeSampleRange:m,sampleCode:e=>{let t="";for(let o=0;o<u;o++)t+=e.charAt(h[o]);return parseInt(t,2)},validateMoveStruct:e=>e&&e.from&&"number"==typeof e.from.x&&"number"==typeof e.from.y&&e.to&&"number"==typeof e.to.x&&"number"==typeof e.from.y}}},t={};function o(a){var n=t[a];if(void 0!==n)return n.exports;var r=t[a]={exports:{}};return e[a](r,r.exports,o),r.exports}(()=>{const{renderNav:e}=o(242),t=e=>React.createElement(React.Fragment,null,e.signedIn?React.createElement("div",{className:"buttonContainerFlex buttonContainerHoriz"},React.createElement("a",{href:"/explore",className:"btn btn-success btn-xl"},React.createElement("i",{className:"fa-solid fa-puzzle-piece"})," Play"),React.createElement("a",{href:"/create",className:"btn btn-warning btn-xl"},React.createElement("i",{className:"fa-solid fa-pen-to-square"})," Create")):React.createElement(React.Fragment,null,React.createElement("div",{className:"buttonContainerFlex"},React.createElement("a",{href:"/login?signup",className:"btn btn-primary btn-xl"},"Get started")),React.createElement("div",{className:"loginSignupSwitch"},"Already have an account? ",React.createElement("a",{href:"/login"},"Log in"))));window.onload=()=>{const o=document.getElementById("heroBtnRoot"),a=Boolean(o.dataset.username);e(!0,!a),ReactDOM.createRoot(o).render(React.createElement(t,{signedIn:a}))}})()})();