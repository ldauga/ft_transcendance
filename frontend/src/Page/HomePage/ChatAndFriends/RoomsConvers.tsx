import axios from 'axios';
import { createRef, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import { animateScroll } from 'react-scroll';
import ScrollToBottom, { useScrollToBottom, useSticky } from 'react-scroll-to-bottom';
import './CSS/RoomsConvers.css'
import './CSS/Convers.css'
import '../HomePage.css'
import CreateRooms from './CreateRooms';
import CreateInvitationRooms from './CreateInvitationRooms';
import React from 'react';
import AffParticipantsRooms from './AffParticipantsRooms';

function RoomsConvers(props: { setFriendList: Function, setRooms: Function, setRoomsConvers: Function, roomsConversData: { name: string, id: number }, oldAffRoomConvers: string }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReduceur);

    const [isCreateInvitation, setCreateInvitation] = useState(false);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);
    const [isAdmin, setAdmin] = useState(false);

    const [isAffParticipantsRooms, setAffParticipantsRooms] = useState(false);
    const [isConversRooms, setConversRooms] = useState(true);

    const bottom = useRef<null | HTMLDivElement>(null);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // const scrollToBottom = useScrollToBottom();

    utilsData.socket.removeAllListeners('removeRoomReturn');

    utilsData.socket.on('removeRoomReturn', function (removeParticipantReturn: boolean) {
        console.log('removeRoomReturn = ', removeParticipantReturn);
        if (removeParticipantReturn == true) {
            // const length = itemListHistory.length;
            // let secu = 0;
            // while (length == itemListHistory.length && secu < 5) {
            //     setItemListHistory([]);
            //     getListItem();
            //     secu++;
            // }
        }
        utilsData.socket.off('removeRoomReturn');
        utilsData.socket.removeListener('removeRoomReturn');
    })

    utilsData.socket.removeAllListeners('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        console.log('newMsgReceived = ', data);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < 5) {
            setItemListHistory([]);
            getListItem();
            secu++;
        }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    const closeConvers = () => {
        props.setRoomsConvers(false);
        if (props.oldAffRoomConvers == "Rooms")
            props.setRooms(true);
        else
            props.setRooms(true);
    };

    const removeParticipant = (item: { login: string, id: number }) => {
        const participantToRemove = {
            login: item.login,
            room_name: props.roomsConversData.name
        }
        utilsData.socket.emit('removeParticipant', participantToRemove);
        setUpdate(false);
    }

    const quitConvers = () => {
        let loginTmp = userData.userReducer.user?.login;
        let idTmp = userData.userReducer.user?.id;
        removeParticipant({ login: loginTmp !== undefined ? loginTmp : '', id: idTmp !== undefined ? idTmp : 0 });
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

    const addInvitationRequest = () => {
        if (isCreateInvitation)
            setCreateInvitation(false);
        else
            setCreateInvitation(true);
    };

    const affParticipants = () => {
        setConversRooms(false);
        setAffParticipantsRooms(true);
    };

    const checkIfOwner = async () => {
        await axios.get('http://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true)
                setAdmin(true);
            else
                setAdmin(false);
        })
    };

    const getListItem = async () => {
        await axios.get('http://localhost:5001/messages/' + props.roomsConversData.id + '/' + props.roomsConversData.id + '/room').then(async (res) => {
            console.log("get List Item Room Conversation");
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
        if (isAdmin == true)
            return (
                <div id='roomsConversHeader'>
                    <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    <p>{props.roomsConversData.name}</p>
                    <div id='roomsConversHeaderButton'>
                        <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={addInvitationRequest} className="bi bi-plus-lg"></button>
                        {/* <button onClick={removeRoom} className="bi bi-plus-lg"></button> */}
                    </div>
                </div>
            );
        else
            return (
                <div id='roomsConversHeader'>
                    <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    <p>{props.roomsConversData.name}</p>
                    <div id='roomsConversHeaderButton'>
                        <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={quitConvers}><i className="bi bi-box-arrow-left"></i></button>
                    </div>
                </div>
            );
    };

    function AffRoomConvers() {

        const [messageText, setMessageText] = useState('');

        function sendMessage() {
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
            for (let i = 0; i < 9; i++) {
                getListItem();
            }
        };

        return (
            <div id="roomsConvers">
                <Header />
                {isCreateInvitation && <CreateInvitationRooms roomsConversData={props.roomsConversData} />}
                <div id="affConvers" ref={bottom}>
                    {itemListHistory}
                    <div ref={messagesEndRef} />
                </div>
                <div id="sendZoneConvers">
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

    return (
        <div id="roomsConvers">
            {isConversRooms && <AffRoomConvers />}
            {isAffParticipantsRooms && <AffParticipantsRooms roomsConversData={props.roomsConversData} isAdmin={isAdmin} setAffParticipantsRooms={setAffParticipantsRooms} setConversRooms={setConversRooms} />}
        </div>
    );
};

export default RoomsConvers;