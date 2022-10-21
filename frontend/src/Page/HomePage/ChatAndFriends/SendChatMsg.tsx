import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import './CSS/SendChatMsg.css'

function SendChatMsg() {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');
    const [login, setLogin] = useState('');

    async function sendMsg() {
        let test = false;
        console.log('sendMsg');
        await axios.get('http://localhost:5001/user/login/' + login).then(async (res) => {
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

    return (
        <div id="sendChatMsgContainer">
            <div id="sendChatMsgFirstContainer">
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
            </div>
        </div>
    )
}

export default SendChatMsg;