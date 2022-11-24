import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../State";
import { bindActionCreators } from "redux";
import axios from "axios";
import InvitationChecker from "../InvitationChecker/InvitationChecker";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom'
import Callback from "../../Page/Login/Callback";

var test = false

function ConnectionChecker(props: {
  component: any;
}): JSX.Element {

  const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
  const utilsData = useSelector((state: RootState) => state.utils)
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  useEffect(() => {

  })

  if (!test) {
      axios.get("https://localhost:5001/user/userExist/", { withCredentials: true }).then((item) => { setUser(item.data) }).catch((err) => setUser(null));

      utilsData.socket.emit('storeClientInfo', persistantReducer.userReducer.user ? persistantReducer.userReducer.user : '');
      test = true;
  }

  const location = useLocation();

  const verifPath = () => {
    if (location.pathname) {
      if (location.pathname.length > 20 || location.pathname.length < 2) {
        return false;
      }
      else {
        // if (location.pathname.length >= 8) {
        //   console.log(location.pathname.substring(0, 7))
        //   if (location.pathname.substring(0, 8) == "/Profile") {
        //     if (location.pathname.length != 17)
        //       return false;
        //     else {
        //       const tmp = location.pathname.substring(9, 8);
        //       console.log(tmp);
        //       axios.get("https://localhost:5001/user/login/" + tmp, { withCredentials: true }).then((item) => {
        //         if (item.data)
        //           return true;
        //         else {
        //           console.log("null");
        //           return false;
        //         }
        //      })
        //     }
        //   }
        //     console.log("profile")
        // }
        return true;
      }
    }
    return false;
  }

  if (persistantReducer.userReducer.user !== null && ((persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled && persistantReducer.twoFactorReducer.verif) || !persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled))
  {
    if (verifPath()) {
      return <InvitationChecker children={props.component} ></InvitationChecker>
    }
    else
      return <Callback />
  }
  else
    return <Navigate to="/Login" />
}

export default ConnectionChecker;
