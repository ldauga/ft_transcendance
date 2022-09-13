import React from "react";
import { Cookies, useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import {useLocation} from 'react-router-dom';
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../State";

const Logout=() => {
	let location = useLocation();

    const dispatch = useDispatch();

    const { setUser } = bindActionCreators(actionCreators, dispatch);
    
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);
    
    function click() {
        removeCookie("auth-cookie", {path:'/'})

        setUser(null)
    }

	if (location.pathname === '/HomePage')
		return (<i className="bi bi-box-arrow-left" onClick={click}></i>);
	return <></>;
};

export default Logout;
