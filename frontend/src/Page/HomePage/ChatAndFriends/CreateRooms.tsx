import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.css'
import '../HomePage.css'
import { CheckBox } from '@mui/icons-material';
import { Checkbox } from '@mui/material';

function CreateRooms() {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');
    const [password, setPassword] = useState('');
    const [publicOrPrivate, setPublicOrPrivate] = useState(false);

    const createGroup = async () => {
        if (text.length <= 0 || text.length > 20)
            return; //gestion d'erreur
        let a = 1;
        await axios.get('http://localhost:5001/rooms/check/' + text).then(async (res) => {
            if (res.data == true) {
                console.log("room already exist");
            }
            else {
                a = 2;
                console.log('room not exist');
            }
        });
        if (a == 2) {
            console.log('test == true');
            const newRoom = {
                name: text,
                description: "",
                password: password,
                identifiant: 1,
                owner_id: userData.userReducer.user?.id,
                owner_login: userData.userReducer.user?.login,
                publicOrPrivate: publicOrPrivate
            }
            utilsData.socket.emit('createChatRooms', newRoom);
            setText("");
            setPassword("");
        }
    };

    return (
        <div id="CreateGroupContainer">
            <h3>Create a group</h3>
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter name"
            // onKeyDown={(e) => { if (e.key === 'Enter') createGroup() }}
            />
            <div id="PublicOrPrivateContainer">
                <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={!publicOrPrivate}
                // onKeyDown={(e) => { if (e.key === 'Enter') createGroup() }}
                />
                <p>Private</p>
                <Checkbox
                    value={publicOrPrivate}
                    onChange={e => setPublicOrPrivate(!publicOrPrivate)}
                />
            </div>
            <button type="button" onClick={() => createGroup()}>
                Create Group
            </button>
        </div>
    );
};

export default CreateRooms;