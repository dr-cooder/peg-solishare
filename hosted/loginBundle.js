(()=>{var e={115:e=>{e.exports=e=>{const{username:t,dontShowLogin:a,dontShowTitle:n}=e;return React.createElement("nav",{className:"navFlex"},React.createElement("div",null,n?null:React.createElement("a",{href:"/",className:"logo logoLink"},React.createElement("span",{className:"logoPegSoli"},"Peg Soli"),React.createElement("span",{className:"logoShare"},"Share"))),React.createElement("div",null,a?null:t?React.createElement(React.Fragment,null,"Welcome, ",React.createElement("span",{className:"welcomeUsername"},t)," | ",React.createElement("a",{href:"/logout"},"Log out")):React.createElement(React.Fragment,null,React.createElement("a",{className:"btn btn-primary",href:"/login?signup"},"Sign up")," or ",React.createElement("a",{href:"/login"},"log in"))))}},718:e=>{const t=e=>{const t=Math.floor(e/36e5),a=Math.floor(e/6e4)%60,n=Math.floor(e/1e3)%60,r=e%1e3;return`${t.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}.${r.toString().padStart(3,"0")}`};e.exports={distanceNoSqrt:(e,t,a,n)=>{const r=a-e,o=n-t;return r*r+o*o},byteToBits:e=>e.toString(2).padStart(8,"0"),byteFromBitRemainder:e=>parseInt(e.padEnd(8,"0"),2),formatTime:t,progressPercent:(e,t)=>{const a=e.toString().padStart(2,"0").padStart(4," "),n=` [32m${a.slice(0,-1)}.${a.slice(-1)}%[39m`;process.stdout.cursorTo(t),process.stdout.write(n)},doneHavingStartedAt:e=>{const a=Date.now()-e;process.stdout.write(`\nDone after ${t(a)}\n`)},loadImage:e=>new Promise(((t,a)=>{const n=new Image;n.crossOrigin="Anonymous",n.src=e,n.onload=()=>{t(n)},n.onerror=e=>{a(e)}})),sendPost:async(e,t,a)=>{const n=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),r=await n.json();r.redirect&&(window.location=r.redirect),a&&a(r)}}},242:(e,t,a)=>{const n=a(115);e.exports={renderNav:(e,t)=>{const a=document.getElementById("navRoot");ReactDOM.createRoot(a).render(React.createElement(n,{username:a.dataset.username,dontShowTitle:e,dontShowLogin:t}))}}}},t={};function a(n){var r=t[n];if(void 0!==r)return r.exports;var o=t[n]={exports:{}};return e[n](o,o.exports,a),o.exports}(()=>{const{sendPost:e}=a(718),{renderNav:t}=a(242),n=e=>console.log(e),r=t=>{t.preventDefault();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,o=t.target.querySelector("#_csrf").value;return a&&r?(e(t.target.action,{username:a,pass:r,_csrf:o}),!1):(n("Username or password is empty!"),!1)},o=t=>{t.preventDefault();const a=t.target.querySelector("#user").value,r=t.target.querySelector("#pass").value,o=t.target.querySelector("#pass2").value,c=t.target.querySelector("#_csrf").value;return a&&r&&o?r!==o?(n("Passwords do not match!"),!1):(e(t.target.action,{username:a,pass:r,pass2:o,_csrf:c}),!1):(n("All fields are required!"),!1)},c=e=>React.createElement(React.Fragment,null,React.createElement("h1",{className:"loginTitle"},"Log in"),React.createElement("form",{id:"loginForm",name:"loginForm",onSubmit:r,action:"/login",method:"POST",className:"mainForm"},React.createElement("div",{className:"formTextboxes"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"}),React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("div",{className:"buttonContainerFlex"},React.createElement("input",{className:"btn btn-primary btn-lg",type:"submit",value:"Log in"})),React.createElement("div",{className:"loginSignupSwitch"},"Don't have an account? ",React.createElement("a",{href:"#",onClick:e.onSwitch},"Sign up")))),s=e=>React.createElement(React.Fragment,null,React.createElement("h1",{className:"loginTitle"},"Sign up"),React.createElement("form",{id:"signupForm",name:"signupForm",onSubmit:o,action:"/signup",method:"POST",className:"mainForm"},React.createElement("div",{className:"formTextboxes"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"}),React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"}),React.createElement("label",{htmlFor:"pass2"},"Retype password: "),React.createElement("input",{id:"pass2",type:"password",name:"pass2",placeholder:"retype password"})),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:e.csrf}),React.createElement("div",{className:"buttonContainerFlex"},React.createElement("input",{className:"btn btn-primary btn-lg",type:"submit",value:"Sign up"})),React.createElement("div",{className:"loginSignupSwitch"},"Already have an account? ",React.createElement("a",{href:"#",onClick:e.onSwitch},"Log in"))));window.onload=async()=>{const e=await fetch("/token"),a=await e.json();t(!1,!0);const n=document.getElementById("loginContentRoot"),{initial:r}=n.dataset,o=ReactDOM.createRoot(n),l=e=>{e?(document.title="Sign up - Peg SoliShare",o.render(React.createElement(s,{csrf:a.csrfToken,onSwitch:()=>l(!1)}))):(document.title="Login - Peg SoliShare",o.render(React.createElement(c,{csrf:a.csrfToken,onSwitch:()=>l(!0)})))};l("signup"===r)}})()})();