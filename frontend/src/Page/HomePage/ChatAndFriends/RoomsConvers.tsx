import axios from 'axios';
import { createRef, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/RoomsConvers.css'
import './CSS/Rooms.css'
import './CSS/Convers.scss'
import '../Homepage.scss'
import CreateInvitationRooms from './CreateInvitationRooms';
import React from 'react';
import AffParticipantsRooms from './AffParticipantsRooms';
import { constWhileSecu } from '../HomePage';
import ChangeRoomPassword from './ChangeRoomPassword';
import axiosConfig from '../../../Utils/axiosConfig';

function RoomsConvers(props: { setFriendList: Function, setRooms: Function, setRoomsConvers: Function, roomsConversData: { name: string, id: number }, oldAffRoomConvers: string, setChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);
    const [isAdmin, setAdmin] = useState(false);
    const [isOwner, setOwner] = useState(false);

    const [isAffParticipantsRooms, setAffParticipantsRooms] = useState(false);
    const [isConversRooms, setConversRooms] = useState(true);
    const [isChangeRoomPassword, setChangeRoomPassword] = useState(false);

    const bottom = useRef<null | HTMLDivElement>(null);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // const scrollToBottom = useScrollToBottom();

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        console.log('roomHasBeenDeleted = ', roomHasBeenDeletedReturn);
        if (roomHasBeenDeletedReturn == props.roomsConversData.name) {//NOTIF à ajouter
            closeConvers();
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    utilsData.socket.removeAllListeners('kickedOutOfTheGroup');

    utilsData.socket.on('kickedOutOfTheGroup', function (kickedOutOfTheGroupReturn: boolean) {
        console.log('kickedOutOfTheGroup = ', kickedOutOfTheGroupReturn);
        if (kickedOutOfTheGroupReturn == true) {
            console.log("You were kicked out of the ", props.roomsConversData.name, " group");//NOTIF à ajouter
            closeConvers();
        }
        utilsData.socket.off('kickedOutOfTheGroup');
        utilsData.socket.removeListener('kickedOutOfTheGroup');
    })

    utilsData.socket.removeAllListeners('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        console.log('newMsgReceived = ', data);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    const handleClickChangePassword = () => {
        if (isChangeRoomPassword)
            setChangeRoomPassword(false);
        else
            setChangeRoomPassword(true);
    }

    const closeConvers = () => {
        props.setRoomsConvers(false);
        if (props.oldAffRoomConvers == "Rooms")
            props.setRooms(true);
        else if (props.oldAffRoomConvers == "Chat")
            props.setChat(true);
    };

    const quitConvers = () => {
        const participantToRemove = {
            login: userData.userReducer.user?.login,
            room_name: props.roomsConversData.name
        }
        utilsData.socket.emit('removeParticipant', participantToRemove);
        setUpdate(false);
        closeConvers();
    };

    const removeRoom = () => {
        const roomToRemove = {
            id: userData.userReducer.user?.id,
            room_name: props.roomsConversData.name
        }
        utilsData.socket.emit('removeRoom', roomToRemove);
        closeConvers();
    }

    const affParticipants = () => {
        setConversRooms(false);
        setAffParticipantsRooms(true);
    };

    const checkIfAdmin = async () => {
        let ifAdmin = false;
        await axiosConfig.get('http://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        await axiosConfig.get('http://localhost:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifAdmin = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        console.log("return: ", ifAdmin);
        return ifAdmin;
    };

    const checkIfOwner = async () => {
        await axiosConfig.get('http://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                setOwner(true);
            }
            else {
                setAdmin(false);
                setOwner(false);
            }
        })
    };

    const getListItem = async () => {
        const admin = await checkIfAdmin();
        console.log("getListItem admin: ", admin);
        await axiosConfig.get('http://localhost:5001/messages/room/' + props.roomsConversData.id).then(async (res) => {
            console.log("get List Item Room Conversation", res.data);
            let itemList: any[] = []
            res.data.forEach((item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, text: string }) => {
                itemList.push(<div key={itemList.length.toString()} className={(item.id_sender == userData.userReducer.user?.id ? 'itemListConversContainerMe' : 'itemListConversContainerCorrespondant')}>
                    <div className={(item.id_sender == userData.userReducer.user?.id ? 'converItemList converItemListMe' : 'converItemList converItemListCorrespondant')}>
                        <p>{item.text}</p>
                    </div>
                </div>)
            });
            console.log('itemList : ', itemList);
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [itemListHistory, isConversRooms])

    useEffect(() => {
        checkIfOwner();
        getListItem();
        bottom.current?.scrollIntoView();
    }, [props, isConversRooms]);

    function Header() {
        if (isOwner)
            return (
                <div id="header" className="mainHeader">
                    <div className="mainHeaderLeft mainHeaderSide">
                        <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    </div>
                    <h3>{props.roomsConversData.name}</h3>
                    <div id="RoomsConversHeaderRight" className="mainHeaderRight mainHeaderSide">
                        <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={removeRoom} className="bi bi-x-lg"></button>
                        <button onClick={quitConvers}><i className="bi bi-box-arrow-left"></i></button>
                        <button onClick={handleClickChangePassword}><i className="bi bi-gear-fill"></i></button>
                    </div>
                </div>
            );
        else if (isAdmin)
            return (
                <div id="header" className="mainHeader">
                    <div className="mainHeaderLeft mainHeaderSide">
                        <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    </div>
                    <h3>{props.roomsConversData.name}</h3>
                    <div id="RoomsConversHeaderRight" className="mainHeaderRight mainHeaderSide">
                        <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={quitConvers}><i className="bi bi-box-arrow-left"></i></button>
                        <button onClick={handleClickChangePassword}><i className="bi bi-gear-fill"></i></button>
                    </div>
                </div>
            );
        else
            return (
                <div id="header" className="mainHeader">
                    <div className="mainHeaderLeft mainHeaderSide">
                        <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    </div>
                    <h3>{props.roomsConversData.name}</h3>
                    <div id="RoomsConversHeaderRight" className="mainHeaderRight mainHeaderSide">
                        <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={quitConvers}><i className="bi bi-box-arrow-left"></i></button>
                    </div>
                </div>
            );
    };

    function AffRoomConvers() {

        const [messageText, setMessageText] = useState('');

        function sendMessage() {
            if (messageText.length <= 0)
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

        return (
            <div id="roomsConvers">
                <Header />
                {isChangeRoomPassword && <ChangeRoomPassword roomsConversData={props.roomsConversData} />}
                <AffConvers />
                <div className="sendZoneConvers">
                    <input
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                        placeholder="Your message..."
                    />
                    <button type="button" onClick={() => sendMessage()}>
                        Send
                    </button>
                </div>
            </div>
        );
    };

    function AffConvers() {
        if (!isChangeRoomPassword)
            return (
                <div id="affConversBig" ref={bottom}>
                    {itemListHistory}
                    <div ref={messagesEndRef} />
                </div>
            );
        else
            return (
                <div id="affConversSmall" ref={bottom}>
                    {itemListHistory}
                    <div ref={messagesEndRef} />
                </div>
            );
    };

    return (
        <div id="roomsConvers">
            {isConversRooms && <AffRoomConvers />}
            {isAffParticipantsRooms && <AffParticipantsRooms roomsConversData={props.roomsConversData} setAffParticipantsRooms={setAffParticipantsRooms} setConversRooms={setConversRooms} closeConvers={closeConvers} setRooms={props.setRooms} oldAffRoomConvers={props.oldAffRoomConvers} setChat={props.setChat} />}
        </div>
    );
};

export default RoomsConvers;