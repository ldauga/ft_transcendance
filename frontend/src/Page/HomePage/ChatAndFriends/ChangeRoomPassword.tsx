import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.scss'
import '../Homepage.scss'
import { Checkbox } from '@mui/material';
import { valideInput } from '../../../Utils/utils';

function ChangeRoomPassword(props: { roomsConversData: { name: string, id: number } }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');

    const [passwordOrNot, setPasswordOrNot] = useState(false);

    const updateSettings = async () => {
        console.log('update Settings');
        if (text.length <= 0)
            return;
        if (text.length > 10)
            return;
        if (!valideInput(text, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
            console.log("valideInput false");
            return;
        }
        const newPassword = {
            login: userData.userReducer.user?.login,
            room_name: props.roomsConversData.name,
            passwordOrNot: passwordOrNot,
            password: text
        }
        console.log("roomName: ", props.roomsConversData.name);
        utilsData.socket.emit('changePassword', newPassword);
    };

    return (
        <div id="changePasswordContainer">
            <div id="changePasswordContainerFirst">
                <Checkbox
                    value={passwordOrNot}
                    onChange={e => setPasswordOrNot(!passwordOrNot)}
                />
                <p>Change password</p>
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') updateSettings() }}
                    placeholder="Enter name"
                    disabled={!passwordOrNot}
                    id="passwordInput"
                />
            </div>
            <button type="button" onClick={() => updateSettings()}>
                Update
            </button>
        </div>
    );
};

export default ChangeRoomPassword;