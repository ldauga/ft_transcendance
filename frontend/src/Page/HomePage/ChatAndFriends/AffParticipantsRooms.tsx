import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/RoomsConvers.css'
import '../HomePage.css'

function AffParticipantsRooms(props: { roomsConversData: { name: string, id: number }, isAdmin: boolean, setAffParticipantsRooms: Function, setConversRooms: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [update, setUpdate] = useState(false);

    utilsData.socket.removeAllListeners('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (removeParticipantReturn: boolean) {
        console.log('removeParticipantReturn = ', removeParticipantReturn);
        if (removeParticipantReturn == true) {
            const length = itemListHistory.length;
            let secu = 0;
            while (length == itemListHistory.length && secu < 5) {
                setItemListHistory([]);
                getListItem();
                secu++;
            }
        }
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    const closeConvers = () => {
        props.setAffParticipantsRooms(false);
        props.setConversRooms(true);
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
                    <button onClick={closeConvers} className="bi bi-arrow-left"></button>
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