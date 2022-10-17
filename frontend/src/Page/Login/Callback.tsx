import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import PinInput from "react-pin-input";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../State";
import { RootState } from "../../State/Reducers";
import './Callback.scss';
import logo from '../assets/logo_transcendence.png';

export default function Callback() {

	const persistantReducer = useSelector((state: RootState) => state.persistantReducer);

    const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);
    const [turnOn, setTurnOn] = useState(false);
    const [res, setRes] = useState(0);
    const [fullPinCode, setFullPinCode] = useState(false);

    function turnOn2fa(value: string) {
        console.log('code: ' + value);
        axios.get('http://localhost:5001/auth/2fa/verify/' + value, { withCredentials: true })
            .then((e) => {setTwoFactor(true), setTurnOn(true)})
            .catch((e) => {
                setRes(e.response.status)
            });
    }

    useEffect(() => {
		const wrongCode = document.querySelector<HTMLElement>('.wrong-code')!;
		if (fullPinCode && res === 401) {
			if (wrongCode)
				wrongCode.style.visibility = 'visible';
			} else {
			if (wrongCode)
				wrongCode.style.visibility = 'hidden';
		}
	  });

    if (persistantReducer.userReducer.user === null)
        axios.get("http://localhost:5001/user/userExist/", {withCredentials: true}).then((item) => { setUser(item.data); })

    if (persistantReducer.userReducer.user !== null) {

        console.log(persistantReducer.userReducer.user)

        if (persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled && !persistantReducer.twoFactorReducer.verif)

            return (
                <div className="login-2fa">
                    <img className="logo_transcendence" src={logo} alt="" />
                    <div className="bg">
                        <h1>Google Authenticator Code</h1>
                        <PinInput 
                            length={6}
                            focus
                            type="numeric"
                            inputMode="number"
                            style={{padding: '10px'}}
                            onChange={() => setFullPinCode(false)}
                            onComplete={(value, index) => {turnOn2fa(value); setFullPinCode(true)}}
                            autoSelect={true}
                        />
                        <p className='wrong-code' style={{visibility: 'hidden'}}>Wrong Code</p>
                    </div>
                </div>
            )
        else
            return (<Navigate to="/HomePage" />)
    }
    return (
        <></>
    )


}