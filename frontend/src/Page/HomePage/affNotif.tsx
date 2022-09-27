import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { notifReducer } from "../../State/Reducers/notifReducer";
import { NotifType } from "../../State/type";

import './Notif.css'

export default function affNotif(props: any) {

	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
	const utilsData = useSelector((state: RootState) => state.utils)

	const dispatch = useDispatch();
	const { delNotif } = bindActionCreators(actionCreators, dispatch);

	var ret: any[] = []

	persistantReducer.notifReducer.notifArray.forEach((item, index) => {
		var tmp: any;

		switch (item.type) {

			case NotifType.GAMEINVITE: {

				tmp = (<div className='notifElement' key={ret.length}>
					<div className="inviteNameDiv">
						<h3 id='invitePlayer'> {item.data.inviteUser.login + " wants to play with you"} </h3>
					</div>
					<div className="blocksContainerRow">
						<button className='inviteButton decline' onClick={(e) => {
							utilsData.socket.emit("DECLINE_INVITATION", { sendTo: persistantReducer.notifReducer.notifArray[index].data.inviteUserID, user: persistantReducer.userReducer.user })
							delNotif(persistantReducer.notifReducer.notifArray[index])
						}} >Decline</button>
						<button className='inviteButton accept' onClick={() => {
							utilsData.socket.emit("ACCEPT_INVITATION", { user: persistantReducer.userReducer.user, inviteID: persistantReducer.notifReducer.notifArray[index].data.inviteUserID })
							window.location.href = 'http://localhost:3000/pong'
						}}>Accept</button>
					</div>
				</div>)
				break;
			}
			case NotifType.DISCONNECTGAME: {

				tmp = (<div className='notifElement' key={ret.length}>
					<div className="inviteNameDiv">
						<h3 id='invitePlayer'> {"You have disconnected a pong game"} </h3>
					</div>
					<div className="blocksContainerRow">
						<button className='inviteButton decline' onClick={(e) => {
							utilsData.socket.emit('FORFEIT', { user: persistantReducer.userReducer.user, roomId: persistantReducer.notifReducer.notifArray[index].data.roomId })
							delNotif(persistantReducer.notifReducer.notifArray[index])
						}} >Forfeit</button>
						<button className='inviteButton accept' onClick={(e) => {
							delNotif(persistantReducer.notifReducer.notifArray[index])
							window.location.href = 'http://localhost:3000/pong'
						}} >Join</button>
					</div>
				</div>)

				break;
			}
			case NotifType.LOOSEGAMEDISCONECT: {

				tmp = (<div className='notifElement' key={ret.length}>
					<div className="inviteNameDiv">
						<h3 id='invitePlayer'>{"You gave up against " + persistantReducer.notifReducer.notifArray[index].data.opponentLogin} </h3>
					</div>
					<div className="blocksContainerRow">
						<button className='inviteButton decline' onClick={(e) => {
							delNotif(persistantReducer.notifReducer.notifArray[index])
						}} >Delete</button>
					</div>
				</div>)

				break;

			}
			case NotifType.PENDINGINVITATION: {

				tmp = (<div className='notifElement' key={ret.length}>
					<div className="inviteNameDiv">
						<h3 id='invitePlayer'>Check your invitation request</h3>
					</div>
					<div className="blocksContainerRow">
						<button className='inviteButton accept' onClick={(e) => {
							var tmp = document.getElementById('notifModal');
							if (tmp)
								tmp.style.display = 'none'
								props.setFriendList(false)
								props.setAddFriend(false)
								props.setInvitationRequest(true)
								props.setConvers(false)
								props.setChat(false)
							delNotif(persistantReducer.notifReducer.notifArray[index])
						}} >More details</button>
						<button className='inviteButton decline' onClick={(e) => {
							delNotif(persistantReducer.notifReducer.notifArray[index])
						}} >Ignore</button>
					</div>
				</div>)

				break;
			}
			default: { }
		}

		ret.push(tmp)
	})

	return (ret.reverse())

}