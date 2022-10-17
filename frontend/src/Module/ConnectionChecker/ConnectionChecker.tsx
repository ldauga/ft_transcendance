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

  const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
  const utilsData = useSelector((state: RootState) => state.utils)
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  if (!test) {
    axios.get("http://localhost:5001/user/userExist/", { withCredentials: true }).then((item) => { setUser(item.data) })

    utilsData.socket.emit('storeClientInfo', persistantReducer.userReducer.user ? persistantReducer.userReducer.user : '')
    test = true
  }


  if (persistantReducer.userReducer.user !== null && ((persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled && persistantReducer.twoFactorReducer.verif) || !persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled))
    return <InvitationChecker children={props.component} ></InvitationChecker>
  else
    return <Navigate to="/Login" />
}

export default ConnectionChecker;
