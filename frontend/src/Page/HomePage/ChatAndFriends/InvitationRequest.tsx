import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../../State";
import './CSS/ChatAndFriends.scss';
import './../Homepage.scss';
import './CSS/InvitationRequest.scss'
import axiosConfig from "../../../Utils/axiosConfig";
import { SnackbarKey, withSnackbar } from 'notistack';
import { useSnackbar } from 'notistack';
import { ArrowBackIosNew, Check, Close } from "@mui/icons-material";
import { NotifType } from "../../../State/type";
import { bindActionCreators } from "redux";

function InvitationRequest(props: { setFriendList: Function, setInvitationRequest: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar } = useSnackbar();

    const dispatch = useDispatch();
	const { delNotif } = bindActionCreators(actionCreators, dispatch);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);

    const handleClick = () => {
        setItemListHistory([]);
        props.setFriendList(true);
        props.setInvitationRequest(false);
    };

    function Item(props: { item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string, admin: boolean } }) {
        if (props.item.userOrRoom)//room
        {
            return (
                <div className="inItem">
                    <p>{props.item.sender_login} sent a invitation to join {props.item.room_name}</p>
                    <div>
                        <button onClick={() => acceptRoomInvit(props.item)}><Check /></button>
                        <button onClick={() => declineRoomInvit(props.item)}><Close /></button>
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
                        <button onClick={() => acceptFriendInvit(props.item)}><Check /></button>
                        <button onClick={() => declineFriendInvit(props.item)}><Close /></button>
                    </div>
                </div>
            );
        }
    }

    const getListItem = async () => {
        await axiosConfig.get('https://localhost:5001/invitationRequest/' + persistantReducer.userReducer.user?.id).then(async (res) => {
            let itemList: any[] = []
            res.data.forEach((item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string, admin: boolean }) => {
                itemList.push(<div key={itemList.length.toString()} className='itemList'>
                    <Item item={item} />
                </div>)
            })
            setItemListHistory(itemList);
        })
    }

    utilsData.socket.removeListener('returnRemoveInvitationRequest');

    utilsData.socket.on('returnRemoveInvitationRequest', function (returnRemoveInvitation: boolean) {
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

    utilsData.socket.removeListener('newInvitationReceived');

    utilsData.socket.on('newInvitationReceived', function (data: any) {
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

    const acceptRoomInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string, admin: boolean }) => {
        utilsData.socket.emit('removeInvitationRequest', item);
        const newParticipant = {
            user_id: item.id_user2,
            user_login: item.receiver_login,
            room_id: item.room_id,
            room_name: item.room_name,
            admin: item.admin
        }
        utilsData.socket.emit('createParticipant', newParticipant);
        enqueueSnackbar('You have accepted a room request', { variant: "success", autoHideDuration: 2000 })
        setUpdate(true);
    };

    const declineRoomInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
        utilsData.socket.emit('removeInvitationRequest', item);
        enqueueSnackbar('Invitation declined', { variant: "info", autoHideDuration: 2000 })
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

        if (!itemListHistory.length)
            if (persistantReducer.notifReducer.notifArray.find(notif => notif.type == NotifType.PENDINGINVITATION) != undefined)
                delNotif(persistantReducer.notifReducer.notifArray.find(notif => notif.type == NotifType.PENDINGINVITATION)!)

        utilsData.socket.emit('addFriend', newFriend);
        enqueueSnackbar('You have accepted a friend request', { variant: "success", autoHideDuration: 2000 })
        setUpdate(true);
    };

    const declineFriendInvit = (item: { id_user1: number, id_user2: number, user1_accept: boolean, user2_accept: boolean, sender_login: string, receiver_login: string, userOrRoom: boolean, room_id: number, room_name: string }) => {
        utilsData.socket.emit('removeInvitationRequest', item);
        enqueueSnackbar('Invitation declined', { variant: "info", autoHideDuration: 2000 })
        setUpdate(true);
    };

    useEffect(() => {
        if (!update) {
            getListItem();
        }
        setUpdate(true);
    });

    function ItemsInvitationsRequests() {
        return (
            <div className="ListItemsInvitationsRequests">
                {itemListHistory}
            </div>
        );
    };

    return (
        <div className="mainAffGene mainInvitationRequest">
            <div className="mainHeader header-invitation-request">
                <div className="cross">
                    <button onClick={handleClick}><ArrowBackIosNew /></button>
                </div>
                <h3>Invitation Request</h3>
                <div className="icons">

                </div>
            </div>
            {<ItemsInvitationsRequests />}
        </div>
    )
}

export default InvitationRequest;
