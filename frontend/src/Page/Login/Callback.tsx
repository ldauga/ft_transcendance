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
import axiosConfig from "../../Utils/axiosConfig";
import Background from "../../Module/Background/Background";
import { useSnackbar } from "notistack";

export default function Callback() {

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [cookie, setCookie] = useCookies(['auth-cookie']);
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
                enqueueSnackbar('Wrong code.', { variant: 'warning', autoHideDuration: 2000 })
            });
    }

    if (persistantReducer.userReducer.user === null) {
        axiosConfig.get("http://localhost:5001/user/userExist/").then((item) => { setUser(item.data); })
        console.log(cookie)
    }

    if (persistantReducer.userReducer.user !== null) {

        console.log(persistantReducer.userReducer.user)

        if (persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled && !persistantReducer.twoFactorReducer.verif)

            return (
                <>
                <Background />
                <div className="login-2fa">
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
                </div>
                </>
            )
        else
            return (<Navigate to="/HomePage" />)
    }
    return (
        <></>
    )


}