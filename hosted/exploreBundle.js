(()=>{var e={115:e=>{e.exports=e=>{const{username:t,dontShowLogin:n,dontShowTitle:r}=e;return React.createElement("nav",{className:"navFlex"},React.createElement("div",null,r?null:React.createElement("a",{href:"/",className:"logo logoLink"},React.createElement("span",{className:"logoPegSoli"},"Peg Soli"),React.createElement("span",{className:"logoShare"},"Share"))),React.createElement("div",null,n?null:t?React.createElement(React.Fragment,null,"Welcome, ",React.createElement("span",{className:"welcomeUsername"},t)," | ",React.createElement("a",{href:"/account"},"Settings")," | ",React.createElement("a",{href:"/logout"},"Log out")):React.createElement(React.Fragment,null,React.createElement("a",{className:"btn btn-primary",href:"/login?signup"},"Sign up")," or ",React.createElement("a",{href:"/login"},"log in"))))}},242:(e,t,n)=>{const r=n(115);e.exports={renderNav:(e,t)=>{const n=document.getElementById("navRoot");ReactDOM.createRoot(n).render(React.createElement(r,{username:n.dataset.username,dontShowTitle:e,dontShowLogin:t}))}}},175:e=>{const t=()=>{const e=[new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([0,0,0,0,0,0,0]),new Uint8Array([2,2,0,0,0,2,2]),new Uint8Array([2,2,0,0,0,2,2])];return Object.seal(e),e},n=[{name:"right",x:2,y:0,middle:{x:1,y:0}},{name:"up",x:0,y:-2,middle:{x:0,y:-1}},{name:"left",x:-2,y:0,middle:{x:-1,y:0}},{name:"down",x:0,y:2,middle:{x:0,y:1}}],r=[[2,1,0,5,4,3,12,11,10,9,8,7,6,19,18,17,16,15,14,13,26,25,24,23,22,21,20,29,28,27,32,31,30],[30,31,32,27,28,29,20,21,22,23,24,25,26,13,14,15,16,17,18,19,6,7,8,9,10,11,12,3,4,5,0,1,2],[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],[6,13,20,7,14,21,0,3,8,15,22,27,30,1,4,9,16,23,28,31,2,5,10,17,24,29,32,11,18,25,12,19,26],[26,19,12,25,18,11,32,29,24,17,10,5,2,31,28,23,16,9,4,1,30,27,22,15,8,3,0,21,14,7,20,13,6],[12,19,26,11,18,25,2,5,10,17,24,29,32,1,4,9,16,23,28,31,0,3,8,15,22,27,30,7,14,21,6,13,20],[20,13,6,21,14,7,30,27,22,15,8,3,0,31,28,23,16,9,4,1,32,29,24,17,10,5,2,25,18,11,26,19,12]],a=r.length,o=(e,t)=>{const n=r[t];let a="";for(let t=0;t<33;t++)a+=e.charAt(n[t]);return a},l=parseInt("1".repeat(33),2),c=[];for(let e=2;e<=36;e++)c[e]=(s=e,l.toString(s).length);var s;const i=(e,t,n)=>parseInt(e,t).toString(n).padStart(c[n],"0"),m=[];for(let e=2;e<=36;e++)m[e]=new RegExp(`^[${"0123456789abcdefghijklmnopqrstuvwxyz".slice(0,e)}]{${c[e]}}$`);const u=[4,8,10,14,18,22,24,28],d=u.length,f=2**d;e.exports={emptyBoard:t,width:7,height:7,slotCount:33,validMoveDeltas:n,validMoveDeltaCount:4,findMoveDelta:(e,t,r,a)=>{const o=r-e,l=a-t;let c=null;for(let e=0;e<4;e++){const t=n[e];t.x===o&&t.y===l&&(c=t)}return c},codeRegExps:m,isCode:(e,t=36)=>m[t].test(e),isPuzzle:e=>{if(!e)return!1;const n=t();if(!Array.isArray(e))return!1;const r=e.length;if(7!==r)return!1;for(let t=0;t<r;t++){const r=e[t];if(!(r instanceof Uint8Array))return!1;const a=r.length;if(7!==a)return!1;for(let e=0;e<a;e++){const a=r[e];if(0!==a&&1!==a&&2!==a)return!1;if(2===n[t][e]!=(2===a))return!1}}return!0},copyPuzzle:e=>{const t=[];for(let n=0;n<7;n++)t[n]=new Uint8Array(e[n]);return Object.seal(t),t},codeToPuzzle:(e,n=36)=>{const r=2===n?e:i(e,n,2),a=t();let o=0;for(let e=0;e<7;e++){const t=a[e];for(let e=0;e<7;e++)2!==t[e]&&(t[e]=r[o],o++)}return a},puzzleToCode:(e,t=36)=>{let n="";for(let t=0;t<7;t++){const r=e[t];for(let e=0;e<7;e++){const t=r[e];2!==t&&(n+=t)}}return 2===t?n:i(n,2,t)},convertCodeBase:i,defaultCodeBase:36,transform:o,isometryCount:a,codeImages:e=>{const t=new Set;t.add(e);for(let n=0;n<a;n++)t.add(o(e,n));return Array.from(t)},countBalls:e=>{let t=0;for(let n=0;n<7;n++)for(let r=0;r<7;r++)1===e[n][r]&&t++;return t},codeSampleRange:f,sampleCode:e=>{let t="";for(let n=0;n<d;n++)t+=e.charAt(u[n]);return parseInt(t,2)},validateMoveStruct:e=>e&&e.from&&"number"==typeof e.from.x&&"number"==typeof e.from.y&&e.to&&"number"==typeof e.to.x&&"number"==typeof e.from.y}}},t={};function n(r){var a=t[r];if(void 0!==a)return a.exports;var o=t[r]={exports:{}};return e[r](o,o.exports,n),o.exports}(()=>{const{renderNav:e}=n(242),{defaultCodeBase:t,convertCodeBase:r,emptyBoard:a,width:o,height:l}=n(175),c=a(),s=e=>{const{binCode:t}=e;let n=0;const r=[];for(let e=0;e<l;e++)for(let a=0;a<o;a++){const l=c[e][a];r.push(React.createElement("div",{key:e*o+a,className:"ratio1x1"},React.createElement("div",{className:`ratioContainer${2!==l&&" puzzleThumbSlot"}`},"1"===t.charAt(n)&&React.createElement("div",{className:"puzzleThumbBall"})))),2!==l&&n++}return React.createElement("div",{className:"puzzleThumbGrid"},r)},i=e=>{if(0===e.puzzles.length)return React.createElement("h3",{className:"noPuzzles"},"No one's around to help. 😼");const n=e.puzzles.map((e=>React.createElement("a",{href:"/play",key:e._id,className:"puzzleTile"},React.createElement(s,{binCode:r(e.code,t,2)}),React.createElement("div",{className:"puzzleTileTitle"},e.title),React.createElement("div",null,"By ",e.creatorName))));return React.createElement("div",{className:"puzzleList"},n)};window.onload=async()=>{const t=await fetch("/token"),n=(await t.json()).csrfToken,r=document.getElementById("puzzleListRoot"),a=ReactDOM.createRoot(r);e(),(async(e,t)=>{const n=await fetch("/get-puzzles"),r=await n.json();e.render(React.createElement(i,{csrf:t,puzzles:r.puzzles}))})(a,n)}})()})();