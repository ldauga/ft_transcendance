import axios from "axios";
import React, { useState } from "react";
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
    const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

    function turnOn2fa(value: string) {
        axios.get('https://localhost:5001/auth/2fa/verify/' + value, { withCredentials: true })
            .then((e) => { setTwoFactor(true) })
            .catch((e) => {
                enqueueSnackbar('Wrong code.', { variant: 'warning', autoHideDuration: 2000 })
            });
    }

    if (persistantReducer.userReducer.user === null) {
        axiosConfig.get("https://localhost:5001/user/userExist/").then((item) => { setUser(item.data); }).catch((err) => setUser(null))
    }

    if (persistantReducer.userReducer.user !== null) {


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
                            style={{ padding: '10px' }}
                            onComplete={(value, index) => { turnOn2fa(value); }}
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
