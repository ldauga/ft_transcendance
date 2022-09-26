import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../State";
import { RootState } from "../../State/Reducers";

export default function Callback() {

	const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur);

    const dispatch = useDispatch();
    const { setUser, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

    //A MODIFIER ALED CA MARCHE PAS COMME ON VEUT
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);
    const [code, setCode] = useState("");
    const [turnOn, setTurnOn] = useState(false);
    const [res, setRes] = useState(0);
    const [status, setStatus] = useState("");
    //console.log(cookies);

    async function turnOn2fa(key: string) {
        if (key == "Enter") 
            axios.get('http://localhost:5001/auth/2fa/verify/' + code, { withCredentials: true })
                .then((e) => {setTwoFactor(true), setTurnOn(true)})
                .catch((e) => {
                    setRes(e.response.status)
                });
    }

    useEffect(() => {
        console.log('persistantReduceur.twoFactorReducer.verif', persistantReduceur.twoFactorReducer.verif)
        if (res === 401)
            setStatus("Error, wrong code.")
        else if (res == 404)
            setStatus("You must enter the code.")
    })
    

    if (persistantReduceur.userReducer.user === null)
        axios.get("http://localhost:5001/user/userExist/" + cookies["auth-cookie"].refreshToken).then((item) => { setUser(item.data); })

    if (persistantReduceur.userReducer.user !== null) {

        console.log(persistantReduceur.userReducer.user)

        if (persistantReduceur.userReducer.user.isTwoFactorAuthenticationEnabled && !persistantReduceur.twoFactorReducer.verif)

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