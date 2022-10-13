import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.css'
import '../HomePage.css'

function CreateRooms() {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [text, setText] = useState('');

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
                password: "",
                identifiant: 1,
                owner_id: userData.userReducer.user?.id,
                owner_login: userData.userReducer.user?.login
            }
            utilsData.socket.emit('createChatRooms', newRoom);
            setText("");
            // const newParticipant = {
            //     user_id: data.user_id,
            //     user_login: data.user_login,
            //     room_id: data.room_id,
            //     room_name: data.room_name
            // }
            // utilsData.socket.emit('participants', newRoom);
        }

    };

    return (
        <div id="CreateGroupContainer">
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter name"
                onKeyDown={(e) => { if (e.key === 'Enter') createGroup() }}
            />
            <button type="button" onClick={() => createGroup()}>
                Create Group
            </button>
        </div>
    );
};

export default CreateRooms;