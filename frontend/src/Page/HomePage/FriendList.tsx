import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../State";
import AddFriend from "./AddFriend";
import HomePage from "./HomePage";
import { AddFriendHook, FriendListHook, InvitationRequestHook } from "./Hooks";
import InvitationRequest from "./InvitationRequest";
import './FriendList.css';

function FriendList() {

	const utilsData = useSelector((state: RootState) => state.utils);
	const userData = useSelector((state: RootState) => state.persistantReduceur);

	const [isAddFriend, setAddFriend] = AddFriendHook(false);
	const [isInvitationRequest, setInvitationRequest] = InvitationRequestHook(false);
	const [isFriendList, setFriendList] = FriendListHook(true);
	const [itemListHistory, setItemListHistory] = useState(Array<any>);
	const [update, setUpdate] = useState(false);

	const handleClickAddFriend = () => {
		setFriendList(false);
		setInvitationRequest(false);
		setAddFriend(true);
	};

	const handleClickInvitationRequest = () => {
		setFriendList(false);
		setAddFriend(false);
		setInvitationRequest(true);
	};

	const handleClickSearch = () => {

	};

	utilsData.socket.removeAllListeners('returnRemoveFriend');

	utilsData.socket.on('returnRemoveFriend', function (returnRemoveFriend: boolean) {
		console.log('returnRemoveFriend = ', returnRemoveFriend);
		if (returnRemoveFriend == true) {
			const length = itemListHistory.length;
			// console.log('length', length);
			let secu = 0;
			while (length == itemListHistory.length && secu < 5) {
				setItemListHistory([]);
				console.log('test');
				getListItem();
				secu++;
			}
			// console.log('secu', secu);
		}
		utilsData.socket.off('returnRemoveFriend');
		utilsData.socket.removeListener('returnRemoveFriend');
	})

	const removeFriend = (item: { id_user1: number, id_user2: number, login_user1: string, login_user2: string }) => {
		// console.log('decline invit');
		// console.log('emit InvitationRequest');
		utilsData.socket.emit('removeFriend', item);
		setUpdate(true);
	};

	const getListItem = async () => {
		await axios.get('http://localhost:5001/friendList/' + userData.userReducer.user?.id).then(async (res) => {
			console.log("get");
			let itemList: any[] = []
			console.log('res.data = ', res.data);
			res.data.forEach((item: { id_user1: number, id_user2: number, login_user1: string, login_user2: string }) => {
				let friendLogin = item.login_user1;
				if (item.id_user1 == userData.userReducer.user?.id)
					friendLogin = item.login_user2;
				itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
					<div className="inItemFriendList">
						<p>{friendLogin}</p>
						<button onClick={() => removeFriend(item)} className="bi bi-x-lg"></button>
					</div>
				</div>)
			})
			setItemListHistory(itemList);
		})
	}

	useEffect(() => {
		if (!update) {
			getListItem();
			setUpdate(true);
		}
	});

	return (
		<div>
			{isFriendList && (
				<div>
					<div className="friends-info-typo" id='friendsInfo'>
						<div className="left"></div>
						<h3>Friends</h3>
						<div className="button">
							<button onClick={handleClickAddFriend}><i className="bi bi-person-plus"></i></button>
							<button onClick={handleClickSearch}><i className="bi bi-search"></i></button>
							<button onClick={handleClickInvitationRequest}><i className="bi bi-hourglass-split"></i></button>
						</div>
						{isAddFriend && <AddFriend />}
						{isInvitationRequest && <InvitationRequest />}
					</div>
					<div>
						{itemListHistory}
					</div>
				</div>
			)}
			{isAddFriend && <AddFriend />}
			{isInvitationRequest && <InvitationRequest />}
		</div>
	)
}

export default FriendList;