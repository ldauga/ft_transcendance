import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import './CSS/FriendList.css';
import AddFriend from "./AddFriend";

function FriendList(props: { setFriendList: Function, setInvitationRequest: Function, setRooms: Function, setConvers: Function, setConversCorrespondantData: Function, setOldAff: Function }) {

	const utilsData = useSelector((state: RootState) => state.utils);
	const userData = useSelector((state: RootState) => state.persistantReduceur);

	const [itemListHistory, setItemListHistory] = useState(Array<any>);
	const [update, setUpdate] = useState(false);

	const [newAddFriend, setNewAddFriend] = useState(false);

	props.setOldAff("FriendList");

	const handleClickAddFriend = () => {
		if (newAddFriend)
			setNewAddFriend(false);
		else
			setNewAddFriend(true);
	};

	const handleClickInvitationRequest = () => {
		props.setFriendList(false);
		props.setInvitationRequest(true);
	};

	const handleClickRooms = () => {
		props.setFriendList(false);
		props.setRooms(true);
	};

	utilsData.socket.removeAllListeners('returnRemoveFriend');
	utilsData.socket.removeAllListeners('newFriendReceived');

	utilsData.socket.on('returnRemoveFriend', function (returnRemoveFriend: boolean) {
		console.log('returnRemoveFriend = ', returnRemoveFriend);
		if (returnRemoveFriend == true) {
			const length = itemListHistory.length;
			let secu = 0;
			while (length == itemListHistory.length && secu < 5) {
				setItemListHistory([]);
				console.log('test');
				getListItem();
				secu++;
			}
		}
		utilsData.socket.off('returnRemoveFriend');
		utilsData.socket.removeListener('returnRemoveFriend');
	})

	utilsData.socket.on('newFriendReceived', function (data: any) {
		console.log('newFriendReceived = ', data);
		const length = itemListHistory.length;
		let secu = 0;
		while (length == itemListHistory.length && secu < 5) {
			setItemListHistory([]);
			getListItem();
			secu++;
		}
		utilsData.socket.off('newFriendReceived');
		utilsData.socket.removeListener('newFriendReceived');
	})

	const removeFriend = (item: { id_user1: number, id_user2: number, login_user1: string, login_user2: string }) => {
		utilsData.socket.emit('removeFriend', item);
		setUpdate(true);
	};

	const openChat = async (item: { id_user1: number, id_user2: number, login_user1: string, login_user2: string }) => {

		let idTmp = item.id_user1;
		if (userData.userReducer.user?.id == item.id_user1)
			idTmp = item.id_user2;
		let loginTmp = item.login_user1;
		if (userData.userReducer.user?.login == item.login_user1)
			loginTmp = item.login_user2;
		props.setConversCorrespondantData({ id: idTmp, login: loginTmp });
		props.setFriendList(false);
		props.setConvers(true);
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
				const profile_pic = `https://cdn.intra.42.fr/users/${friendLogin}.jpg`;
				console.log("profile_pic", profile_pic);
				itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
					<div className="inItemFriendList">
						<div className="inItemFriendList_left">
							<img src={profile_pic}></img>
							<p>{friendLogin}</p>
						</div>
						<div className="inItemFriendList_right">
							<button onClick={() => openChat(item)} className="bi bi-chat"></button>
							<button onClick={() => removeFriend(item)} className="bi bi-x-lg"></button>
						</div>
					</div>
				</div>)
			})
			setItemListHistory(itemList);
		})
	}

	function ItemsFriendList() {
		return (
			<div id="ListItemFriendList">
				{itemListHistory}
			</div>
		);
	};

	useEffect(() => {
		if (!update) {
			getListItem();
			setUpdate(true);
		}
	});

	return (
		<div>
			<div id="header">
				<h3>Friends</h3>
				<div id="headerButtons">
					<button onClick={handleClickAddFriend}><i className="bi bi-person-plus"></i></button>
					<button onClick={handleClickRooms}><i className="bi bi-people-fill"></i></button>
					<button onClick={handleClickInvitationRequest}><i className="bi bi-hourglass-split"></i></button>
				</div>
			</div>
			{newAddFriend && <AddFriend />}
			<ItemsFriendList />
		</div>
	)
}

export default FriendList;