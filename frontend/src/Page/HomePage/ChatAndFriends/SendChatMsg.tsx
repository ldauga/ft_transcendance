import { Autocomplete, Button, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import axiosConfig from "../../../Utils/axiosConfig";
import './CSS/SendChatMsg.scss'
import './CSS/Convers.scss'
import { useSnackbar } from 'notistack';

function SendChatMsg(props: {setSendChatMsg: Function}) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [text, setText] = useState('');

    const [connectedClient, setConnectedClient] = useState<{ id: string, login: string, nickname: string }[]>(new Array());

    const [inputValue, setInputValue] = useState('');

    utilsData.socket.removeAllListeners('getAllClientConnectedWithoutFriend');

    utilsData.socket.on('getAllClientConnected', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        const tmp: any[] = []
        data.forEach(client => {
            if (client.login != userData.userReducer.user?.login) {
                const a = { id: client.id, login: client.login, nickname: client.nickname };
                tmp.push(a);
            }
        })
        setConnectedClient(tmp);
        utilsData.socket.off('getAllClientConnected');
        utilsData.socket.removeListener('getAllClientConnected');
    })

    useEffect(() => {
        utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED');
    }, []);

    async function sendMsg() {
        if (text.length <= 0 || inputValue.length <= 0)
            return;
        if (text.length > 40) {
            enqueueSnackbar('Message max size is 40 characters', { variant: "error", autoHideDuration: 3000 })
            return;
        }
        const _user = connectedClient.find(obj => obj.nickname == inputValue);
        if (_user) {
            await axiosConfig.get('https://localhost:5001/blackList/checkIfRelationIsBlocked/' + userData.userReducer.user?.login + '/' + _user.login).then(async (res) => {
                if (res.data == true) {
                    enqueueSnackbar('You can\'t send a message to ' + _user.nickname + ', your relation is blocked', { variant: "error", autoHideDuration: 6000 })
                    return;
                }
            });
            let test = false;
            await axiosConfig.get('https://localhost:5001/user/nickname/' + _user.nickname).then(async (res) => {
                setText("");
                let receiver_login_tmp: string = res.data.login;
                if (res.data == "") {
                    enqueueSnackbar(_user.nickname + ' not found', { variant: "error", autoHideDuration: 2000 })
                    return;
                }
                else {
                    const newMsg = {
                        id_sender: userData.userReducer.user?.id,
                        id_receiver: res.data.id,
                        login_sender: userData.userReducer.user?.login,
                        login_receiver: res.data.login,
                        userOrRoom: false,
                        room_id: 0,
                        room_name: "",
                        text: text
                    }
                    utilsData.socket.emit('createMsg', newMsg);
					props.setSendChatMsg(false);
                    return;
                }
            });
        }
    }

    function SendButton() {
        if (text.length <= 0 || inputValue.length <= 0) {
            return (
                <Button className="sendButtonDisabled" variant="contained" onClick={sendMsg} disabled={text.length <= 0 || inputValue.length <= 0}>
                    <SendIcon id="sendIcon" />
                </Button>
            );
        }
        else {
            return (
                <Button variant="contained" onClick={sendMsg} disabled={text.length <= 0 || inputValue.length <= 0}>
                    <SendIcon id="sendIcon" />
                </Button>
            );
        }
    };

    return (
        <div className="new-message">
            <Autocomplete
                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED') }}
                options={connectedClient.map((option) => option.nickname)}
                renderInput={(params) => <TextField {...params} label="Select a user" />}
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
            <div className="sendZoneSendChatMsg">
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMsg() }}
                    placeholder="Your message..."
                />
                <SendButton />
            </div>
        </div>
    )
}

export default SendChatMsg;
