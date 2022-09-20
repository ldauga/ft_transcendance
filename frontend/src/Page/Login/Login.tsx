import React, { useState } from 'react';
import './../assets/Font.css';
import './Login.css';
import logo from '../assets/logo_transcendence.png';

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
				<img className="logo_transcendence" src={logo} alt="" />
				<button className="loginButton" onClick={onClick42Login}><span>SIGN IN WITH</span> <img src='https://stud.42lyon.fr/static/assets/images/42_logo_black.svg' className='logo42' /> <span>ACCOUNT</span></button>
				
				{/* TO REMOVE */}
				<div className='dev'>
					<input className="loginBar" value={login} onChange={(e) => { setLogin(e.target.value) }} onKeyDown={(event) => { if (event.key === 'Enter') onClickLoginSans42() }} placeholder='Enter valid login to connect' />
					<button className="loginButton" onClick={onClickLoginSans42}><span>SIGN IN WITHOUT</span> <img src='https://stud.42lyon.fr/static/assets/images/42_logo_black.svg' className='logo42' /> <span>ACCOUNT</span></button>
				</div>

			</div>
		</div>
	)
}

export default Login;
