import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { Client, msg, Notif } from "../../State/type";

import './InvitationChecker.css'

var test = true
function InvitationChecker(props: { children: any }) {

	const utilsData = useSelector((state: RootState) => state.utils)
	const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur)

	const [inviteSocketID, setInviteSocketID] = useState("")

	const logData = useSelector((state: RootState) => state.log)
	const clientList = useSelector((state: RootState) => state.clientList)

	const dispatch = useDispatch();

	const { addClient, removeClient, addMsg, setNotif } = bindActionCreators(actionCreators, dispatch);

	useEffect(() => {
		utilsData.socket.on('notif', function (notif: Notif) {
			for (let index = 0; index < persistantReduceur.notif.notifArray.length; index++) {
				if (persistantReduceur.notif.notifArray[index] == notif)
					return;
			}
			setNotif(notif)
		})
	})

	utilsData.socket.on('friendsList', function (arrClient: Client[]) {
		console.log('Friends List received, useEffect()');
		for (var i = 0; i < arrClient.length; i++) {
			if (arrClient[i].username.length > 0 && Number(arrClient[i].id) != persistantReduceur.user.user?.id) {
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