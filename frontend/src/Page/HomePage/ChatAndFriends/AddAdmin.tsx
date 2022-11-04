import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import axiosConfig from "../../../Utils/axiosConfig";
import './CSS/BanUser.css';

function AddAdmin(props: { roomsConversData: { name: string, id: number } }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');

    async function buttonAddAdmin() {
        let test = false;
        console.log('addFriend');
        await axiosConfig.get('https://localhost:5001/user/login/' + text).then(async (res) => {
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
                const newAdmin = {
                    id_sender: userData.userReducer.user?.id,
                    id_admin: res.data.id,
                    login_sender: userData.userReducer.user?.login,
                    login_admin: res.data.login,
                    room_id: props.roomsConversData.id,
                    room_name: props.roomsConversData.name
                }
                utilsData.socket.emit('createAdmin', newAdmin);
            }
            return;
        });
    }

    return (
        <div className="addFriendContainer">
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') buttonAddAdmin() }}
                placeholder="Enter login"
            />
            <button type="button" onClick={() => buttonAddAdmin()}>
                Add Admin
            </button>
        </div>
    )
}

export default AddAdmin;
