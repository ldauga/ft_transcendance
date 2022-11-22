import { AddComment, Close, Group, GroupAdd } from '@mui/icons-material';
import { Badge, Tooltip } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isJSDocTemplateTag } from 'typescript';
import { actionCreators, RootState } from '../../../State';
import axiosConfig from '../../../Utils/axiosConfig';
import CreateRooms from './CreateRooms';
import './CSS/Chat.scss'
import SendChatMsg from './SendChatMsg';

function Chat(props: { setFriendList: Function, setChat: Function, setConvers: Function, setConversCorrespondantData: Function, setRooms: Function, setOldAff: Function, setRoomsConvers: Function, setroomsConversData: Function, setOldAffRoomConvers: Function, closeChat: Function, setRoomsList: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>());
    const [isSendChatMsg, setSendChatMsg] = useState(false);
    const [isCreateGroup, setCreateGroup] = useState(false);

    const dispatch = useDispatch();

    const { delChatNotif, setConversChatNotif } = bindActionCreators(actionCreators, dispatch);

    const closeChat = () => {
        props.closeChat();
        props.setChat(false);
    };

    const affRoomsList = async () => {
        props.setChat(false);
        props.setRoomsList(true);
    };

    utilsData.socket.removeListener('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    utilsData.socket.removeListener('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (data: any) {
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    utilsData.socket.removeListener('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (data: any) {
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    const openConvers = (item: { login: string, name: string, id: number, profile_pic: string, userOrRoom: boolean }) => {
        if (!item.userOrRoom) {
            props.setConversCorrespondantData({ id: item.id, login: item.login, nickname: item.name, profile_pic: item.profile_pic });
            delChatNotif({ name: item.login, userOrRoom: false });
            utilsData.socket.emit('delChatNotifs', { loginOwner: userData.userReducer.user?.login, name: item.login, userOrRoom: false });
            props.setChat(false);
            props.setConvers(true);
        }
        else {
            props.setroomsConversData({ name: item.name, id: item.id });
            delChatNotif({ name: item.name, userOrRoom: true });
            utilsData.socket.emit('delChatNotifs', { loginOwner: userData.userReducer.user?.login, name: item.name, userOrRoom: true });
            props.setChat(false);
            props.setRoomsConvers(true);
        }
    };

    const openSendChatMsg = () => {
        if (isSendChatMsg)
            setSendChatMsg(false);
        else {
            setCreateGroup(false)
            setSendChatMsg(true);
        }
    }

    const affCreateGroup = async () => {
        if (isCreateGroup)
            setCreateGroup(false);
        else {
            setSendChatMsg(false);
            setCreateGroup(true);
        }
    };

    const handleClickRooms = () => {
        props.setChat(false);
        props.setRooms(true);
    };

    const getListItem = async () => {
        let relationList: any[] = [];
        let ChatList: { login: string, name: string, id: number, profile_pic: string, userOrRoom: boolean }[] = [];
        await axiosConfig.get('https://localhost:5001/messages/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id).then(async (res) => {
            relationList = res.data;
        });
        if (relationList.length > 0) {
            for (let i = 0; i < relationList.length; i++) {
                if (!relationList[i].userOrRoom) {
                    const user = await axiosConfig.get('https://localhost:5001/user/id/' + relationList[i].id);
                    ChatList.push({ login: user.data.login, name: user.data.nickname, id: user.data.id, profile_pic: user.data.profile_pic, userOrRoom: false });
                }
                else {
                    const checkIfParticipant = await axiosConfig.get('https://localhost:5001/participants/check/' + userData.userReducer.user?.login + '/' + relationList[i].room_name);
                    if (checkIfParticipant.data) {
                        ChatList.push({ login: "", name: relationList[i].room_name, id: relationList[i].room_id, profile_pic: "", userOrRoom: true });
                    }
                }
            }
            let itemList: any[] = [];
            await ChatList.forEach(async (item: { login: string, name: string, id: number, profile_pic: string, userOrRoom: boolean }) => {
                if (!item.userOrRoom) {
                    await itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                        <div className="itemConvers" onClick={() => openConvers(item)}>
                            <Badge color="error" badgeContent={(userData.chatNotifReducer.chatNotifArray.find(obj => (obj.name == item.login && obj.userOrRoom == item.userOrRoom))?.nb)}>
                                <img src={item.profile_pic}></img>
                            </Badge>
                            <p>{item.name}</p>
                        </div>
                    </div>)
                }
                else {
                    await itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                        <div className="itemConvers" onClick={() => openConvers(item)}>
                            <Badge color="error" badgeContent={(userData.chatNotifReducer.chatNotifArray.find(obj => (obj.name == item.name && obj.userOrRoom == item.userOrRoom))?.nb)}>
                                <Group />
                            </Badge>
                            <p>{item.name}</p>
                        </div>
                    </div>);
                }
            });
            setItemListHistory(itemList);
        }
    };

    useEffect(() => {
        getListItem();
        props.setOldAff("Chat");
        props.setOldAffRoomConvers("Chat");
    }, [props, isSendChatMsg]);

    return (
        <div className="mainAffGene">
            <div className="mainHeader">
                <div className="cross">
                    <button onClick={closeChat}> <Close /></button>
                </div>
                <h3>Chat</h3>
                <div className="icons">
                    <Tooltip title="Group List">
                        <button onClick={affRoomsList}><Group /></button>
                    </Tooltip>
                    <Tooltip title="Create Group">
                        <button onClick={affCreateGroup}><GroupAdd /></button>
                    </Tooltip>
                    <Tooltip title="New Message">
                        <button onClick={openSendChatMsg}><AddComment /></button>
                    </Tooltip>
                </div>
            </div>
            {isCreateGroup && <CreateRooms setCreateGroup={setCreateGroup} />}
            {isSendChatMsg && <SendChatMsg setSendChatMsg={setSendChatMsg} />}
            {itemListHistory}
        </div>
    );
};

export default Chat;
