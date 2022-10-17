import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../State";
import { RootState } from "../../State/Reducers";

export default function Callback() {

	const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [cookie, setCookie] = useCookies(['auth-cookie']);
    const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

    const [code, setCode] = useState("");
    const [turnOn, setTurnOn] = useState(false);
    const [res, setRes] = useState(0);
    const [status, setStatus] = useState("");

    async function turnOn2fa(key: string) {
        if (key == "Enter") 
            axios.get('http://localhost:5001/auth/2fa/verify/' + code, { withCredentials: true })
                .then((e) => {setTwoFactor(true), setTurnOn(true)})
                .catch((e) => {
                    setRes(e.response.status)
                });
    }

    useEffect(() => {
        console.log('persistantReducer.twoFactorReducer.verif', persistantReducer.twoFactorReducer.verif)
        if (res === 401)
            setStatus("Error, wrong code.")
        else if (res == 404)
            setStatus("You must enter the code.")
    })
    

    if (persistantReducer.userReducer.user === null) {
        axios.get("http://localhost:5001/user/userExist/", {withCredentials: true}).then((item) => { setUser(item.data); })
        console.log(cookie)
    }

    if (persistantReducer.userReducer.user !== null) {

        console.log(persistantReducer.userReducer.user)

        if (persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled && !persistantReducer.twoFactorReducer.verif)

            return (
                <div className="login-2fa">
                    <p>Enter your Google Authenticator code:</p>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={(e) => { turnOn2fa(e.key) }}
                    />
                    <p>{status}</p>
                </div>
            )
        else
            return (<Navigate to="/HomePage" />)
    }
    return (
        <></>
    )


}