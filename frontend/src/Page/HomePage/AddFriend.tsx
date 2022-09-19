import axios from "axios";
import React, { useEffect, useState } from "react";
import FriendList from "./FriendList";
import { AddFriendHook, FriendListHook } from "./Hooks";
import { User2 } from "../../State/type";
import { useSelector } from "react-redux";
import { RootState } from "../../State";

function AddFriend() {

	const utilsData = useSelector((state: RootState) => state.utils);
	const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur);

	const [isFriendList, setFriendList] = FriendListHook(false);
	const [isAddFriend, setAddFriend] = AddFriendHook(true);

	const [text, setText] = useState('');

	const handleClick = () => {
		setFriendList(true);
		setAddFriend(false)
	};

	async function buttonAddFriend() {
		let test = false;
		console.log('addFriend');
		await axios.get('http://localhost:5001/user/login/' + text).then(async (res) => {
			setText("");
			console.log("axios.get");
			console.log(res.data);
			console.log(res);
			let receiver_login_tmp: string = res.data.login;
			if (res.data == "") {
				console.log("login not found");
				return;
			}
			else {
				let a = 1;
				let b = 1;
				await axios.get('http://localhost:5001/invitationRequest/' + userData.user?.id + '/' + res.data.id).then(async (res) => {
					console.log('check invit');
					console.log(res.data);
					console.log(res);
					if (res.data == true) {
						console.log("invitationRequest already exist");
					}
					else {
						a = 2;
						console.log('invitationRequest not exist');
					}
				})
				await axios.get('http://localhost:5001/friendList/' + userData.user?.id + '/' + res.data.id).then(async (res) => {
					console.log('check friendList');
					console.log(res.data);
					console.log(res);
					if (res.data == true) {
						console.log("relation already exist");
					}
					else {
						b = 2;
						console.log('relation not exist');
					}
				})
				if (a == 2 && b == 2) {
					console.log('test == true');
					console.log(receiver_login_tmp);
					const newInvitationRequest = {
						id_user1: userData.user?.id,
						id_user2: res.data.id,
						user1_accept: true,
						user2_accept: false,
						sender_login: userData.user?.login,
						receiver_login: receiver_login_tmp
					}
					utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
				}
				return;
			}
		});
	}

	return (
		<div>
			{isAddFriend && (
				<div>
					<div className="friends-info-typo">
						<h3>Add Friend</h3>
						<div className="button">
							<button onClick={handleClick} className="bi bi-x-lg"></button>
							{isFriendList && <FriendList />}
						</div>
					</div>
					<div id="sendZone">
						<input
							value={text}
							onChange={e => setText(e.target.value)}
							placeholder="Enter login"
						/>
						<button type="button" onClick={() => buttonAddFriend()}>
							Add Friend
						</button>
					</div>
				</div>
			)}
			{isFriendList && <FriendList />}
		</div>
	)
}

export default AddFriend;