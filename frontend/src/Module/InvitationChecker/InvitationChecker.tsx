import { useTour } from "@reactour/tour";
import { Dictionary } from "@reduxjs/toolkit";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { Client, msg, Notif, NotifType } from "../../State/type";
import axiosConfig from "../../Utils/axiosConfig";
import ForNotistack from "./ForNotistack";

import './InvitationChecker.css'

var test = false

function InvitationChecker(props: { children: any }) {

	const utilsData = useSelector((state: RootState) => state.utils)
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)

	const logData = useSelector((state: RootState) => state.log)

	const dispatch = useDispatch();

	const { setUser, setNotif, delNotif, addChatNotif, initChatNotif, setInviteCheckReload, setInviteCheck } = bindActionCreators(actionCreators, dispatch);

	utilsData.socket.off('start_invite_game')


	window.onload = function () {
		if (persistantReducer.inviteCheckReducer.verif)
			setInviteCheckReload(true)

	}

	utilsData.socket.on('start_invite_game', function (info: { roomID: string, spectate: boolean }) {
		if (persistantReducer.inviteCheckReducer)
			setInviteCheck(false)

		history.pushState({}, '', window.URL.toString())
		window.location.replace('https://localhost:3000/Pong')

	});

	function verifInvitationRequest() {
		axiosConfig.get('https://localhost:5001/invitationRequest/' + persistantReducer.userReducer.user?.id).then((res) => {
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

	utilsData.socket.on('notif', function (notif: { type: NotifType, data?: Dictionary<any> }) {
		for (let index = 0; index < persistantReducer.notifReducer.notifArray.length; index++) {

			if (persistantReducer.notifReducer.notifArray[index].type == NotifType.PENDINGINVITATION && notif.type == NotifType.PENDINGINVITATION)
				return;
			if (persistantReducer.notifReducer.notifArray[index].type == NotifType.GAMEINVITE && notif.type == NotifType.GAMEINVITE && persistantReducer.notifReducer.notifArray[index].data.inviteUser.login == notif.data?.inviteUser.login) {
				delNotif(persistantReducer.notifReducer.notifArray[persistantReducer.notifReducer.notifArray.findIndex(item => item.type == NotifType.GAMEINVITE && item.data.inviteUser.login == notif.data?.inviteUser.login)])
				setNotif({ ...notif, seen: false })
				return;
			}
			if (persistantReducer.notifReducer.notifArray[index] == notif)
				return;
			if (persistantReducer.notifReducer.notifArray.find(notif => notif.type == NotifType.DISCONNECTGAME) != undefined && notif.type == NotifType.DISCONNECTGAME)
				return;
			if (notif.type == NotifType.LOOSEGAMEDISCONECT && persistantReducer.notifReducer.notifArray[index].type == NotifType.DISCONNECTGAME && notif.data?.roomId == persistantReducer.notifReducer.notifArray[index].data.roomId) {
				delNotif(persistantReducer.notifReducer.notifArray[index])
				setNotif({ ...notif, seen: false })
				return;
			}
		}
		setNotif({ ...notif, seen: false })

		utilsData.socket.off('notif');
		utilsData.socket.removeListener('notif');
	})

	useEffect(() => {
		if (!test) {
			verifInvitationRequest()
			test = true
		}
	})

	return (
		<>
			{props.children}
			<ForNotistack />
		</>
	);

}

export default InvitationChecker;
