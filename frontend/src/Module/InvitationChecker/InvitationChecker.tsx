import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { Client, msg, Notif, NotifType } from "../../State/type";

import './InvitationChecker.css'

var test = false

function InvitationChecker(props: { children: any }) {

	const utilsData = useSelector((state: RootState) => state.utils)
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)

	const [inviteSocketID, setInviteSocketID] = useState("")

	const logData = useSelector((state: RootState) => state.log)
	const clientList = useSelector((state: RootState) => state.clientList)

	const dispatch = useDispatch();

	const { addClient, removeClient, addMsg, setNotif, delNotif } = bindActionCreators(actionCreators, dispatch);

	function verifInvitationRequest() {
		axios.get('http://localhost:5001/invitationRequest/' + persistantReducer.userReducer.user?.id).then((res) => {
			if (res.data.length) {

				for (let index = 0; index < persistantReducer.notifReducer.notifArray.length; index++) {
					if (persistantReducer.notifReducer.notifArray[index].type == NotifType.PENDINGINVITATION)
						return
				}

				setNotif({ type: NotifType.PENDINGINVITATION })

			}
		})
	}

	useEffect(() => {
		if (!test) {
			verifInvitationRequest()
			test = true
		}

		utilsData.socket.on('notif', function (notif: Notif) {
			for (let index = 0; index < persistantReducer.notifReducer.notifArray.length; index++) {
				if (persistantReducer.notifReducer.notifArray[index] == notif)
					return;
				if (notif.type == NotifType.LOOSEGAMEDISCONECT && persistantReducer.notifReducer.notifArray[index].type == NotifType.DISCONNECTGAME && notif.data.roomId == persistantReducer.notifReducer.notifArray[index].data.roomId) {
					delNotif(persistantReducer.notifReducer.notifArray[index])
					setNotif(notif)
					return;
				}
			}
			setNotif(notif)
			console.log('notifArray', persistantReducer.notifReducer.notifArray)
		})
	})

	return (
		<>
			{props.children}
		</>
	);

}

export default InvitationChecker;