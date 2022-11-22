import { Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../../State";
import { NotifType } from "../../../State/type";

import './CSS/AffNotif.scss'

const AffNotif = (props: { setLastNbNotif: Function, setNotif: Function, setFriendList: Function, setInvitationRequest: Function, setConvers: Function, setChat: Function, closeNotif: Function, openFriendList: Function, setGoToOpenInvitationRequest: Function }) => {

	const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
	const utilsData = useSelector((state: RootState) => state.utils);

	const dispatch = useDispatch();
	const { delNotif, delAllNotif } = bindActionCreators(actionCreators, dispatch);

	const close = () => {
		props.closeNotif();
		props.setNotif(false);
	}

	const goToInvitationRequest = (index: number) => {
		close();
		props.setGoToOpenInvitationRequest(true);
		props.openFriendList();
		delNotif(persistantReducer.notifReducer.notifArray[index])
	}

	return (
		<div className="mainAffGeneNotif">
			<div className="notif">
				<div className="mainHeader">
					<div className="cross">
						<button onClick={close}><Close /></button>
					</div>
					<h3>Notifications</h3>
					<div className="icons">
					</div>
				</div>
				<div className="ListItemNotif">
					{(() => {
						return persistantReducer.notifReducer.notifArray.map((notif, index) => {
							switch (notif.type) {
								case NotifType.GAMEINVITE:
									return (
										<div className='notifContainer' key={index}>
											<div className="notifTopContainer">
												<button onClick={(e) => {
													utilsData.socket.emit("DECLINE_INVITATION", { sendTo: persistantReducer.notifReducer.notifArray[index].data.inviteUserID, user: persistantReducer.userReducer.user })
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}}><Close /></button>
											</div>
											<div className="notifHeader">
												<p> {notif.data.inviteUser.login + " wants to play with you"} </p>
											</div>
											<div className="notifMain">
												<button className='inviteButton accept' onClick={(e) => {
													utilsData.socket.emit("ACCEPT_INVITATION", { user: persistantReducer.userReducer.user, inviteID: persistantReducer.notifReducer.notifArray[index].data.inviteUserID })
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}} >Accept</button>
											</div>
										</div>
									);
								case NotifType.DISCONNECTGAME:
									return (
										<div className='notifContainer' key={index}>
											<div className="notifTopContainer">
												<button onClick={(e) => {
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}}><Close /></button>
											</div>
											<div className="notifHeader">
												<p>{"You have disconnected from a pong game"}</p>
											</div>
											<div className="notifMain">
												<button className='inviteButton accept' onClick={(e) => {
													utilsData.socket.emit('FORFEIT', { user: persistantReducer.userReducer.user, roomId: persistantReducer.notifReducer.notifArray[index].data.roomId })
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}} >Forfeit</button>
												<button className='inviteButton decline' onClick={(e) => {
													delNotif(persistantReducer.notifReducer.notifArray[index])
													window.location.href = 'https://localhost:3000/pong'
												}} >RECONNECT</button>
											</div>
										</div>
									);
								case NotifType.LOOSEGAMEDISCONECT:
									return (
										<div className='notifContainer' key={index}>
											<div className="notifTopContainer">
												<button onClick={(e) => {
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}}><Close /></button>
											</div>
											<div className="notifHeader">
												<p>{"You gave up against " + persistantReducer.notifReducer.notifArray[index].data.opponentLogin}</p>
											</div>
											<div className="notifMain">
												<button className='inviteButton accept' onClick={(e) => {
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}} >OK</button>
											</div>
										</div>
									);
								case NotifType.PENDINGINVITATION:
									return (
										<div className='notifContainer' key={index}>
											<div className="notifTopContainer">
												<button onClick={(e) => {
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}}><Close /></button>
											</div>
											<div className="notifHeader">
												<p>Check your invitation requests</p>
											</div>
											<div className="notifMain">
												<button className='inviteButton accept' onClick={(e) => {
													goToInvitationRequest(index);
												}} >More details</button>
											</div>
										</div>
									);
								case NotifType.YOUWEREKICKEDOUTTHEGROUP:
									return (
										<div className='notifContainer' key={index}>
											<div className="notifTopContainer">
												<button onClick={(e) => {
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}}><Close /></button>
											</div>
											<div className="notifHeader">
												<p>You have been kicked out of "{persistantReducer.notifReducer.notifArray[index].data.room_name}" group by: {persistantReducer.notifReducer.notifArray[index].data.login_sender}</p>
											</div>
											<div className="notifMain">

											</div>
										</div>
									);
								case NotifType.YOUWEREBANFROMTHEGROUP:
									return (
										<div className='notifContainer' key={index}>
											<div className="notifTopContainer">
												<button onClick={(e) => {
													delNotif(persistantReducer.notifReducer.notifArray[index])
												}}><Close /></button>
											</div>
											<div className="notifHeader">
												<p>You have been banned from "{persistantReducer.notifReducer.notifArray[index].data.room_name}" group by: {persistantReducer.notifReducer.notifArray[index].data.login_sender}</p>
											</div>
											<div className="notifMain">

											</div>
										</div>
									);
								default:
									return (
										<></>
									);
							}
						});
					})()}
				</div>
				{
					persistantReducer.notifReducer.notifArray.length ?
						<div className="delete-all-notifs">
							<button onClick={delAllNotif}>Clear</button>
						</div> : <></>
				}
			</div>
		</div>
	)

}

export default AffNotif;
