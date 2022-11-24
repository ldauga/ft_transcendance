import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../../State';
import './Login.scss';
import logo from '../assets/logo_transcendence.png';

function Login() {

    const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

	function onClick42Login() {
		setUser(null)
		setTwoFactor(false)
		window.open(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-bfefebbec4535153df2d3db283bafab0ba8027dd304604a100070653921d9721&redirect_uri=https%3A%2F%2Flocalhost%3A5001%2Fauth%2Flogin&response_type=code`, '_self')
	}

	return (
		<div className='login'>
			<div className='container'>
				<img className="logo_transcendence" src={logo} alt="" />
				<button onClick={onClick42Login}>Sign In</button>
			</div>
		</div>
	)
}

export default Login;
