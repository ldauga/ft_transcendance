import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.scss'
import '../Homepage.scss'
import axiosConfig from '../../../Utils/axiosConfig';
import { Autocomplete, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';

function CreateInvitationRooms(props: { roomsConversData: { name: string, id: number }, setCreateInvitation: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar } = useSnackbar();

    const [inputValue, setInputValue] = useState('');

    const [connectedClient, setConnectedClient] = useState<{ id: string, username: string, nickname: string }[]>(new Array());

    utilsData.socket.removeAllListeners('getAllClientConnectedWithoutFriend');

    utilsData.socket.on('getAllClientConnectedWithoutParticipants', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        const tmp: any[] = []
        data.forEach(client => {
            if (client.login != userData.userReducer.user?.login) {
                const a = { id: client.id, username: client.login, nickname: client.nickname };
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
        const _user = connectedClient.find(obj => obj.nickname == inputValue);
        if (_user) {
            await axiosConfig.get('https://localhost:5001/user/login/' + _user.username).then(async (res) => {
                setInputValue("");
                let receiver_login_tmp: string = res.data.login;
                if (res.data == "") {
                    return;
                }
                else {
                    let a = 1;
                    let b = 1;
                    await axiosConfig.get('https://localhost:5001/invitationRequest/checkInvitationRequestForRooms/' + res.data.id + '/' + props.roomsConversData.name).then(async (res) => {
                        if (res.data == true) {
                        }
                        else {
                            a = 2;
                        }
                    })
                    await axiosConfig.get('https://localhost:5001/participants/check/' + receiver_login_tmp + '/' + props.roomsConversData.name).then(async (res) => {
                        if (res.data == true) {
                        }
                        else {
                            b = 2;
                        }
                    })
                    if (a == 2 && b == 2) {
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
                        enqueueSnackbar('Invitation sent', { variant: "success", autoHideDuration: 2000 })
                    }
                    props.setCreateInvitation(false);
                    return;
                }
            });
        }
    };

    return (
        <div className="addFriendContainer">
            <Autocomplete
                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS') }}
                options={connectedClient.map((option) => option.nickname)}
                renderInput={(params) => <TextField {...params} label="Invite" />}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
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
