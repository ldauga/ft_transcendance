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
import AffRoomConvers from './AffRoomConvers';
import AffConversTest from './AffConversTest';

function RoomsConvers(props: { setFriendList: Function, setRooms: Function, setRoomsConvers: Function, roomsConversData: { name: string, id: number }, oldAffRoomConvers: string, setChat: Function, setRoomsConversData: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);

    const [isAffParticipantsRooms, setAffParticipantsRooms] = useState(false);
    const [isConversRooms, setConversRooms] = useState(true);

    // const scrollToBottom = useScrollToBottom();

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        if (roomHasBeenDeletedReturn == props.roomsConversData.name) {//NOTIF à ajouter
            closeConvers();
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    utilsData.socket.removeAllListeners('kickedOutOfTheGroup');

    utilsData.socket.on('kickedOutOfTheGroup', function (kickedOutOfTheGroupReturn: boolean) {
        if (kickedOutOfTheGroupReturn == true) {
            closeConvers();
        }
        utilsData.socket.off('kickedOutOfTheGroup');
        utilsData.socket.removeListener('kickedOutOfTheGroup');
    })

    // utilsData.socket.removeAllListeners('newParticipant');

    // utilsData.socket.on('newParticipant', function (demutedUserInRoomReturn: boolean) {
    //     utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
    //     utilsData.socket.off('newParticipant');
    //     utilsData.socket.removeListener('newParticipant');
    // })

    // utilsData.socket.removeAllListeners('removeParticipantReturn');

    // utilsData.socket.on('removeParticipantReturn', function (removeParticipantReturnReturn: boolean) {
    //     utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
    //     utilsData.socket.off('removeParticipantReturn');
    //     utilsData.socket.removeListener('removeParticipantReturn');
    // })

    const closeConvers = () => {
        //setConversChatNotif({ name: props.roomsConversData.name, userOrRoom: true });
        props.setRoomsConversData({ name: "", id: 0 });
        props.setRoomsConvers(false);
        props.setChat(true);
    };

    useEffect(() => {
		console.log('useEffect Room convers')
        // checkIfOwner();
        // checkIfAdmin();
        // checkIfMute();
        // getUsers();
    });

    // const getUsers = async () => {
    //     let itemList: { id: number, login: string, nickname: string, profile_pic: string }[] = [];
    //     let i = 0;
    //     setPp1("");
    //     setPp2("");
    //     setUsers([]);
    //     setParticipants([]);
    //     await axiosConfig.get('https://10.3.4.5:5001/participants/allUserForOneRoom/' + props.roomsConversData.name).then(async (res) => {
    //         res.data.forEach(async (item: { login: string, id: number }) => {
    //             await axiosConfig.get('https://10.3.4.5:5001/user/id/' + item.id).then(async (res) => {
    //                 if (i == 0) {
    //                     setPp1(res.data.profile_pic);
    //                     i++;
    //                 }
    //                 else if (i == 1) {
    //                     setPp2(res.data.profile_pic);
    //                     i++;
    //                 }
    //                 itemList.push({ id: res.data.id, login: res.data.login, nickname: res.data.nickname, profile_pic: res.data.profile_pic });
    //             });
    //         });
    //         setParticipants(itemList);
    //     })
    //     await axiosConfig.get('https://10.3.4.5:5001/messages/getUsersRoomConversMessages/' + props.roomsConversData.name).then(async (res) => {
    //         res.data.forEach(async (item: { login: string, id: number }) => {
    //             if (!itemList.find(obj => obj.login == item.login))
    //                 await axiosConfig.get('https://10.3.4.5:5001/user/id/' + item.id).then(async (res) => {
    //                     itemList.push({ id: res.data.id, login: res.data.login, nickname: res.data.nickname, profile_pic: res.data.profile_pic });
    //                 });
    //         });
    //     })
    //     setUsers(itemList);
    // }

    return (
        <div className="roomsConvers">
			{/* <AffConversTest/> */}
            {isConversRooms && <AffRoomConvers closeConvers={closeConvers} roomsConversData={props.roomsConversData} />}
            {isAffParticipantsRooms && <AffParticipantsRooms roomsConversData={props.roomsConversData} setAffParticipantsRooms={setAffParticipantsRooms} setConversRooms={setConversRooms} closeConvers={closeConvers} setRooms={props.setRooms} oldAffRoomConvers={props.oldAffRoomConvers} setChat={props.setChat} />}
        </div>
    );
};

export default RoomsConvers;
