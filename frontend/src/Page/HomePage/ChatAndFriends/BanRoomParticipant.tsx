import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import './CSS/BanRoomParticipant.css';

function BanRoomParticipant(props: { roomsConversData: { name: string, id: number } }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');

    async function buttonBanRoomParticipant() {
        let test = false;
        console.log('addFriend');
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
                await axios.get('http://localhost:5001/blackList/checkRoomBan/' + res.data.id + '/' + res.data.login + '/' + props.roomsConversData.name).then(async (res) => {
                    console.log('check invit');
                    console.log(res.data);
                    console.log(res);
                    if (res.data == true) {
                        console.log("ban already exist");
                    }
                    else {
                        a = 2;
                        console.log('ban not exist');
                    }
                })
                if (a == 2) {
                    console.log('test == true');
                    console.log(receiver_login_tmp);
                    const newBan = {
                        id_sender: userData.userReducer.user?.id,
                        id_banned: res.data.id,
                        login_sender: userData.userReducer.user?.login,
                        login_banned: res.data.login,
                        userOrRoom: true,
                        receiver_login: "",
                        room_id: props.roomsConversData.id,
                        room_name: props.roomsConversData.name,
                        cause: ""
                    }
                    utilsData.socket.emit('createRoomBan', newBan);
                }
                return;
            }
        });
    }

    return (
        <div className="addFriendContainer">
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') buttonBanRoomParticipant() }}
                placeholder="Enter login"
            />
            <button type="button" onClick={() => buttonBanRoomParticipant()}>
                Ban User
            </button>
        </div>
    )
}

export default BanRoomParticipant;