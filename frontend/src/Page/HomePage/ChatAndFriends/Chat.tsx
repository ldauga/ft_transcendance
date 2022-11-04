import { Tooltip } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isJSDocTemplateTag } from 'typescript';
import { RootState } from '../../../State';
import axiosConfig from '../../../Utils/axiosConfig';
import './CSS/Chat.scss'
import SendChatMsg from './SendChatMsg';

function Chat(props: { setFriendList: Function, setChat: Function, setConvers: Function, setConversCorrespondantData: Function, setRooms: Function, setOldAff: Function, setRoomsConvers: Function, setroomsConversData: Function, setOldAffRoomConvers: Function, closeChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [isSendChatMsg, setSendChatMsg] = useState(false);

    const closeChat = () => {
        props.closeChat();
        props.setChat(false);
    };

    utilsData.socket.removeListener('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        console.log('newMsgReceived = ', data);
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    utilsData.socket.removeListener('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (data: any) {
        console.log('removeParticipantReturn = ', data);
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    utilsData.socket.removeListener('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (data: any) {
        console.log('roomHasBeenDeleted = ', data);
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    const openConvers = (item: { name: string, id: number, profile_pic: string, userOrRoom: boolean }) => {
        if (!item.userOrRoom) {
            props.setConversCorrespondantData({ id: item.id, login: item.name });
            props.setChat(false);
            props.setConvers(true);
        }
        else {
            props.setroomsConversData({ name: item.name, id: item.id });
            props.setChat(false);
            props.setRoomsConvers(true);
        }
    };

    const openSendChatMsg = () => {
        if (isSendChatMsg)
            setSendChatMsg(false);
        else
            setSendChatMsg(true);
    }

    const handleClickRooms = () => {
        props.setChat(false);
        props.setRooms(true);
    };

    const getListItem = async () => {
        let relationList: any[] = [];
        let ChatList: { name: string, id: number, profile_pic: string, userOrRoom: boolean }[] = [];
        await axiosConfig.get('https://localhost:5001/messages/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.id).then(async (res) => {
            relationList = res.data;
        });
        console.log("relationList: ", relationList);
        for (let i = 0; i < relationList.length; i++) {
            if (!relationList[i].userOrRoom) {
                const user = await axiosConfig.get('https://localhost:5001/user/id/' + relationList[i].id);
                console.log("user.data: ", user.data, "i: ", i);
                console.log("push 1");
                ChatList.push({ name: user.data.nickname, id: user.data.id, profile_pic: user.data.profile_pic, userOrRoom: false });
            }
            else {
                const checkIfParticipant = await axiosConfig.get('https://localhost:5001/participants/check/' + userData.userReducer.user?.login + '/' + relationList[i].room_name);
                console.log("checkIfParticipant: ", checkIfParticipant.data);
                if (checkIfParticipant.data) {
                    console.log("push 2");
                    ChatList.push({ name: relationList[i].room_name, id: relationList[i].room_id, profile_pic: "", userOrRoom: true });
                }
            }
        }
        let itemList: any[] = [];
        console.log("ChatList.length = ", ChatList.length);
        await ChatList.forEach(async (item: { name: string, id: number, profile_pic: string, userOrRoom: boolean }) => {
            console.log("test2");
            if (!item.userOrRoom) {
                await itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                    <div className="itemConvers" onClick={() => openConvers(item)}>
                        <img src={item.profile_pic}></img>
                        <p>{item.name}</p>
                    </div>
                </div>)
            }
            else {
                await itemList.push(<div key={itemList.length.toString()} className='itemListConvers'>
                    <div className="itemConvers" onClick={() => openConvers(item)}>
                        <p>{item.name}</p>
                    </div>
                </div>)
            }
        });
        console.log("end");
        setItemListHistory(itemList);
    }

    useEffect(() => {
        getListItem();
        props.setOldAff("Chat");
        props.setOldAffRoomConvers("Chat");
    }, [props]);

    return (
        <div className="mainAffGene">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={closeChat} className="bi bi-x"></button>
                </div>
                <h3>Chat</h3>
                <div className="mainHeaderRight mainHeaderSide">
                    <Tooltip title="Groups">
                    <button onClick={handleClickRooms}><i className="bi bi-people-fill"></i></button>
                    </Tooltip>
                    <Tooltip title="New Message">
                    <button onClick={openSendChatMsg} id="openSendChatMsg" className="bi bi-send-fill"></button>
                    </Tooltip>
                </div>
            </div>
            {isSendChatMsg && <SendChatMsg />}
            {itemListHistory}
        </div>
    );
};

export default Chat;
