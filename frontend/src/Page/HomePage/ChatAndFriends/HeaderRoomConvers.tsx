import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../../State';
import './CSS/RoomsConvers.scss'
import './CSS/Rooms.scss'
import './CSS/Convers.scss'
import '../Homepage.scss'
import React from 'react';
import AffParticipantsRooms from './AffParticipantsRooms';
import axiosConfig from '../../../Utils/axiosConfig';
import { Divider, IconButton, ListItemIcon, Menu, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, SelectChangeEvent, Grid, Switch, TextField, Tooltip } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ArrowBackIosNew, Logout, Person, Settings, Update } from "@mui/icons-material";
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { valideInput } from '../../../Utils/utils';
import { bindActionCreators } from 'redux';
import AffConvers from './AffConvers';
import HeaderRoomConversRight from './HeaderRoomConversRight';

function HeaderRoomConvers(props: { closeConvers: Function, roomsConversData: { name: string, id: number } }) {

	const utilsData = useSelector((state: RootState) => state.utils);

	const [pp1, setPp1] = useState("");
	const [pp2, setPp2] = useState("");

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	useEffect(() => {
		console.log("useEffect HeaderRoomConvers");
		// if (!verif) {
		// 	console.log("useEffect HeaderRoomConvers verif");
		// 	checkIfAdmin();
		// 	checkIfOwner();
		// 	verif = true;
		// }
	})

	function HeaderPrint() {

		const [textNicknameHeader, setTextNicknameHeader] = useState("");
		const [update, setUpdate] = useState(true);

		utilsData.socket.on('getAllParticipantsReturn', function (data: { id: number, login: string, nickname: string, profile_pic: string, admin: boolean, mute: boolean }[]) {
			console.log("getAllPArticipantReturn");
			let str_nickname = "";
			for (let i = 0; i < data.length; i++) {
				if (i + 1 < data.length)
					str_nickname = str_nickname + data[i].nickname + ", ";
				else
					str_nickname = str_nickname + data[i].nickname;
			}
			console.log("str_nickname: ", str_nickname);
			setTextNicknameHeader(str_nickname);
			utilsData.socket.off('getAllParticipantsReturn');
			utilsData.socket.removeListener('getAllParticipantsReturn');
		})

		const affParticipants = () => {
			// setConversRooms(false);
			// setAffParticipantsRooms(true);
		};

		const closeConvers = () => {
		//setConversChatNotif({ name: props.roomsConversData.name, userOrRoom: true });
		props.closeConvers();
	};

		useEffect(() => {
			console.log("useEffect HeaderPrint")
			console.log("props.roomsConversData: ", props.roomsConversData);
			if (props.roomsConversData.id != 0) {
				console.log("useEffect HeaderPrint verif");
				utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
				setUpdate(false);
			}
			// utilsData.socket.emit('GET_ALL_USERS_IN_ROOM', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
		}, [])

		return (
			<>
				<ArrowBackIosNew onClick={closeConvers} />
				<div className="group-profile">
					{pp2 && pp1 ? <div className='profile-pic-group'>
						<img src={pp1} />
						<img src={pp2} />
					</div> : pp1 ?
						<div className='profile'><img src={pp1} /></div> :
						<div className='profile-pic-group'><img src="" /></div>}
					<div className="group-name">
						<p>{props.roomsConversData.name}</p>
						<p className='name-participants' onClick={affParticipants}>{textNicknameHeader}</p>
					</div>
				</div>
			</>
		)
	}

	return (
		<>
			{/* <HeaderPrint /> */}
			{/* <HeaderRoomConversRight setRoomsConversData={props.setRoomsConversData} setRoomsConvers={props.setRoomsConvers} setChat={props.setChat} roomsConversData={props.roomsConversData}/> */}
		</>
	);
};

export default HeaderRoomConvers;
