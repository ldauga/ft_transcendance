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
import { ArrowBackIosNew, Logout, Person, Settings } from "@mui/icons-material";
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { valideInput } from '../../../Utils/utils';
import { bindActionCreators } from 'redux';

function AffConvers(props: { roomsConversData: { name: string, id: number } }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const [itemListHistory, setItemListHistory] = useState(Array<any>());
    const [update, setUpdate] = useState(true);
    const [users, setUsers] = useState<{ id: number, login: string, nickname: string, profile_pic: string }[]>(new Array());

    const dispatch = useDispatch();
    const { delChatNotif, initOneConversChatNotif, setConversChatNotif } = bindActionCreators(actionCreators, dispatch);

    utilsData.socket.removeAllListeners('newParticipant');

    utilsData.socket.on('newParticipant', function (demutedUserInRoomReturn: boolean) {
        utilsData.socket.emit('GET_ALL_USERS_IN_ROOM', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('newParticipant');
        utilsData.socket.removeListener('newParticipant');
    })

    utilsData.socket.removeAllListeners('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (removeParticipantReturnReturn: boolean) {
        utilsData.socket.emit('GET_ALL_USERS_IN_ROOM', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    utilsData.socket.removeAllListeners('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        utilsData.socket.emit('GET_ALL_USERS_IN_ROOM', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        // const length = itemListHistory.length;
        // let secu = 0;
        // while (length == itemListHistory.length && secu < constWhileSecu) {
        //     getListItem();
        //     secu++;
        // }
        //utilsData.socket.emit('delChatNotifs', { loginOwner: userData.userReducer.user?.login, name: props.roomsConversData.name, userOrRoom: true });
        // if (data.userOrRoom && data.room_name == props.roomsConversData.name) {
        //     delChatNotif({ name: props.roomsConversData.name, userOrRoom: true });
        // }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    utilsData.socket.removeAllListeners('getAllUsersInRoomReturn');

    utilsData.socket.on('getAllUsersInRoomReturn', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        console.log("getAllUsersInRoomReturn: ", data);
        getListItem(data);
        utilsData.socket.off('getAllUsersInRoomReturn');
        utilsData.socket.removeListener('getAllUsersInRoomReturn');
    })

    function getYear() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[3])
            return ("");
        return (tmp[3]);
    }

    function getMonth() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[1])
            return ("");
        return (tmp[1]);
    }

    function getDay() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[2])
            return ("");
        return (tmp[2]);
    }

    function AffDate(props: { usersTmp: { id: number, login: string, nickname: string, profile_pic: string }[], item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        if (props.item.id_sender == userData.userReducer.user?.id) {
            if (getYear() != props.item.year)
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.month} {props.item.day} {props.item.year} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getMonth() != props.item.month)
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getDay() != props.item.day)
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.hour}:{props.item.minute}</p>
                    </div>
                );
        }
        else {
            const user = props.usersTmp.find(obj => obj.id == props.item.id_sender);
            const nickname = user?.nickname;
            if (getYear() != props.item.year)
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.month} {props.item.day} {props.item.year} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getMonth() != props.item.month)
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getDay() != props.item.day)
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
        }

    };

    function Item(props: { usersTmp: { id: number, login: string, nickname: string, profile_pic: string }[], item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, serverMsg: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        if (props.item.id_sender == userData.userReducer.user?.id && !props.item.serverMsg) {
            return (
                <div className='inItem2'>
                    <AffDate usersTmp={props.usersTmp} item={props.item} />
                    <div onMouseOver={e => { var child = e.currentTarget.parentElement?.children[0]; if (child) child.className = 'date' }} onMouseOut={e => { var child = e.currentTarget.parentElement?.children[0]; if (child) child.className = 'dateDisplayNone' }} className={(props.item.id_sender == userData.userReducer.user?.id ? 'message sender' : 'message receiver')}>
                        <p>{props.item.text}</p>
                    </div>
                </div>
            );
        }
        else if (props.item.serverMsg) {
            return (
                <div className="server_msg">
                    <p>{props.item.text}</p>
                </div>
            );
        }
        else {
            const pp = props.usersTmp.find(obj => obj.id == props.item.id_sender)?.profile_pic;
            const nickname = props.usersTmp.find(obj => obj.id == props.item.id_sender)?.nickname;
            const login = props.usersTmp.find(obj => obj.id == props.item.id_sender)?.login;
            return (
                <div className='inItem2'>
                    <div className="picture-message">
                        <Tooltip title={nickname}>
                            <img onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + login) }} src={pp}></img>
                        </Tooltip>
                        <div onMouseOver={e => { var child = e.currentTarget.parentElement?.parentElement?.children[1]; if (child) child.className = 'date' }} onMouseOut={e => { var child = e.currentTarget.parentElement?.parentElement?.children[1]; if (child) child.className = 'dateDisplayNone' }} className={(props.item.id_sender == userData.userReducer.user?.id ? 'message sender' : 'message receiver')}>
                            <p>{props.item.text}</p>
                        </div>
                    </div>
                    <AffDate usersTmp={props.usersTmp} item={props.item} />
                </div>
            );
        }
    };

    const getUsers = async (data: { id: number, login: string, nickname: string, profile_pic: string }[]) => {
        let itemList: { id: number, login: string, nickname: string, profile_pic: string }[] = [];
        let i = 0;
        setUsers([]);
        data.forEach(async (item: { id: number, login: string, nickname: string, profile_pic: string }) => {
            itemList.push({ id: item.id, login: item.login, nickname: item.nickname, profile_pic: item.profile_pic });
        });
        setUsers(itemList);
        return (itemList);
    }

    const getListItem = async (data: { id: number, login: string, nickname: string, profile_pic: string }[]) => {
        const usersTmp = await getUsers(data);
        await axiosConfig.get('https://localhost:5001/messages/room/' + props.roomsConversData.id).then(async (res) => {
            let itemList: any[] = []
            console.log("res: ", res);
            res.data.forEach((item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, serverMsg: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string }) => {
                itemList.push(<div key={itemList.length.toString()} className={((item.id_sender == userData.userReducer.user?.id && !item.serverMsg) ? 'content-sender' : (item.serverMsg ? 'itemListConversContainerServer' : 'content-receiver'))}>
                    <Item usersTmp={usersTmp} item={item} />
                </div>)
            });
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
		console.log('useEffect aff convers')
        messagesEndRef.current?.scrollIntoView();
        // if (userData.chatNotifReducer.total != oldChatNotifTotal) {
        //     initOneConversChatNotif({ name: props.roomsConversData.name, userOrRoom: true });
        //     setOldChatNotifTotal(userData.chatNotifReducer.total);
        // }
    }, [itemListHistory])

    useEffect(() => {
		console.log('useEffect aff convers 2')
        if (update) {
            setUpdate(false);
        }
    });

    // ref={bottom}

    return (
        <div className="messages" >
            {itemListHistory}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default AffConvers;