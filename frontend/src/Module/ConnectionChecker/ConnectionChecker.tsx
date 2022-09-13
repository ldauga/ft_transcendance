import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../State";
import { bindActionCreators } from "redux";
import { useCookies } from "react-cookie";
import axios from "axios";
import InvitationChecker from "../InvitationChecker/InvitationChecker";

var test = false

function ConnectionChecker(props: {
  component: any;
}): JSX.Element {


  const userData = useSelector((state: RootState) => state.user)
  const utilsData = useSelector((state: RootState) => state.utils)
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  if (!test) {
    //A MODIFIER ALED CA MARCHE PAS COMME ON VEUT
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);

    if (!cookies["auth-cookie"])
      setUser(null)
    else
      axios.get("http://localhost:5001/user/userExist/" + cookies["auth-cookie"].refreshToken).then((item) => { setUser(item.data) })
    
    utilsData.socket.emit('storeClientInfo', userData.user)
    test = true
  }

  return userData.user !== null ? <InvitationChecker children={props.component} ></InvitationChecker> : <Navigate to="/Login" />;
}

export default ConnectionChecker;
