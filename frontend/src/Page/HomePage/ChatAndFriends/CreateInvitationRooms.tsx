import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.css'
import '../Homepage.scss'

function CreateInvitationRooms(props: { roomsConversData: { name: string, id: number } }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');

    const createInvitation = async () => {
        console.log('create Invitation Room');
        await axios.get('http://localhost:5001/user/login/' + text).then(async (res) => {
            setText("");
            console.log("axios.get");
            console.log(res.data);
            console.log(res);
            let receiver_login_tmp: string = res.data.login;
            if (res.data == "") {
                console.log("login not found");
                return;
            }
            else {
                let a = 1;
                let b = 1;
                await axios.get('http://localhost:5001/invitationRequest/checkInvitationRequestForRooms/' + res.data.id + '/' + props.roomsConversData.name).then(async (res) => {
                    console.log('check Invitation Room:', res.data);
                    if (res.data == true) {
                        console.log("invitation Room already exist");
                    }
                    else {
                        a = 2;
                        console.log('invitation Room not exist');
                    }
                })
                await axios.get('http://localhost:5001/participants/check/' + receiver_login_tmp + '/' + props.roomsConversData.name).then(async (res) => {
                    console.log('check participants:', res.data);
                    if (res.data == true) {
                        console.log("participant already exist");
                    }
                    else {
                        b = 2;
                        console.log('participant not exist');
                    }
                })
                if (a == 2 && b == 2) {
                    console.log('test == true');
                    console.log(receiver_login_tmp);
                    const newInvitationRequest = {
                        id_user1: userData.userReducer.user?.id,
                        id_user2: res.data.id,
                        user1_accept: true,
                        user2_accept: false,
                        sender_id: userData.userReducer.user?.id,
                        sender_login: userData.userReducer.user?.login,
                        receiver_login: receiver_login_tmp,
                        userOrRoom: true,
                        room_id: props.roomsConversData.id,
                        room_name: props.roomsConversData.name
                    }
                    utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
                }
                return;
            }
        });
    };

    return (
        <div className="addFriendContainer">
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createInvitation() }}
                placeholder="Enter name"
            />
            <button type="button" onClick={() => createInvitation()}>
                Send invitation
            </button>
        </div>
    );
};

export default CreateInvitationRooms;