import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/AffParticipantsRooms.css'
import '../Homepage.scss'
import { constWhileSecu } from '../HomePage';
import BanRoomParticipant from './BanRoomParticipant';
import AddAdmin from './AddAdmin';
import CreateInvitationRooms from './CreateInvitationRooms';
import MuteRoomParticipant from './MuteRoomParticipant';
import AffParticipantsBanned from './AffParticipantsBanned';

function AffParticipantsRooms(props: { roomsConversData: { name: string, id: number }, setAffParticipantsRooms: Function, setConversRooms: Function, closeConvers: Function, setRooms: Function, oldAffRoomConvers: string, setChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [isCreateInvitation, setCreateInvitation] = useState(false);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [update, setUpdate] = useState(false);
    const [isAdmin, setAdmin] = useState(false);

    const [banRoomParticipant, setBanRoomParticipant] = useState(false);
    const [muteRoomParticipant, setMuteRoomParticipant] = useState(false);
    const [addAdmin, setAddAdmin] = useState(false);

    const [isAffBanned, setAffBanned] = useState(false);

    const checkIfAdmin = async () => {
        let ifAdmin = false;
        await axios.get('http://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        await axios.get('http://localhost:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
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

    utilsData.socket.on('newParticipant', function (newParticipantReturn: boolean) {
        console.log('newParticipant = ', newParticipantReturn);
        if (newParticipantReturn == true) {
            console.log("New participant in ", props.roomsConversData.name);//NOTIF à ajouter
            const length = itemListHistory.length;
            let secu = 0;
            while (length == itemListHistory.length && secu < constWhileSecu) {
                getListItem();
                secu++;
            }
        }
        utilsData.socket.off('newParticipant');
        utilsData.socket.removeListener('newParticipant');
    })

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

    utilsData.socket.removeAllListeners('demutedUserInRoom');

    utilsData.socket.on('demutedUserInRoom', function (demutedUserInRoom: boolean) {
        console.log('demutedUserInRoom = ', demutedUserInRoom);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('demutedUserInRoom');
        utilsData.socket.removeListener('demutedUserInRoom');
    })

    const addInvitationRequest = () => {
        if (isCreateInvitation)
            setCreateInvitation(false);
        else
            setCreateInvitation(true);
    };

    const handleClickMuteRoomParticipant = () => {
        if (muteRoomParticipant)
            setMuteRoomParticipant(false);
        else
            setMuteRoomParticipant(true);
    }

    const handleClickBanRoomParticipant = () => {
        if (banRoomParticipant)
            setBanRoomParticipant(false);
        else
            setBanRoomParticipant(true);
    }

    const handleClickAddAdmin = () => {
        if (addAdmin)
            setAddAdmin(false);
        else
            setAddAdmin(true);
    }

    const closeAffParticipantsRooms = () => {
        props.setAffParticipantsRooms(false);
        props.setConversRooms(true);
    }

    const closeConvers = () => {
        props.setAffParticipantsRooms(false);
        props.setConversRooms(false);
        if (props.oldAffRoomConvers == "chat")
            props.setChat(true);
        else
            props.setRooms(true);
    }

    const removeParticipant = (item: { login: string, id: number }) => {
        const participantToRemove = {
            login: item.login,
            room_name: props.roomsConversData.name
        }
        utilsData.socket.emit('removeParticipant', participantToRemove);
        setUpdate(false);
    }

    function demute(item: { login: string, id: number, admin: boolean }) {
        utilsData.socket.emit('removeRoomMute', { room_name: props.roomsConversData.name, room_id: props.roomsConversData.id, login_muted: item.login });
    };

    function RightItemMuted(item: { login: string, id: number, admin: boolean }) {
        console.log("RightItemMuted isAdmin: ", isAdmin, ", admin: ", item.admin);
        if ((isAdmin || item.admin) && item.login != userData.userReducer.user?.login)
            return (
                <div className="inItemFriendList_right">
                    <button onClick={() => demute(item)} className="bi bi-mic-fill"></button>
                    <button onClick={() => removeParticipant(item)} className="bi bi-x-lg"></button>
                </div>
            );
        else
            return (
                <div className="inItemFriendList_right">
                </div>
            );
    };

    const affBanned = async () => {
        setAffBanned(true);
    };

    function RightItem(item: { login: string, id: number, admin: boolean }) {
        console.log("Rigthitem isAdmin: ", isAdmin, ", admin: ", item.admin);
        if ((isAdmin || item.admin) && item.login != userData.userReducer.user?.login)
            return (
                <div className="inItemFriendList_right">
                    <button onClick={() => removeParticipant(item)} className="bi bi-x-lg"></button>
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
                    <button onClick={handleClickMuteRoomParticipant}><i className="bi bi-person-x-fill"></i></button>
                    <button onClick={affBanned}><i className="bi bi-person-x-fill"></i></button>
                    <button onClick={handleClickAddAdmin}><i className="bi bi-diagram-2-fill"></i></button>
                    <button onClick={addInvitationRequest} className="bi bi-plus-lg"></button>
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
        let allUserMute: { id_muted: number, name_muted: string }[] = [];
        await axios.get('http://localhost:5001/muteList/getAllRoomMute/' + props.roomsConversData.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log('res.data allUserMute = ', res.data);
            allUserMute = res.data;
            console.log('nameTmp allUserBan = ', allUserMute);
        });//récupère tous les user mute de la room
        await axios.get('http://localhost:5001/participants/allUserForOneRoom/' + props.roomsConversData.name).then(async (res) => {
            let itemList: any[] = []
            console.log('res.data = ', res.data);
            res.data.forEach((item: { login: string, id: number }) => {
                const profile_pic = `https://cdn.intra.42.fr/users/${item.login}.jpg`;
                console.log("test1: ", allUserMute);
                console.log("test: ", allUserMute.find(obj => obj.id_muted == item.id));
                if (allUserMute.find(obj => obj.id_muted == item.id)) {
                    itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
                        <div className="inItemFriendList">
                            <div className="inItemFriendList_left">
                                <img src={profile_pic}></img>
                                <p>{item.login}</p>
                                <p>Muted</p>
                            </div>
                            <RightItemMuted login={item.login} id={item.id} admin={admin} />
                        </div>
                    </div>)
                }
                else {
                    itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
                        <div className="inItemFriendList">
                            <div className="inItemFriendList_left">
                                <img src={profile_pic}></img>
                                <p>{item.login}</p>
                            </div>
                            <RightItem login={item.login} id={item.id} admin={admin} />
                        </div>
                    </div>)
                }
            })
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
        if (!update) {
            getListItem();
            setUpdate(true);
        }
    });

    function AffList() {
        if (isCreateInvitation == true)
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

    function MainAff() {
        if (isAffBanned) {
            return (
                <div className="mainAffGene">
                    <AffParticipantsBanned roomsConversData={props.roomsConversData} setAffParticipantsRooms={props.setAffParticipantsRooms} setConversRooms={props.setConversRooms} closeConvers={props.closeConvers} setRooms={props.setRooms} oldAffRoomConvers={props.oldAffRoomConvers} setChat={props.setChat} setAffBanned={setAffBanned} />
                </div>
            );
        }
        else {
            return (
                <div className="mainAffGene">
                    <div id="header" className="mainHeader">
                        <div className="mainHeaderLeft mainHeaderSide">
                            <button onClick={closeAffParticipantsRooms} className="bi bi-arrow-left"></button>
                        </div>
                        <h3>{props.roomsConversData.name}</h3>
                        <RightHeader />
                    </div>
                    {banRoomParticipant && <BanRoomParticipant roomsConversData={props.roomsConversData} />}
                    {muteRoomParticipant && <MuteRoomParticipant roomsConversData={props.roomsConversData} />}
                    {addAdmin && <AddAdmin roomsConversData={props.roomsConversData} />}
                    {isCreateInvitation && <CreateInvitationRooms roomsConversData={props.roomsConversData} />}
                    <AffList />
                </div>
            );
        }
    };

    return (
        <div className="mainAffGene">
            <MainAff />
        </div>
    );
};

export default AffParticipantsRooms;