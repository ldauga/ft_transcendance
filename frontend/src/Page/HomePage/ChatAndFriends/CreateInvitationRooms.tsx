import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.scss'
import '../Homepage.scss'
import axiosConfig from '../../../Utils/axiosConfig';
import { Autocomplete, TextField } from '@mui/material';

function CreateInvitationRooms(props: { roomsConversData: { name: string, id: number }, setCreateInvitation: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [inputValue, setInputValue] = useState('');

    const [connectedClient, setConnectedClient] = useState<{ id: string, username: string }[]>(new Array());

    utilsData.socket.removeAllListeners('getAllClientConnectedWithoutFriend');

    utilsData.socket.on('getAllClientConnectedWithoutParticipants', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        console.log('getAllClientConnectedWithoutParticipants = ', data);
        const tmp: any[] = []
        data.forEach(client => {
            if (client.login != userData.userReducer.user?.login) {
                const a = { id: client.id, username: client.login };
                tmp.push(a);
            }
        })
        setConnectedClient(tmp);
        utilsData.socket.off('getAllClientConnectedWithoutParticipants');
        utilsData.socket.removeListener('getAllClientConnectedWithoutParticipants');
    })

    useEffect(() => {
        const data = { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name };
        utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS', data);
    }, []);

    const createInvitation = async () => {
        console.log('create Invitation Room');
        await axiosConfig.get('https://localhost:5001/user/login/' + inputValue).then(async (res) => {
            setInputValue("");
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
                await axiosConfig.get('https://localhost:5001/invitationRequest/checkInvitationRequestForRooms/' + res.data.id + '/' + props.roomsConversData.name).then(async (res) => {
                    console.log('check Invitation Room:', res.data);
                    if (res.data == true) {
                        console.log("invitation Room already exist");
                    }
                    else {
                        a = 2;
                        console.log('invitation Room not exist');
                    }
                })
                await axiosConfig.get('https://localhost:5001/participants/check/' + receiver_login_tmp + '/' + props.roomsConversData.name).then(async (res) => {
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
                props.setCreateInvitation(false);
                return;
            }
        });
    };

    return (
        <div className="addFriendContainer">
            <Autocomplete
                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS') }}
                options={connectedClient.map((option) => option.username)}
                renderInput={(params) => <TextField {...params} label="Invite" />}
                // onChange={(event: any, newValue: string | null) => {
                //   setValue(newValue);
                // }}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}

                // value={value}
                onChange={(event: any, newValue: string | null) => {
                    setInputValue(newValue || "");
                }}
                className="AutocompleteInput"
                sx={{ width: 300 }}
            />
            <button id="addFriendButton" type="button" onClick={() => createInvitation()}>
                Send
            </button>
        </div>
    );
};

export default CreateInvitationRooms;
