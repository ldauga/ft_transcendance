import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/RoomsConvers.css'
import '../HomePage.css'
import { constWhileSecu } from '../HomePage';

function AffParticipantsRooms(props: { roomsConversData: { name: string, id: number }, isAdmin: boolean, setAffParticipantsRooms: Function, setConversRooms: Function, closeConvers: Function, setRooms: Function, oldAffRoomConvers: string, setChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [update, setUpdate] = useState(false);

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

    function RightItem(item: { login: string, id: number }) {
        if (props.isAdmin && item.login != userData.userReducer.user?.login)
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

    const getListItem = async () => {
        await axios.get('http://localhost:5001/participants/allUserForOneRoom/' + props.roomsConversData.name).then(async (res) => {
            let itemList: any[] = []
            console.log('res.data = ', res.data);
            res.data.forEach((item: { login: string, id: number }) => {
                const profile_pic = `https://cdn.intra.42.fr/users/${item.login}.jpg`;
                itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
                    <div className="inItemFriendList">
                        <div className="inItemFriendList_left">
                            <img src={profile_pic}></img>
                            <p>{item.login}</p>
                        </div>
                        <RightItem login={item.login} id={item.id} />
                    </div>
                </div>)
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

    return (
        <div className="mainAffGene">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={closeAffParticipantsRooms} className="bi bi-arrow-left"></button>
                </div>
                <h3>{props.roomsConversData.name}</h3>
                <div className="mainHeaderRight mainHeaderSide">

                </div>
            </div>
            {itemListHistory}
        </div>
    );
};

export default AffParticipantsRooms;