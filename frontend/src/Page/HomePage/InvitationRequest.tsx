import axios from "axios";
import React, { useEffect, useState } from "react";
import FriendList from "./FriendList";
import { InvitationRequestHook, FriendListHook } from "./Hooks";
import { useSelector } from "react-redux";
import { RootState } from "../../State";
import './InvitationRequest.css';
import './HomePage.css';

function InvitationRequest(props: { setFriendList: Function, setInvitationRequest: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReduceur);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);

    utilsData.socket.removeListener('returnRemoveInvitationRequest');
    utilsData.socket.removeListener('newInvitationReceived');

    const handleClick = () => {
        utilsData.socket.off('returnRemoveInvitationRequest');
        utilsData.socket.removeListener('returnRemoveInvitationRequest');
        utilsData.socket.off('newInvitationReceived');
        utilsData.socket.removeListener('newInvitationReceived');
        setItemListHistory([]);
        props.setFriendList(true);
        props.setInvitationRequest(false);
    };

    const getListItem = async () => {
        await axios.get('http://localhost:5001/invitationRequest/' + userData.userReducer.user?.id).then(async (res) => {
            let itemList: any[] = []
            res.data.forEach((item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string }) => {
                itemList.push(<div key={itemList.length.toString()} className='itemList'>
                    <div className="inItem">
                        <p>{item.sender_login} sent a invitation</p>
                        <div>
                            <button onClick={() => acceptInvit(item)} className="bi bi-check-lg"></button>
                            <button onClick={() => declineInvit(item)} className="bi bi-x-lg"></button>
                        </div>
                    </div>
                </div>)
            })
            setItemListHistory(itemList);
        })
    }

    utilsData.socket.on('returnRemoveInvitationRequest', function (returnRemoveInvitation: boolean) {
        console.log('returnRemoveInvitationRequest = ', returnRemoveInvitation);
        if (returnRemoveInvitation == true) {
            const length = itemListHistory.length;
            let secu = 0;
            while (length == itemListHistory.length && secu < 5) {
                setItemListHistory([]);
                getListItem();
                secu++;
            }
        }
        utilsData.socket.off('returnRemoveInvitationRequest');
        utilsData.socket.removeListener('returnRemoveInvitationRequest');
    })

    utilsData.socket.on('newInvitationReceived', function (data: any) {
        console.log('newInvitationReceived = ', data);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < 5) {
            setItemListHistory([]);
            getListItem();
            secu++;
        }
        utilsData.socket.off('newInvitationReceived');
        utilsData.socket.removeListener('newInvitationReceived');
    })

    const acceptInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string }) => {
        utilsData.socket.emit('removeInvitationRequest', item);
        const newFriend = {
            id_user1: item.id_user1,
            id_user2: item.id_user2,
            login_user1: item.sender_login,
            login_user2: item.receiver_login
        }
        utilsData.socket.emit('addFriend', newFriend);
        setUpdate(true);
    };

    const declineInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string }) => {
        utilsData.socket.emit('removeInvitationRequest', item);
        setUpdate(true);
    };

    useEffect(() => {
        if (!update) {
            getListItem();
        }
        setUpdate(true);
    });

    return (
        <div>
            <div>
                <div className="friends-info-typo">
                    <h3>Invitations</h3>
                    <div className="button">
                        <button onClick={handleClick} className="bi bi-x-lg"></button>
                    </div>
                </div>
                {itemListHistory}
            </div>
        </div>
    )
}

export default InvitationRequest;