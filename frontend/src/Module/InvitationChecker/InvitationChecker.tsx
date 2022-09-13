import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { Client, msg } from "../../State/type";

import './InvitationChecker.css'

function InvitationChecker(props: { children: any }) {

	const utilsData = useSelector((state: RootState) => state.utils)
	const userData = useSelector((state: RootState) => state.user)

	const [inviteSocketID, setInviteSocketID] = useState("")

	utilsData.socket.on('invite_request_custom',
		function (info: {
			inviteSocketID: string,
			inviteUser: {
				id: number,
				login: string,
				nickname: string,
				wins: number,
				looses: number,
				rank: number,
				profile_pic: string
			}
		}) {
			console.log('sisisis')
			var modal = document.getElementById("invitationModal");
			if (modal)
				modal.style.display = "block";
			var h3 = document.getElementById("invitePlayer")
			if (h3)
				h3.innerHTML = info.inviteUser.login + " invite you to play on a custom map !"
			setInviteSocketID(info.inviteSocketID)
		});

	const logData = useSelector((state: RootState) => state.log)
	const clientList = useSelector((state: RootState) => state.clientList)

	const dispatch = useDispatch();

	const { addClient, removeClient, addMsg } = bindActionCreators(actionCreators, dispatch);

	utilsData.socket.on('friendsList', function (arrClient: Client[]) {
		console.log('Friends List received, useEffect()');
		for (var i = 0; i < arrClient.length; i++) {
			if (arrClient[i].username.length > 0 && Number(arrClient[i].id) != userData.user?.id) {
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
			<div id="invitationModal" className="invitationModal">
				<div className="invitationModal-content">
					<div className="inviteNameDiv">
						<h3 id='invitePlayer' />
					</div>
					<div className="blocksContainerRow">
						<button className='inviteButton decline' onClick={() => {
							var modal = document.getElementById("invitationModal");
							if (modal)
								modal.style.display = "none";
							utilsData.socket.emit("DECLINE_INVITATION", { sendTo: inviteSocketID, user: userData.user })
						}} >Decline</button>
						<button className='inviteButton accept' onClick={() => {
							utilsData.socket.emit("ACCEPT_INVITATION", { user: userData.user, inviteID: inviteSocketID })
							window.location.href = 'http://localhost:3000/pong'
						}}>Accept</button>
					</div>
				</div>
			</div>
			{props.children}
		</>
	);

}

export default InvitationChecker;