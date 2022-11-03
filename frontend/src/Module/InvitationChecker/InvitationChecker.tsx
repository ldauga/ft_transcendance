import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { Client, msg, Notif, NotifType } from "../../State/type";
import axiosConfig from "../../Utils/axiosConfig";

import './InvitationChecker.css'

var test = false

function InvitationChecker(props: { children: any }) {

	const utilsData = useSelector((state: RootState) => state.utils)
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)

	const logData = useSelector((state: RootState) => state.log)

	const dispatch = useDispatch();

	const { setNotif, delNotif } = bindActionCreators(actionCreators, dispatch);

	function verifInvitationRequest() {
		axiosConfig.get('http://localhost:5001/invitationRequest/' + persistantReducer.userReducer.user?.id/*, { withCredentials: true}*/).then((res) => {
			if (res.data.length) {

				for (let index = 0; index < persistantReducer.notifReducer.notifArray.length; index++) {
					if (persistantReducer.notifReducer.notifArray[index].type == NotifType.PENDINGINVITATION)
						return
				}

				setNotif({ type: NotifType.PENDINGINVITATION })

			}
		})
	}

	utilsData.socket.removeAllListeners('notif');

	utilsData.socket.on('notif', function (notif: Notif) {
		for (let index = 0; index < persistantReducer.notifReducer.notifArray.length; index++) {
			if (persistantReducer.notifReducer.notifArray[index].type == NotifType.PENDINGINVITATION && notif.type == NotifType.PENDINGINVITATION)
					return
			if (persistantReducer.notifReducer.notifArray[index] == notif)
				return;
			if (notif.type == NotifType.LOOSEGAMEDISCONECT && persistantReducer.notifReducer.notifArray[index].type == NotifType.DISCONNECTGAME && notif.data.roomId == persistantReducer.notifReducer.notifArray[index].data.roomId) {
				delNotif(persistantReducer.notifReducer.notifArray[index])
				setNotif(notif)
				return;
			}
		}
		setNotif(notif)

		utilsData.socket.off('notif');
		utilsData.socket.removeListener('notif');
	})

	useEffect(() => {
		console.log("useEffect() invitationChecker");
		if (!test) {
			verifInvitationRequest()
			test = true
		}
	})

	utilsData.socket.on('start_spectate', function () {
		history.pushState({}, '', window.URL.toString())
		window.location.replace('http://localhost:3000/Pong')
	})

	return (
		<>
			{props.children}
		</>
	);

}

export default InvitationChecker;