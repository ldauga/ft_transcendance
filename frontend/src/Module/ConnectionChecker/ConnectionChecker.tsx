import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../State";
import { bindActionCreators } from "redux";
import axios from "axios";
import InvitationChecker from "../InvitationChecker/InvitationChecker";
import { useLocation } from 'react-router-dom'
import NotFound from "../../Page/NotFound/NotFound";

var test = false

function ConnectionChecker(props: {
  component: any;
}): JSX.Element {

  const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
  const utilsData = useSelector((state: RootState) => state.utils)
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

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
      return <NotFound />
  }
  else
    return <Navigate to="/Login" />
}

export default ConnectionChecker;
