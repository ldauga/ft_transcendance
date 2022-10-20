import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../State";
import axiosConfig from "../../../Utils/axiosConfig";
import './CSS/BanRoomParticipant.css';

function MuteRoomParticipant(props: { roomsConversData: { name: string, id: number } }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');

    const [alwaysOrNot, setAlwaysOrNot] = useState(false);

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);


    async function buttonMuteRoomParticipant() {
        let test = false;
        console.log('addFriend');
        await axios.get('http://localhost:5001/user/login/' + text, {withCredentials:true}).then(async (res) => {
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
                await axiosConfig.get('http://localhost:5001/muteList/checkRoomMute/' + res.data.id + '/' + res.data.login + '/' + props.roomsConversData.name).then(async (res) => {
                    console.log('check invit');
                    console.log(res.data);
                    console.log(res);
                    if (res.data == true) {
                        console.log("mute already exist");
                    }
                    else {
                        a = 2;
                        console.log('mute not exist');
                    }
                })
                if (a == 2) {
                    console.log('test == true');
                    console.log(receiver_login_tmp);
                    const newMuted = {
                        id_sender: userData.userReducer.user?.id,
                        id_muted: res.data.id,
                        login_sender: userData.userReducer.user?.login,
                        login_muted: res.data.login,
                        userOrRoom: true,
                        receiver_login: "",
                        room_id: props.roomsConversData.id,
                        room_name: props.roomsConversData.name,
                        cause: "",
                        date: 0,
                        alwaysOrNot: false,
                        timer: (seconds + minutes * 60 + hours * 3600 + days * 3600 * 24)
                    }
                    utilsData.socket.emit('createRoomMute', newMuted);
                }
                return;
            }
        });
    }

    const handleChangeDays = (event: SelectChangeEvent) => {
        setDays(parseInt(event.target.value, 10));
    };

    const handleChangeHours = (event: SelectChangeEvent) => {
        setHours(parseInt(event.target.value, 10));
    };

    const handleChangeMinutes = (event: SelectChangeEvent) => {
        setMinutes(parseInt(event.target.value, 10));
    };

    const handleChangeSeconds = (event: SelectChangeEvent) => {
        setSeconds(parseInt(event.target.value, 10));
    };

    return (
        <div id="banContainer">
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter login"
                id="banInputLogin"
            />
            <p>How long ?</p>
            <div className="banlineContainer">
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Days</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        className="banSelect"
                        value={days.toString()}
                        label="Days"
                        onChange={handleChangeDays}
                        disabled={alwaysOrNot}
                    >
                        <MenuItem value={0}>0</MenuItem>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={12}>10</MenuItem>
                        <MenuItem value={24}>30 </MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Hours</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        className="banSelect"
                        value={hours.toString()}
                        label="Hours"
                        onChange={handleChangeHours}
                        disabled={alwaysOrNot}
                    >
                        <MenuItem value={0}>0</MenuItem>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={12}>12</MenuItem>
                        <MenuItem value={24}>24</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Minutes</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        className="banSelect"
                        value={minutes.toString()}
                        label="Minutes"
                        onChange={handleChangeMinutes}
                        disabled={alwaysOrNot}
                    >
                        <MenuItem value={0}>0</MenuItem>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={40}>40</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Secondes</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        className="banSelect"
                        value={seconds.toString()}
                        label="Secondes"
                        onChange={handleChangeSeconds}
                        disabled={alwaysOrNot}
                    >
                        <MenuItem value={0}>0</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={40}>40</MenuItem>
                    </Select>
                </FormControl>
                <p>Always</p>
                <Checkbox
                    value={alwaysOrNot}
                    onChange={e => setAlwaysOrNot(!alwaysOrNot)}
                    id="checkBoxBan"
                />
            </div>
            <button type="button" onClick={() => buttonMuteRoomParticipant()}>
                Mute User
            </button>
        </div>
    )
}

export default MuteRoomParticipant;