import React, { useEffect, useState } from "react";
import Chat from "./Chat";
import Convers from "./Convers";
import FriendList from "./FriendList";
import InvitationRequest from "./InvitationRequest";
import RoomsConvers from "./RoomsConvers";
import './CSS/ChatAndFriends.scss'
import AffNotif from "./AffNotif";
import RoomsList from "./RoomsList";
import AffUsersBanned from "./AffUsersBanned";

function ChatAndFriendAndNotif(props: { setLastNbNotif: Function, setOpenPopUp: any, isNotif: boolean, isNavChat: boolean, isNavFriendList: boolean, closeFriendList: Function, closeChat: Function, closeNotif: Function, openFriendList: Function, openChat: Function, openNotif: Function, openFriendConversFromProfile: boolean, dataFriendConversFromProfile: { id: number, login: string, nickname: string, profile_pic: string }, setOpenFriendConversFromProfile: Function, setConversNotif: Function }) {

    const [isFriendList, setFriendList] = useState(false);
    const [isInvitationRequest, setInvitationRequest] = useState(false);
    const [isConvers, setConvers] = useState(false);
    const [isChat, setChat] = useState(false);
    const [isRooms, setRooms] = useState(false);
    const [isRoomsConvers, setRoomsConvers] = useState(false);
    const [conversCorrespondantData, setConversCorrespondantData] = useState({ id: 0, login: "", nickname: "", profile_pic: "" });
    const [roomsConversData, setroomsConversData] = useState({ name: "", id: 0 });
    const [oldAff, setOldAff] = useState("");
    const [oldAffRoomsConvers, setOldAffRoomConvers] = useState("");
    const [isNotif, setNotif] = useState(false);
    const [isRoomsList, setRoomsList] = useState(false);
    const [isBannedUsers, setBannedUsers] = useState(false);

    const [goToOpenInvitationRequest, setGoToOpenInvitationRequest] = useState(false);

    const closeAll = () => {
        setFriendList(false);
        setInvitationRequest(false);
        setConvers(false);
        setChat(false);
        setRooms(false);
        setRoomsConvers(false);
        setConversCorrespondantData({ id: 0, login: "", nickname: "", profile_pic: "" });
        setroomsConversData({ name: "", id: 0 });
        setOldAff("");
        setOldAffRoomConvers("");
        setNotif(false);
        setRoomsList(false);
        setBannedUsers(false);
    }


    useEffect(() => {
        if (conversCorrespondantData.login.length == 0) {
            if (roomsConversData.name.length == 0) {
                props.setConversNotif({ name: "", userOrRoom: false })
            }
            else {
                props.setConversNotif({ name: roomsConversData.name, userOrRoom: true })
            }
        }
        else {
            props.setConversNotif({ name: conversCorrespondantData.login, userOrRoom: false })
        }
    }, [conversCorrespondantData, roomsConversData]);

    useEffect(() => {
        closeAll();
        if (props.isNavChat)
            setChat(true);
        else if (props.isNavFriendList && !goToOpenInvitationRequest)
            setFriendList(true);
        else if (props.isNavFriendList && goToOpenInvitationRequest) {
            setInvitationRequest(true);
            setGoToOpenInvitationRequest(false);
        }
        else if (props.isNotif) {
            setNotif(true);
        }
        else if (props.openFriendConversFromProfile) {
            setFriendList(true);
        }
    }, [props.isNavChat, props.isNotif, props.isNavFriendList]);

    return (
        <div className="mainAffChatAndFriend">
            {isFriendList && <FriendList setFriendList={setFriendList} setInvitationRequest={setInvitationRequest} setRooms={setRooms} setConvers={setConvers} setConversCorrespondantData={setConversCorrespondantData} setOldAff={setOldAff} closeFriendList={props.closeFriendList} setBannedUsers={setBannedUsers} openFriendConversFromProfile={props.openFriendConversFromProfile} dataFriendConversFromProfile={props.dataFriendConversFromProfile} />}
            {isNotif && <AffNotif setLastNbNotif={props.setLastNbNotif} setNotif={setNotif} setFriendList={setFriendList} setInvitationRequest={setInvitationRequest} setConvers={setConvers} setChat={setChat} closeNotif={props.closeNotif} openFriendList={props.openFriendList} setGoToOpenInvitationRequest={setGoToOpenInvitationRequest} />}
            {isInvitationRequest && <InvitationRequest setFriendList={setFriendList} setInvitationRequest={setInvitationRequest} />}
            {isConvers && <Convers setFriendList={setFriendList} setChat={setChat} setConvers={setConvers} conversCorrespondantData={conversCorrespondantData} oldAff={oldAff} openFriendConversFromProfile={props.openFriendConversFromProfile} setOpenFriendConversFromProfile={props.setOpenFriendConversFromProfile} setConversCorrespondantData={setConversCorrespondantData} />}
            {isChat && <Chat setFriendList={setFriendList} setChat={setChat} setConvers={setConvers} setConversCorrespondantData={setConversCorrespondantData} setRooms={setRooms} setOldAff={setOldAff} setRoomsConvers={setRoomsConvers} setroomsConversData={setroomsConversData} setOldAffRoomConvers={setOldAffRoomConvers} closeChat={props.closeChat} setRoomsList={setRoomsList} />}
            {isRoomsConvers && <RoomsConvers setFriendList={setFriendList} setRooms={setRooms} setRoomsConvers={setRoomsConvers} roomsConversData={roomsConversData} oldAffRoomConvers={oldAffRoomsConvers} setChat={setChat} setRoomsConversData={setroomsConversData} />}
            {isRoomsList && <RoomsList setRooms={setRooms} setRoomsList={setRoomsList} setChat={setChat} />}
            {isBannedUsers && <AffUsersBanned setFriendList={setFriendList} setBannedUsers={setBannedUsers} />}
        </div>
    )
}

export default ChatAndFriendAndNotif;