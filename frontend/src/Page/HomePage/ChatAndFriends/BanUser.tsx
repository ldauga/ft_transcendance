import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import axiosConfig from "../../../Utils/axiosConfig";
import './CSS/BanUser.css';

function BanUser() {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');

    async function buttonBanUser() {
        let test = false;
        console.log('addFriend');
        await axiosConfig.get('http://localhost:5001/user/login/' + text).then(async (res) => {
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
                await axiosConfig.get('http://localhost:5001/blackList/checkUserBan/' + res.data.login + '/' + userData.userReducer.user?.login).then(async (res) => {
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
                        userOrRoom: false,
                        receiver_login: "",
                        room_id: 0,
                        room_name: "",
                        cause: ""
                    }
                    utilsData.socket.emit('createBan', newBan);
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
                onKeyDown={(e) => { if (e.key === 'Enter') buttonBanUser() }}
                placeholder="Enter login"
            />
            <button type="button" onClick={() => buttonBanUser()}>
                Ban User
            </button>
        </div>
    )
}

export default BanUser;