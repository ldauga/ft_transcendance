import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/BanRoomParticipant.scss'
import '../Homepage.scss'
import axiosConfig from "../../../Utils/axiosConfig";
import { useSnackbar } from 'notistack';
import { ArrowBackIosNew } from '@mui/icons-material';

function AffParticipantsBanned(props: { roomsConversData: { name: string, id: number }, setAffParticipantsRooms: Function, setConversRooms: Function, closeConvers: Function, setRooms: Function, oldAffRoomConvers: string, setChat: Function, setAffBanned: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>());

    const { enqueueSnackbar } = useSnackbar();

    const [update, setUpdate] = useState(false);
    const [isAdmin, setAdmin] = useState(false);

    const [banRoomParticipant, setBanRoomParticipant] = useState(false);

    const checkIfAdmin = async () => {
        let ifAdmin = false;
        await axiosConfig.get('https://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        await axiosConfig.get('https://localhost:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        return ifAdmin;
    };

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        if (roomHasBeenDeletedReturn == props.roomsConversData.name) {
            closeConvers();
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    utilsData.socket.removeAllListeners('kickedOutOfTheGroup');

    utilsData.socket.on('kickedOutOfTheGroup', function (kickedOutOfTheGroupReturn: boolean) {
        if (kickedOutOfTheGroupReturn == true) {
            closeConvers();
        }
        utilsData.socket.off('kickedOutOfTheGroup');
        utilsData.socket.removeListener('kickedOutOfTheGroup');
    })

    utilsData.socket.removeAllListeners('newParticipant');

    utilsData.socket.removeAllListeners('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (roomHasBeenDeletedReturn: string) {
        utilsData.socket.emit('GET_ALL_PARTICIPANTS_BANNED', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    utilsData.socket.removeAllListeners('debanedUserInRoom');

    utilsData.socket.on('debanedUserInRoom', function (debanedUserInRoom: boolean) {
        utilsData.socket.emit('GET_ALL_PARTICIPANTS_BANNED', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('debanedUserInRoom');
        utilsData.socket.removeListener('debanedUserInRoom');
    })

    utilsData.socket.removeAllListeners('newRoomBan');

    utilsData.socket.on('newRoomBan', function (newRoomBan: boolean) {
        utilsData.socket.emit('GET_ALL_PARTICIPANTS_BANNED', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('newRoomBan');
        utilsData.socket.removeListener('newRoomBan');
    })

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
        utilsData.socket.emit('removeRoomBan', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name, id_banned: item.id, login_banned: item.login });
        enqueueSnackbar('Participant debaned', { variant: "success", autoHideDuration: 2000 })
        props.setAffBanned(false);
    }

    function RightItem(item: { login: string, id: number, admin: boolean }) {
        if ((isAdmin || item.admin) && item.login != userData.userReducer.user?.login)
            return (
                <div className="inItemFriendList_right">
                    <button onClick={(e) => { e.stopPropagation(); debanParticipant(item) }} className="bi bi-x-lg"></button>
                </div>
            );
        else
            return (
                <div className="inItemFriendList_right">
                </div>
            );
    };

    utilsData.socket.removeAllListeners('getAllParticipantsBannedReturn');

    utilsData.socket.on('getAllParticipantsBannedReturn', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        getListItem(data);
        utilsData.socket.off('getAllParticipantsBannedReturn');
        utilsData.socket.removeListener('getAllParticipantsBannedReturn');
    })

    const getListItem = async (data: { id: number, login: string, nickname: string, profile_pic: string }[]) => {
        const admin = await checkIfAdmin();
        let itemList: any[] = []
        let i = 0;
        data.forEach((item: { id: number, login: string, nickname: string, profile_pic: string }) => {
            itemList.push(<div key={itemList.length.toString()} className='participant_ban' onClick={(e) => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + item.login) }}>
                <img src={item.profile_pic}></img>
                <p>{item.nickname}</p>
                <RightItem login={item.login} id={item.id} admin={admin} />
            </div>
            )
        })
        setItemListHistory(itemList);
    }

    useEffect(() => {
		if (!update) {
			utilsData.socket.emit('GET_ALL_PARTICIPANTS_BANNED', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
			setUpdate(true);
		}
    }, [itemListHistory]);

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
            <div className="mainHeader">
                <div className="cross">
                    <button onClick={closeAffBanned}><ArrowBackIosNew /></button>
                </div>
                <h3>Banned Users</h3>
                <div className="icons">
                </div>
            </div>
            <AffList />
        </div>
    );
};

export default AffParticipantsBanned;
