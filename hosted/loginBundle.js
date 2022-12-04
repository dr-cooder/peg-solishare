(()=>{var e={689:e=>{const{Component:t}=React;e.exports=class extends t{constructor(e){super(e),this.state={color:"danger",message:"",linkText:"",linkHref:"#"},this.clearMessage=()=>{this.setState({color:"danger",message:"",linkText:"",linkHref:"#"})},this.showError=e=>{this.setState({color:"danger",message:e,linkText:"",linkHref:"#"})},this.showSuccess=(e,t,a)=>{this.setState({color:"success",message:e,linkText:t,linkHref:a||"#"})}}render(){return React.createElement("div",{className:"errorMessageContainer"},React.createElement("h3",{className:`text-${this.state.color}`},this.state.message),React.createElement("a",{href:this.state.linkHref},this.state.linkText))}}},115:e=>{e.exports=e=>{const{username:t,dontShowLogin:a,dontShowTitle:r}=e;return React.createElement("nav",{className:"navFlex"},React.createElement("div",null,r?null:React.createElement("a",{href:"/",className:"logo logoLink"},React.createElement("span",{className:"logoPegSoli"},"Peg Soli"),React.createElement("span",{className:"logoShare"},"Share"))),React.createElement("div",null,a?null:t?React.createElement(React.Fragment,null,"Welcome, ",React.createElement("span",{className:"welcomeUsername"},t)," | ",React.createElement("a",{href:"/logout"},"Log out")):React.createElement(React.Fragment,null,React.createElement("a",{className:"btn btn-primary",href:"/login?signup"},"Sign up")," or ",React.createElement("a",{href:"/login"},"log in"))))}},718:e=>{const t=e=>{const t=Math.floor(e/36e5),a=Math.floor(e/6e4)%60,r=Math.floor(e/1e3)%60,n=e%1e3;return`${t.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}.${n.toString().padStart(3,"0")}`};e.exports={distanceNoSqrt:(e,t,a,r)=>{const n=a-e,s=r-t;return n*n+s*s},byteToBits:e=>e.toString(2).padStart(8,"0"),byteFromBitRemainder:e=>parseInt(e.padEnd(8,"0"),2),formatTime:t,progressPercent:(e,t)=>{const a=e.toString().padStart(2,"0").padStart(4," "),r=` [32m${a.slice(0,-1)}.${a.slice(-1)}%[39m`;process.stdout.cursorTo(t),process.stdout.write(r)},doneHavingStartedAt:e=>{const a=Date.now()-e;process.stdout.write(`\nDone after ${t(a)}\n`)},loadImage:e=>new Promise(((t,a)=>{const r=new Image;r.crossOrigin="Anonymous",r.src=e,r.onload=()=>{t(r)},r.onerror=e=>{a(e)}})),sendPost:async(e,t)=>{const a=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),r=await a.json();return r.redirect&&(window.location=r.redirect),r}}},242:(e,t,a)=>{const r=a(115);e.exports={renderNav:(e,t)=>{const a=document.getElementById("navRoot");ReactDOM.createRoot(a).render(React.createElement(r,{username:a.dataset.username,dontShowTitle:e,dontShowLogin:t}))}}}},t={};function a(r){var n=t[r];if(void 0!==n)return n.exports;var s=t[r]={exports:{}};return e[r](s,s.exports,a),s.exports}(()=>{const{sendPost:e}=a(718),{renderNav:t}=a(242),{createRef:r}=React,n=a(689),s=t=>{const a=r();return React.createElement(React.Fragment,null,React.createElement("h1",{className:"loginTitle"},"Log in"),React.createElement("form",{id:"loginForm",name:"loginForm",onSubmit:t=>(async(t,a)=>{t.preventDefault(),a.clearMessage();const r=t.target.querySelector("#user").value,n=t.target.querySelector("#pass").value,s=t.target.querySelector("#_csrf").value;if(!r||!n)return a.showError("Username or password is empty!"),!1;const{error:o}=await e(t.target.action,{username:r,pass:n,_csrf:s});return o&&a.showError(o),!1})(t,a.current),action:"/login",method:"POST",className:"mainForm"},React.createElement("div",{className:"formTextboxes"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"}),React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"})),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:t.csrf}),React.createElement("div",{className:"buttonContainerFlex"},React.createElement("input",{className:"btn btn-primary btn-lg",type:"submit",value:"Log in"})),React.createElement("div",{className:"loginSignupSwitch"},"Don't have an account? ",React.createElement("a",{href:"#",onClick:t.onSwitch},"Sign up"))),React.createElement(n,{ref:a}))},o=t=>{const a=r();return React.createElement(React.Fragment,null,React.createElement("h1",{className:"loginTitle"},"Sign up"),React.createElement("form",{id:"signupForm",name:"signupForm",onSubmit:t=>(async(t,a)=>{t.preventDefault(),a.clearMessage();const r=t.target.querySelector("#user").value,n=t.target.querySelector("#pass").value,s=t.target.querySelector("#pass2").value,o=t.target.querySelector("#_csrf").value;if(!r||!n||!s)return a.showError("All fields are required!"),!1;if(n!==s)return a.showError("Passwords do not match!"),!1;const{error:c}=await e(t.target.action,{username:r,pass:n,pass2:s,_csrf:o});return c&&a.showError(c),!1})(t,a.current),action:"/signup",method:"POST",className:"mainForm"},React.createElement("div",{className:"formTextboxes"},React.createElement("label",{htmlFor:"username"},"Username: "),React.createElement("input",{id:"user",type:"text",name:"username",placeholder:"username"}),React.createElement("label",{htmlFor:"pass"},"Password: "),React.createElement("input",{id:"pass",type:"password",name:"pass",placeholder:"password"}),React.createElement("label",{htmlFor:"pass2"},"Retype password: "),React.createElement("input",{id:"pass2",type:"password",name:"pass2",placeholder:"retype password"})),React.createElement("input",{id:"_csrf",type:"hidden",name:"_csrf",value:t.csrf}),React.createElement("div",{className:"buttonContainerFlex"},React.createElement("input",{className:"btn btn-primary btn-lg",type:"submit",value:"Sign up"})),React.createElement("div",{className:"loginSignupSwitch"},"Already have an account? ",React.createElement("a",{href:"#",onClick:t.onSwitch},"Log in"))),React.createElement(n,{ref:a}))};window.onload=async()=>{const e=await fetch("/token"),a=await e.json();t(!1,!0);const r=document.getElementById("loginContentRoot"),{initial:n}=r.dataset,c=ReactDOM.createRoot(r),l=e=>{e?(document.title="Sign up - Peg SoliShare",c.render(React.createElement(o,{csrf:a.csrfToken,onSwitch:()=>l(!1)}))):(document.title="Login - Peg SoliShare",c.render(React.createElement(s,{csrf:a.csrfToken,onSwitch:()=>l(!0)})))};l("signup"===n)}})()})();