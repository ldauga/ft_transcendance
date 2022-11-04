import { Autocomplete, Box, Button, TextField } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import axiosConfig from "../../../Utils/axiosConfig";
import './CSS/SendChatMsg.scss'
import './CSS/Convers.scss'
import { SnackbarKey, withSnackbar } from 'notistack';
import { useSnackbar } from 'notistack';

function SendChatMsg() {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [text, setText] = useState('');

    const [messageText, setMessageText] = useState('');

    const [connectedClient, setConnectedClient] = useState<{ id: string, username: string }[]>(new Array());

    const [inputValue, setInputValue] = useState('');

    utilsData.socket.removeAllListeners('getAllClientConnectedWithoutFriend');

    utilsData.socket.on('getAllClientConnected', function (data: { id: number, login: string, nickname: string, profile_pic: string }[]) {
        console.log('getAllClientConnected = ', data);
        const tmp: any[] = []
        data.forEach(client => {
            if (client.login != userData.userReducer.user?.login) {
                const a = { id: client.id, username: client.login };
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
        if (inputValue.length > 40) {
            enqueueSnackbar('Message max size is 40 characters', { variant: "error", autoHideDuration: 3000 })
            return;
        }
        await axiosConfig.get('https://localhost:5001/blackList/checkIfRelationIsBlocked/' + userData.userReducer.user?.login + '/' + inputValue).then(async (res) => {
            console.log("checkIfRelationIsBlocked res.data: ", res.data);
            if (res.data == true) {
                enqueueSnackbar('You can\'t send a message to ' + inputValue + ', your relation is blocked', { variant: "error", autoHideDuration: 6000 })
                return;
            }
        });
        let test = false;
        console.log('sendMsg');
        await axiosConfig.get('https://localhost:5001/user/login/' + inputValue).then(async (res) => {
            setText("");
            console.log("axios.get");
            console.log(res.data);
            console.log(res);
            let receiver_login_tmp: string = res.data.login;
            if (res.data == "") {
                enqueueSnackbar(inputValue + ' not found', { variant: "error", autoHideDuration: 2000 })
                console.log("login not found");
                return;
            }
            else {
                console.log('test == true');
                console.log(receiver_login_tmp);
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

                return;
            }
        });
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
        <div id="sendChatMsgContainer">
            <Autocomplete
                onFocus={() => { utilsData.socket.emit('GET_ALL_CLIENT_CONNECTED') }}
                options={connectedClient.map((option) => option.username)}
                renderInput={(params) => <TextField {...params} label="Select a user" />}
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
            <div className="sendZoneSendChatMsg">
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMsg() }}
                    placeholder="Your message..."
                />
                <SendButton />
            </div>
            {/* <div id="sendChatMsgFirstContainer">
                <input
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="Enter login"
                />
            </div>
            <div id="sendChatMsgSecondContainer">
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMsg() }}
                    placeholder="Enter message"
                />
                <button type="button" onClick={() => sendMsg()}>
                    Add Friend
                </button>
            </div> */}
        </div>
    )
}

export default SendChatMsg;
