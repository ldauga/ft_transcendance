import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../State";
import { NotifType } from "../../State/type";

import './Notif.css'

export default function affNotif() {

	const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur)
	const utilsData = useSelector((state: RootState) => state.utils)

	const dispatch = useDispatch();
	const { delNotif } = bindActionCreators(actionCreators, dispatch);

	var ret: any[] = []

	persistantReduceur.notifReducer.notifArray.forEach((item, index) => {
		var tmp: any;

		switch (item.type) {

			case NotifType.GAMEINVITE: {

				tmp = (<div className='notifElement' key={ret.length}>
					<div className="inviteNameDiv">
						<h3 id='invitePlayer'> {item.data.inviteUser.login + " invite you to play on a custom map !"} </h3>
					</div>
					<div className="blocksContainerRow">
						<button className='inviteButton decline' onClick={(e) => {
							utilsData.socket.emit("DECLINE_INVITATION", { sendTo: persistantReduceur.notifReducer.notifArray[index].data.inviteUserID, user: persistantReduceur.userReducer.user })
							delNotif(persistantReduceur.notifReducer.notifArray[index])
						}} >Decline</button>
						<button className='inviteButton accept' onClick={() => {
							utilsData.socket.emit("ACCEPT_INVITATION", { user: persistantReduceur.userReducer.user, inviteID: persistantReduceur.notifReducer.notifArray[index].data.inviteUserID })
							window.location.href = 'http://localhost:3000/pong'
						}}>Accept</button>
					</div>
				</div>)
				break;
			}
			case NotifType.DISCONNECTGAME: {

				tmp = (<div className='notifElement' key={ret.length}>
					<div className="disconnectText">{"You have disconnected a pong game"}</div>
					<div className="blocksContainerRow">
					<button className='disconnectButton join' onClick={(e) => {
							delNotif(persistantReduceur.notifReducer.notifArray[index])
							window.location.href = 'http://localhost:3000/pong'
						}} >Join</button>
						<button className='disconnectButton forfeit' onClick={(e) => {
							utilsData.socket.emit('FORFEIT', {user: persistantReduceur.userReducer.user, roomId: persistantReduceur.notifReducer.notifArray[index].data.roomId})
							delNotif(persistantReduceur.notifReducer.notifArray[index])
						}} >Forfeit</button>
					</div>
				</div>)

				break;
			}
			case NotifType.LOOSEGAMEDISCONECT: {

				tmp = (<div className='notifElement' key={ret.length}>

				</div>)

				break;

			}
			default: { }
		}

		ret.push(tmp)
	})

	console.log('sisisisi', persistantReduceur.notifReducer.notifArray)

	return (ret.reverse())

}