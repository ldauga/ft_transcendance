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

  const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur)
  const utilsData = useSelector((state: RootState) => state.utils)
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  if (!test) {
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);

    if (!cookies["auth-cookie"])
      setUser(null)
    else
      axios.get("http://localhost:5001/user/userExist/" + cookies["auth-cookie"].refreshToken).then((item) => { setUser(item.data) })

    if (persistantReduceur.userReducer.user?.is2faEnabled)
      utilsData.socket.emit('storeClientInfo', persistantReduceur.userReducer.user)
    test = true
  }


  if (persistantReduceur.userReducer.user !== null && ((persistantReduceur.userReducer.user.is2faEnabled && persistantReduceur.twoFactorReducer.verif) || !persistantReduceur.userReducer.user.is2faEnabled))
  return <InvitationChecker children={props.component} ></InvitationChecker>
  else
  return <Navigate to="/Login" />
}

export default ConnectionChecker;
