import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import Chat from "./Chat";
import Convers from "./Convers";
import './CSS/FriendList.css';
import FriendList from "./FriendList";
import InvitationRequest from "./InvitationRequest";
import Rooms from "./Rooms";
import RoomsConvers from "./RoomsConvers";
import './CSS/ChatAndFriends.css'

function ChatAndFriend(props: { isNavChat: boolean, isNavFriendList: boolean, closeFriendList: Function, closeChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [isFriendList, setFriendList] = useState(true);
    const [isInvitationRequest, setInvitationRequest] = useState(false);
    const [isConvers, setConvers] = useState(false);
    const [isChat, setChat] = useState(false);
    const [isRooms, setRooms] = useState(false);
    const [isRoomsConvers, setRoomsConvers] = useState(false);
    const [conversCorrespondantData, setConversCorrespondantData] = useState({ id: 0, login: "" });
    const [roomsConversData, setroomsConversData] = useState({ name: "", id: 0 });
    const [oldAff, setOldAff] = useState("");
    const [oldAffRoomsConvers, setOldAffRoomConvers] = useState("");

    const closeAll = () => {
        setFriendList(false);
        setInvitationRequest(false);
        setConvers(false);
        setChat(false);
        setRooms(false);
        setRoomsConvers(false);
        setConversCorrespondantData({ id: 0, login: "" });
        setroomsConversData({ name: "", id: 0 });
        setOldAff("");
        setOldAffRoomConvers("");
    }

    useEffect(() => {
        closeAll();
        if (props.isNavChat)
            setChat(true);
        else if (props.isNavFriendList)
            setFriendList(true);
    }, [props]);

    return (
        <div id="mainAffChatAndFriend">
            {isFriendList && <FriendList setFriendList={setFriendList} setInvitationRequest={setInvitationRequest} setRooms={setRooms} setConvers={setConvers} setConversCorrespondantData={setConversCorrespondantData} setOldAff={setOldAff} closeFriendList={props.closeFriendList} />}
            {isInvitationRequest && <InvitationRequest setFriendList={setFriendList} setInvitationRequest={setInvitationRequest} />}
            {isConvers && <Convers setFriendList={setFriendList} setChat={setChat} setConvers={setConvers} conversCorrespondantData={conversCorrespondantData} oldAff={oldAff} />}
            {isChat && <Chat setFriendList={setFriendList} setChat={setChat} setConvers={setConvers} setConversCorrespondantData={setConversCorrespondantData} setOldAff={setOldAff} setRoomsConvers={setRoomsConvers} setroomsConversData={setroomsConversData} setOldAffRoomConvers={setOldAffRoomConvers} closeChat={props.closeChat} />}
            {isRooms && <Rooms setFriendList={setFriendList} setRooms={setRooms} setRoomsConvers={setRoomsConvers} setroomsConversData={setroomsConversData} setOldAffRoomConvers={setOldAffRoomConvers} />}
            {isRoomsConvers && <RoomsConvers setFriendList={setFriendList} setRooms={setRooms} setRoomsConvers={setRoomsConvers} roomsConversData={roomsConversData} oldAffRoomConvers={oldAffRoomsConvers} setChat={setChat} />}
        </div>
    )
}

export default ChatAndFriend;