import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import './CSS/FriendList.scss';
import AddFriend from "./AddFriend";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Divider, ListItemIcon, Menu, MenuItem, Tooltip } from "@mui/material";
import { Cancel, Close, HourglassBottom, Person, PersonAdd, Settings } from "@mui/icons-material";
import FriendListItem from "./FriendListItem";

import { constWhileSecu } from "../HomePage";

function FriendList(props: { setFriendList: Function, setInvitationRequest: Function, setRooms: Function, setConvers: Function, setConversCorrespondantData: Function, setOldAff: Function, closeFriendList: Function, setBannedUsers: Function, openFriendConversFromProfile: boolean, dataFriendConversFromProfile: { id: number, login: string, nickname: string, profile_pic: string } }) {

	const utilsData = useSelector((state: RootState) => state.utils);
	const userData = useSelector((state: RootState) => state.persistantReducer);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const [itemListHistory, setItemListHistory] = useState(Array<any>);
	const [update, setUpdate] = useState(false);

	const [newAddFriend, setNewAddFriend] = useState(false);

	const [friendArr, setFriendArr] = useState(Array<any>);

	const info = { user: userData.userReducer.user };

	const handleClickClose = () => {
		props.closeFriendList();
		props.setFriendList(false);
	};

	const handleClickAddFriend = () => {
		if (newAddFriend)
			setNewAddFriend(false);
		else
			setNewAddFriend(true);
	};

	const handleClickBanUser = () => {
		props.setFriendList(false);
		props.setBannedUsers(true);
	};

	const handleClickInvitationRequest = () => {
		props.setFriendList(false);
		props.setInvitationRequest(true);
	};

	const handleClickRooms = () => {
		props.setFriendList(false);
		props.setRooms(true);
	};

	utilsData.socket.removeAllListeners('friendConnection');

	utilsData.socket.on('friendConnection', function (friendConnection: boolean) {
		console.log('friendConnection = ', friendConnection);
		if (friendConnection == true)
			utilsData.socket.emit('GET_ALL_FRIEND_CONNECTED', info);
		utilsData.socket.off('friendConnection');
		utilsData.socket.removeListener('friendConnection');
	})

	utilsData.socket.removeAllListeners('friendDeconnection');

	utilsData.socket.on('friendDeconnection', function (friendDeconnection: boolean) {
		console.log('friendDeconnection = ', friendDeconnection);
		if (friendDeconnection == true)
			utilsData.socket.emit('GET_ALL_FRIEND_CONNECTED', info);
		utilsData.socket.off('friendDeconnection');
		utilsData.socket.removeListener('friendDeconnection');
	})

	utilsData.socket.removeAllListeners('returnRemoveFriend');

	utilsData.socket.on('returnRemoveFriend', function (returnRemoveFriend: boolean) {
		console.log('returnRemoveFriend = ', returnRemoveFriend);
		if (returnRemoveFriend == true)
			utilsData.socket.emit('GET_ALL_FRIEND_CONNECTED', info);
		utilsData.socket.off('returnRemoveFriend');
		utilsData.socket.removeListener('returnRemoveFriend');
	})

	utilsData.socket.removeAllListeners('newFriendReceived');

	utilsData.socket.on('newFriendReceived', function (data: any) {
		console.log('newFriendReceived = ', data);
		utilsData.socket.emit('GET_ALL_FRIEND_CONNECTED', info);
		utilsData.socket.off('newFriendReceived');
		utilsData.socket.removeListener('newFriendReceived');
	})

	const [connectedClient, setConnectedClient] = useState<{ id: string, username: string }[]>(new Array());

	utilsData.socket.removeAllListeners('getAllFriendConnected');

	utilsData.socket.on('getAllFriendConnected', function (data: { status: string, user: { id: number, login: string, nickname: string, profile_pic: string } }[]) {
		console.log('getAllFriendConnected = ', data);
		const oldLength = itemListHistory.length;
		for (let i = 0; i < constWhileSecu || oldLength < itemListHistory.length; i++) {
			getListItem(data);
			const tmp: any[] = []
			data.forEach(client => {
				if (client.user.login != userData.userReducer.user?.login) {
					const a = { id: client.user.id, username: client.user.login };
					tmp.push(a);
				}
			})
			setConnectedClient(tmp);
		}
		utilsData.socket.off('getAllFriendConnected');
		utilsData.socket.removeListener('getAllFriendConnected');
	})

	const getListItem = async (data: any) => {
		console.log("get friendList");
		let itemList: any[] = []
		console.log('data = ', data);
		data.forEach((item: { status: string, user: { id: number, login: string, nickname: string, profile_pic: string } }) => {
			console.log("item: ", item);
			itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
				<FriendListItem setFriendList={props.setFriendList} setConvers={props.setConvers} setConversCorrespondantData={props.setConversCorrespondantData} setOldAff={props.setOldAff} closeFriendList={props.closeFriendList} item={item} setUpdate={setUpdate} />
			</div>)
		})
		setItemListHistory(itemList);
	}

	function ItemsFriendList() {
		return (
			<div className="ListItemFriendList">
				{itemListHistory}
			</div>
		);
	};

	useEffect(() => {
		console.log("useEffect friendList");
		utilsData.socket.emit('GET_ALL_FRIEND_CONNECTED', info);
		if (props.openFriendConversFromProfile) {
			props.setConversCorrespondantData({ id: props.dataFriendConversFromProfile.id, login: props.dataFriendConversFromProfile.login, nickname: props.dataFriendConversFromProfile.nickname, profile_pic: props.dataFriendConversFromProfile.profile_pic });
			props.setFriendList(false);
			props.setConvers(true);
		}
	}, [props]);

	const handleClickOpenOptions = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseOptions = () => {
		setAnchorEl(null);
	};

	function MenuOptions() {
		return (
			<Menu
				disableAutoFocusItem
				anchorEl={anchorEl}
				id="account-menu"
				open={open}
				onClose={handleCloseOptions}
				onClick={handleCloseOptions}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: 'visible',
						filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
						mt: 1.5,
						'& .MuiAvatar-root': {
							width: 32,
							height: 32,
							ml: -0.5,
							mr: 1,
						},
						'&:before': {
							content: '""',
							display: 'block',
							position: 'absolute',
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: 'background.paper',
							transform: 'translateY(-50%) rotate(45deg)',
							zIndex: 0,
						},
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<MenuItem key='Add Friend' onClick={handleClickAddFriend}>
					<ListItemIcon>
						<PersonAdd fontSize="small" />
					</ListItemIcon>
					Add Friend
				</MenuItem>
				<MenuItem key='Invitation Request' onClick={handleClickInvitationRequest}>
					<ListItemIcon>
						<Person fontSize="small" />
					</ListItemIcon>
					Invitation Request
				</MenuItem>
				<MenuItem key='Blocked Users' onClick={handleClickBanUser}>
					<ListItemIcon>
						<Cancel fontSize="small" />
					</ListItemIcon>
					Blocked Users
				</MenuItem>
			</Menu>
		);
	};

	// <button onClick={handleClickBanUser}><i className="bi bi-person-x-fill"></i></button>
	// <button onClick={handleClickAddFriend}><i className="bi bi-person-plus"></i></button>
	// <button onClick={handleClickRooms}><i className="bi bi-people-fill"></i></button>
	// <button onClick={handleClickInvitationRequest}><i className="bi bi-hourglass-split"></i></button>

	return (
		<div className="mainAffGene">
			<div className="mainHeader">
				<div className="cross">
					<button onClick={handleClickClose}><Close /></button>
				</div>
				<h3>Friends</h3>
				<div className="icons">
					<Tooltip title='More'>
					<button onClick={handleClickOpenOptions}>
						<MoreVertIcon />
					</button>
					</Tooltip>
					<MenuOptions />
				</div>
			</div>
			{newAddFriend && <AddFriend setNewAddFriend={setNewAddFriend} />}
			<ItemsFriendList />
		</div>
	)
}

export default FriendList;