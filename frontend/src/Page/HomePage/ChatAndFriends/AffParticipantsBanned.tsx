import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/AffParticipantsRooms.scss'
import '../Homepage.scss'
import { constWhileSecu } from '../HomePage';
import BanRoomParticipant from './BanRoomParticipant';
import axiosConfig from "../../../Utils/axiosConfig";
import AddAdmin from './AddAdmin';
import CreateInvitationRooms from './CreateInvitationRooms';
import MuteRoomParticipant from './MuteRoomParticipant';

function AffParticipantsBanned(props: { roomsConversData: { name: string, id: number }, setAffParticipantsRooms: Function, setConversRooms: Function, closeConvers: Function, setRooms: Function, oldAffRoomConvers: string, setChat: Function, setAffBanned: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [update, setUpdate] = useState(false);
    const [isAdmin, setAdmin] = useState(false);

    const [banRoomParticipant, setBanRoomParticipant] = useState(false);

    const checkIfAdmin = async () => {
        let ifAdmin = false;
        await axiosConfig.get('https://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        await axiosConfig.get('https://localhost:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifAdmin = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        console.log("return: ", ifAdmin);
        return ifAdmin;
    };

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: boolean) {
        console.log('roomHasBeenDeleted = ', roomHasBeenDeletedReturn);
        if (roomHasBeenDeletedReturn == true) {
            console.log(props.roomsConversData.name, " has been deleted");//NOTIF à ajouter
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

    utilsData.socket.removeAllListeners('newParticipant');

    utilsData.socket.removeAllListeners('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (roomHasBeenDeletedReturn: string) {
        console.log('removeParticipantReturn = ', roomHasBeenDeletedReturn);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    utilsData.socket.removeAllListeners('debanedUserInRoom');

    utilsData.socket.on('debanedUserInRoom', function (debanedUserInRoom: boolean) {
        console.log('debanedUserInRoom = ', debanedUserInRoom);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('debanedUserInRoom');
        utilsData.socket.removeListener('debanedUserInRoom');
    })

    utilsData.socket.removeAllListeners('newRoomBan');

    utilsData.socket.on('newRoomBan', function (newRoomBan: boolean) {
        console.log('newRoomBan = ', newRoomBan);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('newRoomBan');
        utilsData.socket.removeListener('newRoomBan');
    })

    const handleClickBanRoomParticipant = () => {
        if (banRoomParticipant)
            setBanRoomParticipant(false);
        else
            setBanRoomParticipant(true);
    }

    const closeAffBanned = () => {
        props.setAffBanned(false);
    }

    const closeConvers = () => {
        props.setAffParticipantsRooms(false);
        props.setConversRooms(false);
        if (props.oldAffRoomConvers == "chat")
            props.setChat(true);
        else
            props.setRooms(true);
    }

    const debanParticipant = (item: { login: string, id: number, admin: boolean }) => {
        utilsData.socket.emit('removeRoomBan', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name, login_banned: item.login });
    }

    function RightItem(item: { login: string, id: number, admin: boolean }) {
        console.log("Rigthitem isAdmin: ", isAdmin, ", admin: ", item.admin);
        if ((isAdmin || item.admin) && item.login != userData.userReducer.user?.login)
            return (
                <div className="inItemFriendList_right">
                    <button onClick={() => debanParticipant(item)} className="bi bi-x-lg"></button>
                </div>
            );
        else
            return (
                <div className="inItemFriendList_right">
                </div>
            );
    };

    function RightHeader() {
        if (isAdmin)
            return (
                <div className="mainHeaderRight mainHeaderSide">
                    {/* <button onClick={handleClickBanRoomParticipant}><i className="bi bi-person-x-fill"></i></button> */}
                </div>
            );
        else
            return (
                <div className="mainHeaderRight mainHeaderSide">

                </div>
            );
    };

    const getListItem = async () => {
        const admin = await checkIfAdmin();
        console.log("getListItem admin: ", admin);
        let itemList: any[] = [];
        await axiosConfig.get('https://localhost:5001/blackList/getAllRoomBan/' + props.roomsConversData.id + '/' + props.roomsConversData.name).then(async (res) => {
            res.data.forEach((item: { id_banned: number, login_banned: string }) => {
                const profile_pic = `https://cdn.intra.42.fr/users/${item.login_banned}.jpg`;
                itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
                    <div className="inItemFriendList">
                        <div className="inItemFriendList_left">
                            <img src={profile_pic}></img>
                            <p>{item.login_banned}</p>
                        </div>
                        <RightItem login={item.login_banned} id={item.id_banned} admin={admin} />
                    </div>
                </div>)
            })
        });
        setItemListHistory(itemList);
    }

    useEffect(() => {
        if (!update) {
            getListItem();
            setUpdate(true);
        }
    });

    function AffList() {
        if (banRoomParticipant == true)
            return (
                <div id="affSmall">
                    {itemListHistory}
                </div>
            );
        else
            return (
                <div id="affBig">
                    {itemListHistory}
                </div>
            );
    };

    return (
        <div className="mainAffGene">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={closeAffBanned} className="bi bi-arrow-left"></button>
                </div>
                <h3>Banned Users</h3>
                <RightHeader />
            </div>
            {/* {banRoomParticipant && <BanRoomParticipant roomsConversData={props.roomsConversData} />} */}
            <AffList />
        </div>
    );
};

export default AffParticipantsBanned;
