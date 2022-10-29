import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../../State';
import './Login.scss';
import logo from '../assets/logo_transcendence.png';

function Login(props: { user?: any }) {
	const [login, setLogin] = useState('')
	
    const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

	function onClick42Login() {
		setUser(null)
		setTwoFactor(false)
		window.open(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-bfefebbec4535153df2d3db283bafab0ba8027dd304604a100070653921d9721&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fauth%2Flogin&response_type=code`, '_self')
	}

	function onClickLoginSans42() {
		setUser(null)
		setTwoFactor(false)
		window.open(`http://localhost:5001/auth/loginSans42/` + login, '_self')
	}

	return (
		<div className='login'>
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
