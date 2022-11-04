import { Autocomplete, TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import axiosConfig from "../../../Utils/axiosConfig";
import './CSS/AddFriend.scss';
import { SnackbarKey, withSnackbar } from 'notistack';
import { useSnackbar } from 'notistack';

function AddFriend(props: { setNewAddFriend: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [inputValue, setInputValue] = useState('');

    const [connectedClient, setConnectedClient] = useState<{ id: string, username: string, nickname: string }[]>(new Array());

    async function buttonAddFriend() {
        let test = false;
        console.log('addFriend');
        const userToSend = connectedClient.find(obj => obj.nickname == inputValue);
        console.log("buttonAddFriend login: ", userToSend?.username);
        await axiosConfig.get('https://localhost:5001/user/login/' + userToSend?.username).then(async (res) => {
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
                await axiosConfig.get('https://localhost:5001/invitationRequest/' + userData.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
                    console.log('check invit');
                    console.log(res.data);
                    console.log(res);
                    if (res.data == true) {
                        console.log("invitationRequest already exist");
                    }
                    else {
                        a = 2;
                        console.log('invitationRequest not exist');
                    }
                })
                await axiosConfig.get('https://localhost:5001/friendList/' + userData.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
                    console.log('check friendList');
                    console.log(res.data);
                    console.log(res);
                    if (res.data == true) {
                        console.log("relation already exist");
                    }
                    else {
                        b = 2;
                        console.log('relation not exist');
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
                        userOrRoom: false,
                        room_id: 0,
                        room_name: ""
                    }
                    console.log('emit');
                    utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
                    enqueueSnackbar('Invitation sent', { variant: "success", autoHideDuration: 2000 })
                }
                props.setNewAddFriend(false);
                return;
            }
        });
    }

    utilsData.socket.removeAllListeners('getAllClientConnectedWithoutFriend');

    utilsData.socket.on('getAllClientConnectedWithoutFriend', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        console.log('getAllClientConnectedWithoutFriend = ', data);
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

    // const [value, setValue] = React.useState<string | null>;

    return (
        <div className="addFriendContainer">
            <Autocomplete
                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS') }}
                options={connectedClient.map((option) => option.nickname)}
                renderInput={(params) => <TextField {...params} label="Invite friend" />}
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
            <button id="addFriendButton" type="button" onClick={() => buttonAddFriend()}>
                Send
            </button>
        </div>
    )
}

export default AddFriend;
