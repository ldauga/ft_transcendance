import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../../State';
import './Login.scss';
import logo from '../assets/logo_transcendence.png';
import Background from '../../Module/Background/Background';

function Login(props: { user?: any }) {
	const [login, setLogin] = useState('')

    const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

	function onClick42Login() {
		setUser(null)
		setTwoFactor(false)
		window.open(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-df0f4dd2427878ccac15324ec302d9143641c88217994dd66796c42c8eba923b&redirect_uri=https%3A%2F%2F10.3.3.5%3A5001%2Fauth%2Flogin&response_type=code`, '_self')
	}

	function onClickLoginSans42() {
		setUser(null)
		setTwoFactor(false)
		window.open(`https://10.3.3.5:5001/auth/loginSans42/` + login, '_self')
	}

	return (
		<div className='login'>
			<div className='container'>
				<img className="logo_transcendence" src={logo} alt="" />
				<button onClick={onClick42Login}>Sign In</button>

				{/* TO REMOVE */}
				<div className='dev'>
					<input className="loginBar" value={login} onChange={(e) => { setLogin(e.target.value) }} onKeyDown={(event) => { if (event.key === 'Enter') onClickLoginSans42() }} placeholder='Enter valid login to connect' />
					<button onClick={onClickLoginSans42}>Sign in without 42</button>
				</div>

			</div>
		</div>
	)
}

export default Login;
