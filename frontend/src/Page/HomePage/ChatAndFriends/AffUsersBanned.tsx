import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/AffParticipantsRooms.scss'
import '../Homepage.scss'
import { constWhileSecu } from '../HomePage';
import BanUser from './BanUser';
import axiosConfig from '../../../Utils/axiosConfig';

function AffUsersBanned(props: { setFriendList: Function, setBannedUsers: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [update, setUpdate] = useState(false);

    const [banUser, setBanUser] = useState(false);

    utilsData.socket.removeAllListeners('userBanned');

    utilsData.socket.on('userBanned', function (userBanned: boolean) {
        console.log('userBanned = ', userBanned);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('userBanned');
        utilsData.socket.removeListener('userBanned');
    })

    utilsData.socket.removeAllListeners('debanedUser');

    utilsData.socket.on('debanedUser', function (debanedUser: boolean) {
        console.log('debanedUser = ', debanedUser);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('debanedUser');
        utilsData.socket.removeListener('debanedUser');
    })

    const handleClickBanRoomParticipant = () => {
        if (banUser)
            setBanUser(false);
        else
            setBanUser(true);
    }

    const closeAffBanned = () => {
        props.setBannedUsers(false);
        props.setFriendList(true);
    }

    const debanUser = (item: { id_banned: number, login_banned: string }) => {
        console.log("button debanUser");
        utilsData.socket.emit('removeUserBan', { id_sender: userData.userReducer.user?.id, login_banned: item.login_banned });
    }

    const getListItem = async () => {
        let itemList: any[] = [];
        await axiosConfig.get('http://10.3.3.5:5001/blackList/getAllUserBan/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.login).then(async (res) => {
            res.data.forEach((item: { id_banned: number, login_banned: string }) => {
                const profile_pic = `https://cdn.intra.42.fr/users/${item.login_banned}.jpg`;
                itemList.push(<div key={itemList.length.toString()} className='itemFriendList'>
                    <div className="inItemFriendList">
                        <div className="inItemFriendList_left">
                            <img src={profile_pic}></img>
                            <p>{item.login_banned}</p>
                        </div>
                        <div className="inItemFriendList_right">
                            <button onClick={() => debanUser(item)} className="bi bi-x-lg"></button>
                        </div>
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
        if (banUser == true)
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
                <div className="mainHeaderRight mainHeaderSide">
                    <button onClick={handleClickBanRoomParticipant}><i className="bi bi-person-x-fill"></i></button>
                </div>
            </div>
            {banUser && <BanUser />}
            <AffList />
        </div>
    );
};

export default AffUsersBanned;