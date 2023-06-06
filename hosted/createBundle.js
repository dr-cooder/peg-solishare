(()=>{var e={35:e=>{const{Component:t}=React;e.exports=class extends t{constructor(e){super(e);const t={color:"danger",message:"",linkText:"",linkHref:"#"};this.state=t,this.clearMessage=()=>{this.setState(t)},this.showSpinner=()=>{this.setState({color:"white",message:React.createElement("span",{className:"spinner-border",role:"status","aria-hidden":"true"}),linkText:"",linkHref:"#"})},this.showError=(e,t,a)=>{this.setState({color:"danger",message:e,linkText:t,linkHref:a||"#"})},this.showSuccess=(e,t,a)=>{this.setState({color:"success",message:e,linkText:t,linkHref:a||"#"})}}render(){return React.createElement("div",{className:"errorMessageContainer"},React.createElement("h3",{className:`text-${this.state.color}`},this.state.message),React.createElement("a",{href:this.state.linkHref},this.state.linkText))}}},489:(e,t,a)=>{const{Component:o,createRef:n}=React,{distanceNoSqrt:r,loadImage:s}=a(144),l=a(520),{emptyBoard:i,width:c,height:d,defaultCodeBase:u,validateMoveStruct:h}=a(245);e.exports=class extends o{constructor(e){super(e),this.state={disabled:!1,holdingBall:!1,noCanvas:!1},this.canvasRef=n(),this.canvasOuterRef=n(),this.game=new l(e.basis),this.code=(e=u)=>this.game.code(e),this.history=()=>this.game.moveHistory,this.editMode=e.editMode,this.onMove=e.onMove||(()=>{}),this.onSolve=e.onSolve||(()=>{}),this.onNoCanvas=e.onNoCanvas||(()=>{}),this.undo=()=>{this.game.undo(this.editMode),this.hintOnDisplay=null,this.onMove()},this.hintOnDisplay=null,this.displayHint=e=>{h(e)&&(this.hintOnDisplay=e)}}static getDerivedStateFromProps(e,t){return e.disabled!==t.disabled?{disabled:e.disabled,holdingBall:!e.disabled&&t.holdingBall}:null}componentDidMount(){const e=this.canvasRef.current;if(!e.getContext||!e.getContext("2d"))return this.setState({noCanvas:!0}),void this.onNoCanvas();const t=e.width,a=e.height,o=this.canvasOuterRef.current,n=e.getContext("2d"),l=382/c,u=382/d,h=i(),m=[];for(let e=0;e<d;e++){const t=[],a=u*(e+.5)+109;for(let o=0;o<c;o++)2!==h[e][o]&&(t[o]={x:l*(o+.5)+109,y:a});m[e]=t}const f=Object.entries({board:"board.png",ball:"ball.png",ballShadow:"ball-shadow.png"}),p=f.length,g={};let v=t/2,y=a/2;const x=t=>{if(!t)return;let a,n;const r=t.type.slice(0,5);"touch"===r?(a=t.touches[0].pageX,n=t.touches[0].pageY):"mouse"===r&&(a=t.pageX,n=t.pageY),v=(a-o.offsetLeft)*(e.width/o.offsetWidth),y=(n-o.offsetTop)*(e.height/o.offsetHeight)};let R=Math.floor(c/2),z=Math.floor(d/2);const b=e=>{x(e),R=Math.floor((v-109)/l),z=Math.floor((y-109)/u)};let S=0,w=0;const E=()=>{this.hintOnDisplay=null,this.onMove(),1===this.game.countBalls()&&this.onSolve()},M=e=>{if(this.state.disabled)return;b(e);const t=this.game.puzzle[z];if(t){const e=t[R];if(void 0!==e){const t=m[z][R];r(v,y,t.x,t.y)<400&&("toggleBalls"===this.editMode?this.game.toggleBall(R,z)&&E():1===e&&(this.setState({holdingBall:!0}),S=R,w=z))}}},C=e=>{if(this.state.disabled||!this.state.holdingBall||"toggleBalls"===this.editMode)return;this.setState({holdingBall:!1}),b(e);const t={from:{x:S,y:w},to:{x:R,y:z}};let a;a="solveReverse"===this.editMode?this.game.makeMove({from:t.to,to:t.from},!0):this.game.makeMove(t),a&&E()};o.onmousedown=M,o.onmousemove=x,o.onmouseup=C,o.onmouseout=C,o.ontouchstart=M,o.ontouchmove=x,o.ontouchend=C,o.ontouchcancel=C;const B=()=>{requestAnimationFrame(B),n.clearRect(0,0,t,a),n.drawImage(g.board,0,0,t,a);for(let e=0;e<d;e++)for(let t=0;t<c;t++){const a=m[e][t];a&&(1!==this.game.puzzle[e][t]||this.state.holdingBall&&t===S&&e===w||n.drawImage(g.ballShadow,a.x-26,a.y-26,52,52))}if(this.hintOnDisplay){n.lineWidth=6,n.lineJoin="round",n.strokeStyle="red",n.fillStyle="red";const e=this.hintOnDisplay.from,t=m[e.y][e.x],a=t.x,o=t.y,r=this.hintOnDisplay.to,s=m[r.y][r.x],l=s.x-a,i=s.y-o,c=a+.75*l,d=o+.75*i,u=.05*i,h=.05*l;n.beginPath(),n.moveTo(a+.25*l,o+.25*i),n.lineTo(c,d),n.lineTo(c+u,d+h),n.lineTo(a+.85*l,o+.85*i),n.lineTo(c-u,d-h),n.lineTo(c,d),n.closePath(),n.stroke(),n.fill()}this.state.holdingBall&&n.drawImage(g.ball,v-26,y-26,52,52)},N=[];for(let e=0;e<p;e++)N[e]=s(`assets/img/${f[e][1]}`);Promise.all(N).then((e=>{for(let t=0;t<p;t++)g[f[t][0]]=e[t];B()}))}render(){return React.createElement("div",{ref:this.canvasOuterRef,className:"gameBoardCanvasOuter"},React.createElement("div",{className:"ratio1x1"},React.createElement("div",{className:"ratioContainer"},this.state.noCanvas?React.createElement("div",{className:"gameBoardNoCanvas"},React.createElement("h3",null,"Canvas support is required by Peg SoliShare! Please use a newer browser!")):React.createElement("canvas",{ref:this.canvasRef,className:"gameBoardCanvas",width:"600",height:"600"}))))}}},279:e=>{e.exports=e=>{const{username:t,dontShowLogin:a,dontShowTitle:o}=e;return React.createElement("nav",{className:"navFlex"},React.createElement("div",null,o?null:React.createElement("a",{href:"/",className:"logo logoLink"},React.createElement("span",{className:"logoPegSoli"},"Peg Soli"),React.createElement("span",{className:"logoShare"},"Share"))),React.createElement("div",null,a?null:t?React.createElement(React.Fragment,null,"Welcome, ",React.createElement("span",{className:"welcomeUsername"},t)," | ",React.createElement("a",{href:"/account"},"Settings")," | ",React.createElement("a",{href:"/logout"},"Log out")):React.createElement(React.Fragment,null,React.createElement("a",{className:"btn btn-primary",href:"/login?signup"},"Sign up")," or ",React.createElement("a",{href:"/login"},"log in"))))}},995:(e,t,a)=>{e.exports.ErrorMessage=a(35),e.exports.GameBoardUI=a(489),e.exports.Nav=a(279)},520:(e,t,a)=>{const{emptyBoard:o,width:n,height:r,validMoveDeltas:s,validMoveDeltaCount:l,isCode:i,isPuzzle:c,codeToPuzzle:d,puzzleToCode:u,defaultCodeBase:h,countBalls:m,validateMoveStruct:f,findMoveDelta:p}=a(245);e.exports=class{constructor(e){e?c(e)?this.puzzle=e:i(e)?this.puzzle=d(e):i(e,2)?this.puzzle=d(e,2):this.puzzle=o():this.puzzle=o(),this.moveHistory=[]}validateMove(e,t){if(!f(e))return null;const a=e.from.x,o=e.from.y,s=e.to.x,l=e.to.y,i=p(a,o,s,l);if(!i)return null;const c=i.middle,d=a+c.x,u=o+c.y;if(a<0||a>=n)return null;if(o<0||o>=r)return null;if(s<0||s>=n)return null;if(l<0||l>=r)return null;const h=t?0:1,m=t?0:1,g=t?1:0;return this.puzzle[o][a]!==h||this.puzzle[u][d]!==m||this.puzzle[l][s]!==g?null:{matchingDelta:i,moveMid:{x:d,y:u}}}allValidMoves(e){const t=[];for(let a=0;a<r;a++)for(let o=0;o<n;o++)if(1===this.puzzle[a][o])for(let n=0;n<l;n++){const r=s[n],l=e?{from:{x:o-r.x,y:a-r.y},to:{x:o,y:a}}:{from:{x:o,y:a},to:{x:o+r.x,y:a+r.y}};this.validateMove(l,e)&&t.push(l)}return t}makeMove(e,t,a){const o=this.validateMove(e,t);if(!o)return!1;const{moveMid:n}=o,r=e.from,s=e.to,l=t?1:0,i=t?1:0,c=t?0:1;return this.puzzle[r.y][r.x]=l,this.puzzle[n.y][n.x]=i,this.puzzle[s.y][s.x]=c,a||this.moveHistory.push(e),!0}toggleBall(e,t,a){const o=this.puzzle[t][e];return 2!==o&&(this.puzzle[t][e]=0===o?1:0,a||this.moveHistory.push({toggle:{x:e,y:t}}),!0)}undo(e){const t=this.moveHistory.pop();if(!t)return;const{toggle:a}=t;a?this.toggleBall(a.x,a.y,!0):this.makeMove(t,!e,!0)}countBalls(){return m(this.puzzle)}puzzleToString(){return this.puzzle.map((e=>Array.from(e).map((e=>[".","O"," "][e])).join(" "))).join("\n")}code(e=h){return u(this.puzzle,e)}}},144:e=>{const t=e=>{const t=Math.floor(e/36e5),a=Math.floor(e/6e4)%60,o=Math.floor(e/1e3)%60,n=Math.floor(e)%1e3;return`${t.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}.${n.toString().padStart(3,"0")}`};e.exports={distanceNoSqrt:(e,t,a,o)=>{const n=a-e,r=o-t;return n*n+r*r},byteToBits:e=>e.toString(2).padStart(8,"0"),byteFromBitRemainder:e=>parseInt(e.padEnd(8,"0"),2),formatTime:t,progressPercent:(e,a,o)=>{let n="";o&&e>0&&(n=` ETA [93m${t((Date.now()-o)/e*(1e3-e))}[39m`),1e3===e&&(n="[K");const r=e.toString().padStart(2,"0").padStart(4," "),s=` [32m${r.slice(0,-1)}.${r.slice(-1)}%[39m${n}`;process.stdout.cursorTo(a),process.stdout.write(s)},doneHavingStartedAt:e=>{const a=Date.now()-e;process.stdout.write(`\nDone after ${t(a)}\n`)},loadImage:e=>new Promise(((t,a)=>{const o=new Image;o.crossOrigin="Anonymous",o.src=e,o.onload=()=>{t(o)},o.onerror=e=>{a(e)}})),sendPost:async(e,t)=>{const a=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),o=await a.json();return o.redirect&&(window.location=o.redirect),o}}},245:e=>{const t=()=>{const e=[new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2])];return Object.seal(e),e},a=[{name:"right",x:2,y:0,middle:{x:1,y:0}},{name:"up",x:0,y:-2,middle:{x:0,y:-1}},{name:"left",x:-2,y:0,middle:{x:-1,y:0}},{name:"down",x:0,y:2,middle:{x:0,y:1}}],o=[[2,1,0,5,4,3,12,11,10,9,8,7,6,19,18,17,16,15,14,13,26,25,24,23,22,21,20,29,28,27,32,31,30],[30,31,32,27,28,29,20,21,22,23,24,25,26,13,14,15,16,17,18,19,6,7,8,9,10,11,12,3,4,5,0,1,2],[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],[6,13,20,7,14,21,0,3,8,15,22,27,30,1,4,9,16,23,28,31,2,5,10,17,24,29,32,11,18,25,12,19,26],[26,19,12,25,18,11,32,29,24,17,10,5,2,31,28,23,16,9,4,1,30,27,22,15,8,3,0,21,14,7,20,13,6],[12,19,26,11,18,25,2,5,10,17,24,29,32,1,4,9,16,23,28,31,0,3,8,15,22,27,30,7,14,21,6,13,20],[20,13,6,21,14,7,30,27,22,15,8,3,0,31,28,23,16,9,4,1,32,29,24,17,10,5,2,25,18,11,26,19,12]],n=o.length,r=(e,t)=>{const a=o[t];let n="";for(let t=0;t<33;t++)n+=e.charAt(a[t]);return n},s=parseInt("1".repeat(33),2),l=[];for(let e=2;e<=36;e++)l[e]=(i=e,s.toString(i).length);var i;const c=(e,t,a)=>parseInt(e,t).toString(a).padStart(l[a],"0"),d=[];for(let e=2;e<=36;e++)d[e]=new RegExp(`^[${"0123456789abcdefghijklmnopqrstuvwxyz".slice(0,e)}]{${l[e]}}$`);const u=[1,4,9,13,14,15,16,17,18,19,23,28,31],h=u.length,m=2**h;e.exports={emptyBoard:t,width:7,height:7,slotCount:33,validMoveDeltas:a,validMoveDeltaCount:4,findMoveDelta:(e,t,o,n)=>{const r=o-e,s=n-t;let l=null;for(let e=0;e<4;e++){const t=a[e];t.x===r&&t.y===s&&(l=t)}return l},codeRegExps:d,isCode:(e,t=36)=>d[t].test(e),isPuzzle:e=>{if(!e)return!1;const a=t();if(!Array.isArray(e))return!1;const o=e.length;if(7!==o)return!1;for(let t=0;t<o;t++){const o=e[t];if(!(o instanceof Uint8Array))return!1;const n=o.length;if(7!==n)return!1;for(let e=0;e<n;e++){const n=o[e];if(0!==n&&1!==n&&2!==n)return!1;if(2===a[t][e]!=(2===n))return!1}}return!0},copyPuzzle:e=>{const t=[];for(let a=0;a<7;a++)t[a]=new Uint8Array(e[a]);return Object.seal(t),t},codeToPuzzle:(e,a=36)=>{const o=2===a?e:c(e,a,2),n=t();let r=0;for(let e=0;e<7;e++){const t=n[e];for(let e=0;e<7;e++)2!==t[e]&&(t[e]=o[r],r++)}return n},puzzleToCode:(e,t=36)=>{let a="";for(let t=0;t<7;t++){const o=e[t];for(let e=0;e<7;e++){const t=o[e];2!==t&&(a+=t)}}return 2===t?a:c(a,2,t)},convertCodeBase:c,defaultCodeBase:36,transform:r,isometryCount:n,codeImages:e=>{const t=new Set;t.add(e);for(let a=0;a<n;a++)t.add(r(e,a));return Array.from(t)},countBalls:e=>{let t=0;for(let a=0;a<7;a++)for(let o=0;o<7;o++)1===e[a][o]&&t++;return t},codeSampleRange:m,sampleCode:e=>{let t="";for(let a=0;a<h;a++)t+=e.charAt(u[a]);return parseInt(t,2)},validateMoveStruct:e=>e&&e.from&&"number"==typeof e.from.x&&"number"==typeof e.from.y&&e.to&&"number"==typeof e.to.x&&"number"==typeof e.from.y}}},t={};function a(o){var n=t[o];if(void 0!==n)return n.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,a),r.exports}(()=>{const{sendPost:e}=a(144),{GameBoardUI:t,ErrorMessage:o}=a(995),{useState:n,createRef:r}=React,s=a=>{const s=[{value:"toggleBalls",name:"Toggle balls manually"},{value:"solveReverse",name:"Solve in reverse"}],l=s[0].value,[i,c]=n(l),[d,u]=n(!1),[h,m]=n(!1),f=r(),p=r(),g=r(),v=`${"0".repeat(16)}1${"0".repeat(16)}`;return React.createElement(React.Fragment,null,React.createElement(t,{ref:f,disabled:d||h,basis:v,editMode:l,onNoCanvas:()=>m(!0)}),React.createElement("h3",null,"Edit mode"),React.createElement("div",{className:"editModeContainer"},s.map(((e,t)=>React.createElement("div",{className:"form-check",key:t},React.createElement("input",{className:"form-check-input",type:"radio",name:"editMode",disabled:d||h,checked:i===e.value,onChange:()=>(e=>{f.current.editMode=e,c(e)})(e.value)}),React.createElement("label",{htmlFor:"toggleBall"},e.name))))),React.createElement("div",{className:"buttonContainerFlex buttonContainerVert"},React.createElement("button",{id:"undoButton",type:"button",className:"btn btn-secondary btn-lg",disabled:d||h,onClick:()=>f.current.undo()},React.createElement("i",{className:"fa-solid fa-arrow-rotate-left"})," Undo"),React.createElement("h3",{className:"spacedHeader"},"Name and upload"),React.createElement("input",{type:"text",ref:p,disabled:d||h}),React.createElement("button",{type:"button",className:"btn btn-success btn-lg",disabled:d||h,onClick:async()=>{u(!0);const t=g.current;t.clearMessage();const{error:o}=await e("/upload",{title:p.current.value,code:f.current.code(),_csrf:a.csrf});o?t.showError(o):(t.showSuccess("Puzzle uploaded!","Go to puzzle explorer","/explore"),m(!0)),u(!1)}},d?React.createElement("span",{className:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"}):React.createElement("i",{className:"fa-solid fa-"+(h?"check":"upload")}),h?" Uploaded":" Upload")),React.createElement(o,{ref:g}))};window.onload=async()=>{const e=await fetch("/token"),t=await e.json();ReactDOM.createRoot(document.getElementById("createUiRoot")).render(React.createElement(s,{csrf:t.csrfToken}))}})()})();