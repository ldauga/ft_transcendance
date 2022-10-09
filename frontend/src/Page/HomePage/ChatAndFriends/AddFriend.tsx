import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import './CSS/AddFriend.css';

function AddFriend() {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReduceur);

    const [text, setText] = useState('');

    async function buttonAddFriend() {
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
                await axios.get('http://localhost:5001/invitationRequest/' + userData.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
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
                await axios.get('http://localhost:5001/friendList/' + userData.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
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
                        sender_login: userData.userReducer.user?.login,
                        receiver_login: receiver_login_tmp,
                        userOrRoom: false,
                        room_id: 0,
                        room_name: ""
                    }
                    utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
                }
                return;
            }
        });
    }

    return (
        <div id="addFriendContainer">
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') buttonAddFriend() }}
                placeholder="Enter login"
            />
            <button type="button" onClick={() => buttonAddFriend()}>
                Add Friend
            </button>
        </div>
    )
}

export default AddFriend;