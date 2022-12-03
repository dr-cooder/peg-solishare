const Nav = (props) => {
  const { username, dontShowLogin, dontShowTitle } = props;
  return (
    <nav className="navFlex">
      <div>{!dontShowTitle ?
        <a href="/" className="logo logoLink">
          <span className="logoPegSoli">Peg Soli</span>
          <span className="logoShare">Share</span>
        </a>
      : null}</div>
      <div>{!dontShowLogin ? 
        (username ?
          <>Welcome, <span className="welcomeUsername">{username}</span> | <a href="/logout">Log out</a></>
          :
          <><a className="btn btn-primary" href="/login?signup">Sign up</a> or <a href="/login">log in</a></>
        )
      : null}</div>
    </nav>
  )
}

module.exports = Nav;
