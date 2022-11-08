import { Button, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../../State';
import axiosConfig from '../../../Utils/axiosConfig';
import './CSS/Convers.scss'
import { bindActionCreators } from 'redux';
import { initChatNotif, initOneConversChatNotif } from '../../../State/Action-Creators';
import { ArrowBackIosNew } from '@mui/icons-material';

function Convers(props: { setFriendList: Function, setChat: Function, setConvers: Function, conversCorrespondantData: { id: number, login: string, nickname: string, profile_pic: string }, oldAff: string, openFriendConversFromProfile: boolean, setOpenFriendConversFromProfile: Function, setConversCorrespondantData: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [messageText, setMessageText] = useState('');

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const [correspondantIsBlocked, setCorrespondantIsBlocked] = useState(false);

    const dispatch = useDispatch();

    const { delChatNotif, setConversChatNotif } = bindActionCreators(actionCreators, dispatch);

    const closeConvers = () => {
        //setConversChatNotif({ name: props.conversCorrespondantData.login, userOrRoom: false });
        props.setConversCorrespondantData({ id: 0, login: "", nickname: "", profile_pic: "" });
        if (props.openFriendConversFromProfile)
            props.setOpenFriendConversFromProfile(false);
        props.setConvers(false);
        console.log("oldAff: ", props.oldAff);
        if (props.oldAff == "Chat")
            props.setChat(true);
        else
            props.setFriendList(true);
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    };

    //utilsData.socket.removeAllListeners('newChatNotif');

    // utilsData.socket.on('newChatNotif', function (newNotif: { name: string, userOrRoom: boolean }) {
    //     console.log("newChatNotif convers");
    //     console.log("total: ", userData.chatNotifReducer.total);
    //     console.log("persistantReducer.chatNotifReducer.convers.name: ", userData.chatNotifReducer.convers.name, ", newNotif.name: ", newNotif.name);
    //     if (newNotif.name == props.conversCorrespondantData.login && newNotif.userOrRoom == false)
    //         initOneConversChatNotif({ name: newNotif.name, userOrRoom: newNotif.userOrRoom });
    //     utilsData.socket.off('newChatNotif');
    //     utilsData.socket.removeListener('newChatNotif');
    // })

    function sendMessage() {
        if (messageText.length <= 0)
            return;
        const newMsg = {
            id_sender: userData.userReducer.user?.id,
            id_receiver: props.conversCorrespondantData.id,
            login_sender: userData.userReducer.user?.login,
            login_receiver: props.conversCorrespondantData.login,
            userOrRoom: false,
            room_id: 0,
            room_name: "",
            text: messageText
        }
        utilsData.socket.emit('createMsg', newMsg);
        setMessageText("");
        for (let i = 0; i < 5; i++) {
            getListItem();
        }
    };

    utilsData.socket.removeListener('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        console.log('newMsgReceived = ', data);
        for (let i = 0; i < 4; i++) {
            getListItem();
        }
        if (!data.userOrRoom && data.login_sender == props.conversCorrespondantData.login) {
            delChatNotif({ name: props.conversCorrespondantData.login, userOrRoom: false });
        }
        utilsData.socket.emit('delChatNotifs', { loginOwner: userData.userReducer.user?.login, name: props.conversCorrespondantData.login, userOrRoom: false });
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
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

    function getHour() {
        const date = Date();
        let tmp = date.split(' ');
        let tmp2 = tmp[4].split(':');
        return (tmp2[0]);
    }

    function getMinute() {
        const date = Date();
        let tmp = date.split(' ');
        let tmp2 = tmp[4].split(':');
        return (tmp2[1]);
    }

    //onMouseOut={e => { e.currentTarget.children[1].toggleAttribute('className') }}

    function Item(props: { item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        if (props.item.id_sender == 0) {
            return (
                <div className="server_msg">
                    <p>{props.item.text}</p>
                </div>
            );
        }
        else {
            return (
                <div className={(props.item.id_sender == userData.userReducer.user?.id ? 'message sender' : 'message receiver')}>
                    <p>{props.item.text}</p>
                </div>
            );
        }
    };

    function AffDate(props: { item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        console.log("Date: ", Date());
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
    };

    const getListItem = async () => {
        await axiosConfig.get('https://localhost:5001/blackList/checkIfRelationIsBlocked/' + userData.userReducer.user?.login + '/' + props.conversCorrespondantData.login).then(async (res) => {
            console.log("checkIfRelationIsBlocked res.data: ", res.data);
            if (res.data == true && correspondantIsBlocked == false)
                setCorrespondantIsBlocked(true);
        });
        await axiosConfig.get('https://localhost:5001/messages/' + userData.userReducer.user?.id + '/' + props.conversCorrespondantData.id).then(async (res) => {
            console.log("get List Item Conversation");
            let itemList: any[] = []
            res.data.forEach((item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string }) => {
                itemList.push(<div key={itemList.length.toString()} onMouseOver={e => { e.currentTarget.children[0].className = 'date' }} onMouseOut={e => { e.currentTarget.children[0].className = 'dateDisplayNone' }} className={(item.id_sender == userData.userReducer.user?.id ? 'content-sender' : 'content-receiver')}>
                    <AffDate item={item} />
                    <Item item={item} />
                </div>)
            });
            console.log('itemList : ', itemList);
            setItemListHistory(itemList);
        })
        initOneConversChatNotif({ name: props.conversCorrespondantData.login, userOrRoom: false });
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [itemListHistory])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
        getListItem();
        console.log("correspondantIsBlocked: ", false);
    }, [props, correspondantIsBlocked]);

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

    utilsData.socket.removeAllListeners('userBanned');

    utilsData.socket.on('userBanned', function (userBanned: boolean) {
        console.log('userBanned = ', userBanned);
        getListItem();
        utilsData.socket.off('userBanned');
        utilsData.socket.removeListener('userBanned');
    })

    utilsData.socket.removeAllListeners('debanedUser');

    utilsData.socket.on('debanedUser', function (debanedUser: boolean) {
        console.log('debanedUser = ', debanedUser);
        getListItem();
        utilsData.socket.off('debanedUser');
        utilsData.socket.removeListener('debanedUser');
    })

    function AffBlocked() {
        return (
            <div className='relation_blocked'>
                <p>Relation is Blocked</p>
            </div>
        );
    };

    return (
        <div className="chat">
            <div className="header">
                <ArrowBackIosNew onClick={closeConvers} />
                <div className="profile">
                    <img src={props.conversCorrespondantData.profile_pic} onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + props.conversCorrespondantData.login) }} />
                    <div className="name">
                        <p onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + props.conversCorrespondantData.login) }}>{props.conversCorrespondantData.nickname}</p>
                        <p><div className='status'></div>online</p>
                    </div>
                </div>
                {correspondantIsBlocked && <AffBlocked />}
            </div>
            <div className="messages">
                {itemListHistory}
                <div ref={messagesEndRef} />
            </div>
            <div className="send-message">
                <TextField value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder='Your message...'
                    multiline maxRows={5}
                    onKeyDown={(e) => {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    disabled={correspondantIsBlocked}
                />
                <SendButton />
            </div>
        </div>
    )
};

export default Convers;
