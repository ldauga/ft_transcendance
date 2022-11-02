import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/Rooms.scss'
import '../Homepage.scss'
import { Button, Checkbox, TextField } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import axiosConfig from '../../../Utils/axiosConfig';
import { SnackbarKey, withSnackbar } from 'notistack'
import { useSnackbar } from 'notistack';
import { valideInput } from '../../../Utils/utils';

function CreateRooms() {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [text, setText] = useState('');
    const [password, setPassword] = useState('');
    const [publicOrPrivate, setPublicOrPrivate] = useState(false);
    const [passwordOrNot, setPasswordOrNot] = useState(false);

    const createGroup = async () => {
        console.log("valideInput name: ", valideInput(text, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"));
        if (text.length <= 0) {
            enqueueSnackbar('The room name can\'t be empty', { variant: "warning", autoHideDuration: 2000 })
            return;
        }
        if (text.length > 15) {
            enqueueSnackbar('The room name max size is 15 characters', { variant: "warning", autoHideDuration: 2000 })
            return;
        }
        if ((password.length > 15) && passwordOrNot) {
            enqueueSnackbar('The password max size is 15 characters', { variant: "warning", autoHideDuration: 2000 })
            return;
        }
        if ((password.length <= 0) && passwordOrNot) {
            enqueueSnackbar('The password can\'t be empty', { variant: "warning", autoHideDuration: 2000 })
            return;
        }
        if (!valideInput(text, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
            enqueueSnackbar('A room can just has letters and numbers in his name', { variant: "warning", autoHideDuration: 2000 })
            return;
        }
        if (!valideInput(password, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890") && passwordOrNot) {
            enqueueSnackbar('A room can just has letters and numbers in his password', { variant: "warning", autoHideDuration: 2000 })
            return;
        }
        let a = 1;
        await axiosConfig.get('http://localhost:5001/rooms/check/' + text).then(async (res) => {
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
                publicOrPrivate: publicOrPrivate,
                passwordOrNot: passwordOrNot
            }
            console.log("newRoom: ", newRoom);
            utilsData.socket.emit('createChatRooms', newRoom);
            enqueueSnackbar('Your chat room is created', { variant: "success", autoHideDuration: 2000 })
            setText("");
            setPassword("");
        }
    };

    function CreateButton() {
        if (text.length <= 0) {
            return (
                <Button className="createButtonDisabled" variant="contained" onClick={createGroup} disabled={text.length <= 0} endIcon={<CreateIcon />} >
                    Create
                </Button>
            );
        }
        else {
            return (
                <Button className="createButton" variant="contained" onClick={createGroup} disabled={text.length <= 0} endIcon={<CreateIcon />} >
                    Create
                </Button>
            );
        }
    };

    return (
        <div id="CreateGroupContainer">
            <h3>Create a group</h3>
            <TextField id="createRoomTextField" label="Enter a name" variant="outlined" value={text} onChange={e => setText(e.target.value)} />
            {/* <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter name"
            // onKeyDown={(e) => { if (e.key === 'Enter') createGroup() }}
            /> */}
            <div id="PasswordOrNotContainer">
                <p>Password</p>
                <Checkbox
                    value={passwordOrNot}
                    onChange={e => setPasswordOrNot(!passwordOrNot)}
                />
                <TextField id="createRoomPasswordTextField" label="Enter a password" variant="outlined" value={password} onChange={e => setPassword(e.target.value)} disabled={!passwordOrNot} />
                {/* <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={!passwordOrNot}
                    id="PasswordOrNotContainerInput"
                // onKeyDown={(e) => { if (e.key === 'Enter') createGroup() }}
                /> */}
            </div>
            <div id="PrivateOrNotContainer">
                <p>Private</p>
                <Checkbox
                    value={publicOrPrivate}
                    onChange={e => setPublicOrPrivate(!publicOrPrivate)}
                />
            </div>
            <CreateButton />
            {/* <button type="button" onClick={() => createGroup()}>
                Create Group
            </button> */}
        </div>
    );
};

export default withSnackbar(CreateRooms);