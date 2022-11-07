import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Convers.scss'
import '../Homepage.scss'
import CreateRooms from './CreateRooms';
import { constWhileSecu } from '../HomePage';
import axiosConfig from '../../../Utils/axiosConfig';
import GroupIcon from '@mui/icons-material/Group';

function Rooms(props: { setChat: Function, setFriendList: Function, setRooms: Function, setRoomsConvers: Function, setroomsConversData: Function, setOldAffRoomConvers: Function, setRoomsList: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [isCreateGroup, setCreateGroup] = useState(false);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);
    const [itemListMyRooms, setitemListMyRooms] = useState(Array<{ name: string, id: number }>);

    const affCreateGroup = async () => {
        if (isCreateGroup)
            setCreateGroup(false);
        else
            setCreateGroup(true);
    };

    const affRoomsList = async () => {
        console.log("affRoomsList");
        props.setRooms(false);
        props.setRoomsList(true);
    };

    const exit = () => {
        props.setRooms(false);
        props.setChat(true);
    };

    const openConvers = (item: { name: string, id: number }) => {
        props.setroomsConversData({ name: item.name, id: item.id });
        props.setRooms(false);
        props.setOldAffRoomConvers("Rooms");
        props.setRoomsConvers(true);
    };

    utilsData.socket.removeAllListeners('newRoomCreated');

    utilsData.socket.on('newRoomCreated', function (newRoomCreated: boolean) {
        console.log('newRoomCreated = ', newRoomCreated);
        if (newRoomCreated == true) {
            const length = itemListHistory.length;
            let secu = 0;
            while (length == itemListHistory.length && secu < constWhileSecu) {
                getListItem();
                secu++;
            }
        }
        utilsData.socket.off('newRoomCreated');
        utilsData.socket.removeListener('newRoomCreated');
    })

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        console.log('roomHasBeenDeleted = ', roomHasBeenDeletedReturn);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    utilsData.socket.removeAllListeners('kickedOutOfTheGroup');

    utilsData.socket.on('kickedOutOfTheGroup', function (kickedOutOfTheGroupReturn: boolean) {
        console.log('kickedOutOfTheGroup = ', kickedOutOfTheGroupReturn);
        if (kickedOutOfTheGroupReturn == true) {
            const length = itemListHistory.length;
            let secu = 0;
            while (length == itemListHistory.length && secu < constWhileSecu) {
                getListItem();
                secu++;
            }
        }
        utilsData.socket.off('kickedOutOfTheGroup');
        utilsData.socket.removeListener('kickedOutOfTheGroup');
    })

    const getListItem = async () => {
        await axiosConfig.get('https://localhost:5001/participants/userRooms/' + userData.userReducer.user?.login).then(async (res) => {
            let itemList: any[] = [];
            console.log('res.data = ', res.data);
            const nameTmp: { name: string, id: number }[] = res.data;
            nameTmp.forEach(item => {
                itemList.push(<div key={itemList.length.toString()} className='itemGroupList'>
                    <div className="inGroupItem" onClick={() => openConvers(item)}>
                        <GroupIcon id="groupIconGroupItem" />
                        <p>{item.name}</p>
                    </div>
                </div>)
            })
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
        const oldLength = itemListHistory.length;
        console.log("oldLength: ", oldLength, ", itemListHistory.length: ", itemListHistory.length);
        for (let i = 0; i < constWhileSecu || oldLength < itemListHistory.length; i++) {
            console.log("Rooms useEffect getListItem i: ", i, ", oldLength: ", oldLength, ", itemListHistory.length: ", itemListHistory.length);
            getListItem();
        }
    }, [props]);

    function MainAffRoomsItems() {
        if (isCreateGroup)
            return (
                <div id="mainAffRoomsSmall">
                    {itemListHistory}
                </div>
            );
        else
            return (
                <div id="mainAffRoomsBig">
                    {itemListHistory}
                </div>
            );
    };

    return (
        <div id="roomsAff">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={exit} className="bi bi-arrow-left"></button>
                </div>
                <h3>Groups</h3>
                <div id="roomsHeaderRight" className="mainHeaderRight mainHeaderSide">
                    <button onClick={affRoomsList} className="bi bi-list"></button>
                    <button onClick={affCreateGroup} className="bi bi-plus-lg"></button>
                </div>
            </div>
            {isCreateGroup && <CreateRooms />}
            <MainAffRoomsItems />
        </div>
    );
};

export default Rooms;
