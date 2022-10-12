import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.css'
import '../HomePage.css'
import CreateRooms from './CreateRooms';
import { constWhileSecu } from '../HomePage';

function Rooms(props: { setFriendList: Function, setRooms: Function, setRoomsConvers: Function, setroomsConversData: Function, setOldAffRoomConvers: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [isCreateGroup, setCreateGroup] = useState(false);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);

    const affCreateGroup = async () => {
        if (isCreateGroup)
            setCreateGroup(false);
        else
            setCreateGroup(true);
    };

    const exit = () => {
        props.setRooms(false);
        props.setFriendList(true);
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
                setItemListHistory([]);
                getListItem();
                secu++;
            }
        }
        utilsData.socket.off('newRoomCreated');
        utilsData.socket.removeListener('newRoomCreated');
    })

    const getListItem = async () => {
        await axios.get('http://localhost:5001/participants/userRooms/' + userData.userReducer.user?.login).then(async (res) => {
            let itemList: any[] = [];
            console.log('res.data = ', res.data);
            const nameTmp: { name: string, id: number }[] = res.data;
            nameTmp.forEach(item => {
                itemList.push(<div key={itemList.length.toString()} className='itemList'>
                    <div className="inItem" onClick={() => openConvers(item)}>
                        <p>{item.name}</p>
                    </div>
                </div>)
            })
            setItemListHistory(itemList);
        })
    }

    useEffect(() => {
        if (!update) {
            getListItem();
        }
        setUpdate(true);
    }, [props]);

    return (
        <div id="roomsAff">
            <div id="header" className="mainHeader">
                <div className="mainHeaderLeft mainHeaderSide">
                    <button onClick={exit} className="bi bi-arrow-left"></button>
                </div>
                <h3>Groups</h3>
                <div id="roomsHeaderRight" className="mainHeaderRight mainHeaderSide">
                    <button onClick={affCreateGroup} className="bi bi-plus-lg"></button>
                </div>
            </div>
            {isCreateGroup && <CreateRooms />}
            <div id="mainAffRooms">
                {itemListHistory}
            </div>
        </div>
    );
};

export default Rooms;