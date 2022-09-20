import axios from "axios";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../State";
import { RootState } from "../../State/Reducers";

export default function Callback() {

	const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur);

    const dispatch = useDispatch();
    const { setUser } = bindActionCreators(actionCreators, dispatch);

    //A MODIFIER ALED CA MARCHE PAS COMME ON VEUT
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);
    const [code, setCode] = useState("");
    console.log(cookies);

    async function turnOn2fa(key: string) {
        if (key == "Enter") axios.get('http://localhost:5001/auth/2fa/verify/' + code, { withCredentials: true }).then(res => console.log(res));
    }

    if (persistantReduceur.userReducer.user === null)
        axios.get("http://localhost:5001/user/userExist/" + cookies["auth-cookie"].refreshToken).then((item) => { console.log('item.data', item.data); setUser(item.data) })


    if (persistantReduceur.userReducer.user !== null) {

        if (persistantReduceur.userReducer.user.is2faEnabled)

            return (<input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { turnOn2fa(e.key) }}
            />)

        else

            return (<Navigate to="/HomePage" />)
    }
    return (
        <></>
    )


}