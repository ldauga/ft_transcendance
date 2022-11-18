import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import axiosConfig from "../../../Utils/axiosConfig";
import './CSS/AddFriend.scss';
import { useSnackbar } from 'notistack';

function AddFriend(props: { setNewAddFriend: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar } = useSnackbar();

    const [inputValue, setInputValue] = useState('');

    const [connectedClient, setConnectedClient] = useState<{ id: string, username: string, nickname: string }[]>(new Array());

    async function buttonAddFriend() {
        let test = false;
        const userToSend = connectedClient.find(obj => obj.nickname == inputValue);
        if (userToSend) {
            await axiosConfig.get('https://localhost:5001/user/login/' + userToSend?.username).then(async (res) => {
                setInputValue("");
                let receiver_login_tmp: string = res.data.login;
                if (res.data == "") {
                    return;
                }
                else {
                    let a = 1;
                    let b = 1;
                    let c = 1;
                    await axiosConfig.get('https://localhost:5001/invitationRequest/' + userData.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
                        if (res.data == true) {
                        }
                        else {
                            a = 2;
                        }
                    })
                    await axiosConfig.get('https://localhost:5001/friendList/' + userData.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
                        if (res.data == true) {
                        }
                        else {
                            b = 2;
                        }
                    })
                    await axiosConfig.get('https://localhost:5001/blackList/checkUserBan/' + userData.userReducer.user?.login + '/' + receiver_login_tmp).then(async (res) => {
                        if (res.data == true) {
                            enqueueSnackbar('Your relation is blocked', { variant: "warning", autoHideDuration: 2000 })
                        }
                        else {
                            c = 2;
                        }
                    })
                    if (a == 2 && b == 2 && c == 2) {
                        const newInvitationRequest = {
                            id_user1: userData.userReducer.user?.id,
                            id_user2: res.data.id,
                            user1_accept: true,
                            user2_accept: false,
                            sender_id: userData.userReducer.user?.id,
                            sender_login: userData.userReducer.user?.login,
                            receiver_login: receiver_login_tmp,
                            userOrRoom: false,
                            room_id: 0,
                            room_name: ""
                        }
                        utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
                        enqueueSnackbar('Invitation sent', { variant: "success", autoHideDuration: 2000 })
                    }
                    props.setNewAddFriend(false);
                    return;
                }
            });
        }
    }

    utilsData.socket.removeAllListeners('getAllClientConnectedWithoutFriend');

    utilsData.socket.on('getAllClientConnectedWithoutFriend', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        const tmp: any[] = []
        data.forEach(client => {
            if (client.login != userData.userReducer.user?.login) {
                const a = { id: client.id, username: client.login, nickname: client.nickname };
                tmp.push(a);
            }
        })
        setConnectedClient(tmp);
        utilsData.socket.off('getAllClientConnectedWithoutFriend');
        utilsData.socket.removeListener('getAllClientConnectedWithoutFriend');
    })

    useEffect(() => {
        utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS');
    }, []);

    return (
        <div className="addFriendContainer">
            <Autocomplete
                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS') }}
                options={connectedClient.map((option) => option.nickname)}
                renderInput={(params) => <TextField {...params} label="Invite friend" />}
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
            <button id="addFriendButton" type="button" onClick={() => buttonAddFriend()}>
                Send
            </button>
        </div>
    )
}

export default AddFriend;
