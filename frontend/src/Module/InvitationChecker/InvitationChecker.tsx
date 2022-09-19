import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { Client, msg, Notif, NotifType } from "../../State/type";

import './InvitationChecker.css'

var test = true
function InvitationChecker(props: { children: any }) {

	const utilsData = useSelector((state: RootState) => state.utils)
	const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur)

	const [inviteSocketID, setInviteSocketID] = useState("")

	const logData = useSelector((state: RootState) => state.log)
	const clientList = useSelector((state: RootState) => state.clientList)

	const dispatch = useDispatch();

	const { addClient, removeClient, addMsg, setNotif, delNotif } = bindActionCreators(actionCreators, dispatch);

	useEffect(() => {
		utilsData.socket.on('notif', function (notif: Notif) {
			for (let index = 0; index < persistantReduceur.notifReducer.notifArray.length; index++) {
				if (persistantReduceur.notifReducer.notifArray[index] == notif)
					return;
				if (notif.type == NotifType.LOOSEGAMEDISCONECT && persistantReduceur.notifReducer.notifArray[index].type == NotifType.DISCONNECTGAME && notif.data.roomId == persistantReduceur.notifReducer.notifArray[index].data.roomId) {
					delNotif(persistantReduceur.notifReducer.notifArray[index])
					setNotif(notif)
					return;
				}
			}

			console.log('notifArray', persistantReduceur.notifReducer.notifArray)
		})
	})

	utilsData.socket.on('friendsList', function (arrClient: Client[]) {
		console.log('Friends List received, useEffect()');
		for (var i = 0; i < arrClient.length; i++) {
			if (arrClient[i].username != "" && Number(arrClient[i].id) != persistantReduceur.user?.id) {
				console.log(`add client: ${arrClient[i].username}`)
				let newClient: Client = {
					username: arrClient[i].username,
					id: arrClient[i].id,
					convers: { count: 0, msg: [] }
				}
				addClient(newClient);
			}
		}
	})

	return (
		<>
			{props.children}
		</>
	);

}

export default InvitationChecker;