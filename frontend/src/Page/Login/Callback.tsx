import axios from "axios";
import React from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../State";
import { RootState } from "../../State/Reducers";

export default function Callback() {

    const userData = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch();
    const { setUser } = bindActionCreators(actionCreators, dispatch);

    //A MODIFIER ALED CA MARCHE PAS COMME ON VEUT
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);
    
    axios.get("http://localhost:5001/user/userExist/" + cookies["auth-cookie"].refreshToken).then((item) => { console.log('item.data', item.data); setUser(item.data) })

    return (
        <>
            {userData.user !== null ? <Navigate to="/HomePage" /> : <></>}
        </>
    )
}