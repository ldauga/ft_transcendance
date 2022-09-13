import axios from "axios";
import React, { useEffect, useState } from "react";
import FriendList from "./FriendList";
import { AddFriendHook, FriendListHook } from "./Hooks";
import { User2 } from "../../State/type";
import { useSelector } from "react-redux";
import { RootState } from "../../State";

function AddFriend() {

	const utilsData = useSelector((state: RootState) => state.utils);
	const userData = useSelector((state: RootState) => state.user);

	const [isFriendList, setFriendList] = FriendListHook(false);
	const [isAddFriend, setAddFriend] = AddFriendHook(true);

	const [text, setText] = useState('');

	const handleClick = () => {
		setFriendList(true);
		setAddFriend(false)
	};

	function buttonAddFriend() {
		console.log('addFriend');
		axios.get('http://localhost:5001/user/login/' + text).then((res) => {
			setText("");
			console.log("axios.get");
			console.log(res.data.login);
			if (res == null) {
				console.log("login not found");
				return;
			}
			else {
				const newInvitationRequest = {
					id_user1: userData.user?.id,
					id_user2: res.data.id,
					user1_accept: true,
					user2_accept: false,
				}
				utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
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