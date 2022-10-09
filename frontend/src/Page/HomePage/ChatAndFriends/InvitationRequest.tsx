import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import './CSS/InvitationRequest.css';
import './../HomePage.css';

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

    function Item(props: { item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string } }) {
        if (props.item.userOrRoom)//room
        {
            return (
                <div className="inItem">
                    <p>{props.item.sender_login} sent a invitation to join {props.item.room_name}</p>
                    <div>
                        <button onClick={() => acceptRoomInvit(props.item)} className="bi bi-check-lg"></button>
                        <button onClick={() => declineRoomInvit(props.item)} className="bi bi-x-lg"></button>
                    </div>
                </div>
            );
        }
        else //user
        {
            return (
                <div className="inItem">
                    <p>{props.item.sender_login} sent a invitation</p>
                    <div>
                        <button onClick={() => acceptFriendInvit(props.item)} className="bi bi-check-lg"></button>
                        <button onClick={() => declineFriendInvit(props.item)} className="bi bi-x-lg"></button>
                    </div>
                </div>
            );
        }
    }

    const getListItem = async () => {
        await axios.get('http://localhost:5001/invitationRequest/' + userData.userReducer.user?.id).then(async (res) => {
            let itemList: any[] = []
            res.data.forEach((item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
                itemList.push(<div key={itemList.length.toString()} className='itemList'>
                    <Item item={item} />
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

    const acceptRoomInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
        utilsData.socket.emit('removeInvitationRequest', item);
        const newParticipant = {
            user_id: item.id_user2,
            user_login: item.receiver_login,
            room_id: item.room_id,
            room_name: item.room_name
        }
        utilsData.socket.emit('createParticipant', newParticipant);
        setUpdate(true);
    };

    const declineRoomInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
        utilsData.socket.emit('removeInvitationRequest', item);
        setUpdate(true);
    };

    const acceptFriendInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
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

    const declineFriendInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
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