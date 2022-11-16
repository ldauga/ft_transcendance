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
import HeaderRoomConvers from './HeaderRoomConvers';

function SendZoneRoomConvers(props: { roomsConversData: { name: string, id: number } }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

	const [messageText, setMessageText] = useState('');
	const [update, setUpdate] = useState(true);

	const [isMute, setMute] = useState(false);
    const [textPlaceHolder, setTextPlaceHolder] = useState("Your message...");

	utilsData.socket.removeAllListeners('demutedUserInRoom');

    utilsData.socket.on('demutedUserInRoom', function (newParticipantReturn: boolean) {
        checkIfMute();
        utilsData.socket.off('demutedUserInRoom');
        utilsData.socket.removeListener('demutedUserInRoom');
    })

	utilsData.socket.removeAllListeners('mutedUserInRoom');

    utilsData.socket.on('mutedUserInRoom', function (mutedUserInRoomReturn: boolean) {
        checkIfMute();
        utilsData.socket.off('mutedUserInRoom');
        utilsData.socket.removeListener('mutedUserInRoom');
    })

	useEffect(() => {
		console.log("useEffect SendZoneRoomConvers");
		// if (update) {
		// 	checkIfMute();
		// 	setUpdate(false);
		// }
	});

	const checkIfMute = async () => {
        await axiosConfig.get('https://10.3.4.5:5001/muteList/checkRoomMute/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
            if (res.data == true) {
                setMute(true);
                setTextPlaceHolder("You are mute");
            }
            else {
                setMute(false);
                setTextPlaceHolder("Your message...");
            }
        })
    };

	function sendMessage() {
		if (messageText.length <= 0 || isMute)
			return;
		const newMsg = {
			id_sender: userData.userReducer.user?.id,
			id_receiver: 0,
			login_sender: userData.userReducer.user?.login,
			login_receiver: "",
			userOrRoom: true,
			room_id: props.roomsConversData.id,
			room_name: props.roomsConversData.name,
			text: messageText
		}
		utilsData.socket.emit('createMsg', newMsg);
		setMessageText("");
	};

	function SendButton() {
		if (messageText.length <= 0) {
			return (
				<button className="sendButtonDisabled" onClick={sendMessage} disabled={messageText.length <= 0}>
					send
				</button>
			);
		}
		else {
			return (
				<button onClick={sendMessage} disabled={messageText.length <= 0}>
					send
				</button>
			);
		}
	};

	return (
		<div className="send-message">
			<TextField value={messageText}
				autoFocus
				onChange={e => setMessageText(e.target.value)}
				placeholder={textPlaceHolder}
				multiline maxRows={5}
				onKeyDown={(e) => {
					if (e.keyCode == 13) {
						e.preventDefault();
						sendMessage();
					}
				}}
				disabled={isMute}
			/>
			<SendButton />
		</div>
	);
}

export default SendZoneRoomConvers
