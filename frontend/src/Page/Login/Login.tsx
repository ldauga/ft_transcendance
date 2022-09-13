import React, { useState } from 'react';
import './../assets/Font.css';
import './Login.css'

function Login(props: { user?: any }) {
	const [login, setLogin] = useState('')

	function onClick42Login() {
		window.open(`https://api.intra.42.fr/oauth/authorize?client_id=f4c0d93db7acf37cb140cce5da2617265ab63195b7a60bcd981003b3d289a413&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fauth%2Flogin&response_type=code`, '_self')
	}

	function onClickLoginSans42() {
		window.open(`http://localhost:5001/auth/loginSans42/` + login, '_self')
	}

	return (
		<div className='Font'>
			<div className='container'>
				<button className="loginButton" onClick={onClick42Login}>
					<img className="i42-logo" src="https://42lyon.fr/wp-content/uploads/2022/04/Artboard-1.svg" alt="" />
				</button>
				<input className="inviteBar" value={login} onChange={(e) => { setLogin(e.target.value) }} onKeyDown={(event) => { if (event.key === 'Enter') onClickLoginSans42() }} placeholder='Enter valid login to connect' />
				<button className="loginButton" onClick={onClickLoginSans42}>
					<img className="i42-logo" src="https://42lyon.fr/wp-content/uploads/2022/04/Artboard-1.svg" alt="" />
				</button>
			</div>
		</div>
	)
}

export default Login;
