import axios from 'axios';
import { createRef, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/RoomsConvers.scss'
import './CSS/Rooms.scss'
import './CSS/Convers.scss'
import '../Homepage.scss'
import CreateInvitationRooms from './CreateInvitationRooms';
import React from 'react';
import AffParticipantsRooms from './AffParticipantsRooms';
import { constWhileSecu } from '../HomePage';
import ChangeRoomPassword from './ChangeRoomPassword';
import axiosConfig from '../../../Utils/axiosConfig';
import SendIcon from '@mui/icons-material/Send';
import { Divider, IconButton, ListItemIcon, Menu, Button, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Grid, Switch, TextField } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Logout, Person, Settings } from "@mui/icons-material";
import BathtubIcon from '@mui/icons-material/Bathtub';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { valideInput } from '../../../Utils/utils';

function RoomsConvers(props: { setFriendList: Function, setRooms: Function, setRoomsConvers: Function, roomsConversData: { name: string, id: number }, oldAffRoomConvers: string, setChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);
    const [update, setUpdate] = useState(false);
    const [isAdmin, setAdmin] = useState(false);
    const [isOwner, setOwner] = useState(false);

    const [isAffParticipantsRooms, setAffParticipantsRooms] = useState(false);
    const [isConversRooms, setConversRooms] = useState(true);
    const [isChangeRoomPassword, setChangeRoomPassword] = useState(false);

    const [users, setUsers] = useState<{ id: number, login: string, nickname: string, profile_pic: string }[]>(new Array());

    const bottom = useRef<null | HTMLDivElement>(null);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const [openDialogChangePassword, setOpenDialogChangePassword] = useState(false);

    const [password, setPassword] = useState('');

    const [passwordOrNot, setPasswordOrNot] = useState(false);

    // const scrollToBottom = useScrollToBottom();

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        console.log('roomHasBeenDeleted = ', roomHasBeenDeletedReturn);
        if (roomHasBeenDeletedReturn == props.roomsConversData.name) {//NOTIF à ajouter
            closeConvers();
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    utilsData.socket.removeAllListeners('kickedOutOfTheGroup');

    utilsData.socket.on('kickedOutOfTheGroup', function (kickedOutOfTheGroupReturn: boolean) {
        console.log('kickedOutOfTheGroup = ', kickedOutOfTheGroupReturn);
        if (kickedOutOfTheGroupReturn == true) {
            console.log("You were kicked out of the ", props.roomsConversData.name, " group");//NOTIF à ajouter
            closeConvers();
        }
        utilsData.socket.off('kickedOutOfTheGroup');
        utilsData.socket.removeListener('kickedOutOfTheGroup');
    })

    utilsData.socket.removeAllListeners('newMsgReceived');

    utilsData.socket.on('newMsgReceived', function (data: any) {
        console.log('newMsgReceived = ', data);
        const length = itemListHistory.length;
        let secu = 0;
        while (length == itemListHistory.length && secu < constWhileSecu) {
            getListItem();
            secu++;
        }
        utilsData.socket.off('newMsgReceived');
        utilsData.socket.removeListener('newMsgReceived');
    })

    function getYear() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[3])
            return ("");
        return (tmp[3]);
    }

    function getMonth() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[1])
            return ("");
        return (tmp[1]);
    }

    function getDay() {
        const date = Date();
        if (!date)
            return ("");
        let tmp = date.split(' ');
        if (!tmp || !tmp[2])
            return ("");
        return (tmp[2]);
    }

    const handleClickChangePassword = () => {
        if (isChangeRoomPassword)
            setChangeRoomPassword(false);
        else
            setChangeRoomPassword(true);
    }

    const closeConvers = () => {
        props.setRoomsConvers(false);
        if (props.oldAffRoomConvers == "Rooms")
            props.setRooms(true);
        else if (props.oldAffRoomConvers == "Chat")
            props.setChat(true);
    };

    const quitConvers = () => {
        const participantToRemove = {
            login: userData.userReducer.user?.login,
            room_name: props.roomsConversData.name,
            room_id: props.roomsConversData.id
        }
        utilsData.socket.emit('removeParticipant', participantToRemove);
        setUpdate(false);
        closeConvers();
    };

    const removeRoom = () => {
        const roomToRemove = {
            id: userData.userReducer.user?.id,
            room_name: props.roomsConversData.name
        }
        utilsData.socket.emit('removeRoom', roomToRemove);
        closeConvers();
    }

    const affParticipants = () => {
        setConversRooms(false);
        setAffParticipantsRooms(true);
    };

    const checkIfAdmin = async () => {
        let ifAdmin = false;
        await axiosConfig.get('https://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        await axiosConfig.get('https://localhost:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifAdmin = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        console.log("return: ", ifAdmin);
        return ifAdmin;
    };

    const checkIfOwner = async () => {
        await axiosConfig.get('https://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                setOwner(true);
            }
            else {
                setAdmin(false);
                setOwner(false);
            }
        })
    };

    function AffDate(props: { item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        console.log("Date: ", Date());
        if (props.item.id_sender == userData.userReducer.user?.id) {
            if (getYear() != props.item.year)
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.month} {props.item.day} {props.item.year} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getMonth() != props.item.month)
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getDay() != props.item.day)
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else
                return (
                    <div className='dateDisplayNone'>
                        <p>{props.item.hour}:{props.item.minute}</p>
                    </div>
                );
        }
        else {
            const user = users.find(obj => obj.id == props.item.id_sender);
            const nickname = user?.nickname;
            if (getYear() != props.item.year)
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.month} {props.item.day} {props.item.year} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getMonth() != props.item.month)
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else if (getDay() != props.item.day)
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.month} {props.item.day} at {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
            else
                return (
                    <div className='dateDisplayNone'>
                        <p>{nickname} - {props.item.hour}:{props.item.minute}</p>
                    </div>
                );
        }

    };

    function Item(props: { item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string } }) {
        if (props.item.id_sender == userData.userReducer.user?.id) {
            return (
                <div className='inItem2'>
                    <AffDate item={props.item} />
                    <div onMouseOver={e => { var child = e.currentTarget.parentElement?.children[0]; if (child) child.className = 'date' }} onMouseOut={e => { var child = e.currentTarget.parentElement?.children[0]; if (child) child.className = 'dateDisplayNone' }} className={(props.item.id_sender == userData.userReducer.user?.id ? 'message sender' : 'message receiver')}>
                        <p>{props.item.text}</p>
                    </div>
                </div>
            );
        }
        else if (props.item.id_sender == 0) {
            return (
                <div className="server_msg">
                    <p>{props.item.text}</p>
                </div>
            );
        }
        else {
            const pp = users.find(obj => obj.id == props.item.id_sender)?.profile_pic;
            return (
                <div className='inItem2'>
                    <div className="picture-message">
                        <img src={pp}></img>
                        <div onMouseOver={e => { var child = e.currentTarget.parentElement?.parentElement?.children[1]; if (child) child.className = 'date' }} onMouseOut={e => { var child = e.currentTarget.parentElement?.parentElement?.children[1]; if (child) child.className = 'dateDisplayNone' }} className={(props.item.id_sender == userData.userReducer.user?.id ? 'message sender' : 'message receiver')}>
                            <p>{props.item.text}</p>
                        </div>
                    </div>
                    <AffDate item={props.item} />
                </div>
            );
        }
    };

    const getListItem = async () => {
        const admin = await checkIfAdmin();
        console.log("getListItem admin: ", admin);
        console.log("users: ", users);
        await axiosConfig.get('https://localhost:5001/messages/room/' + props.roomsConversData.id).then(async (res) => {
            console.log("get List Item Room Conversation", res.data);
            let itemList: any[] = []
            res.data.forEach((item: { id_sender: number, id_receiver: number, login_sender: string, login_receiver: string, userOrRoom: boolean, room_id: number, room_name: string, text: string, year: string, month: string, day: string, hour: string, minute: string }) => {
                itemList.push(<div key={itemList.length.toString()} className={(item.id_sender == userData.userReducer.user?.id ? 'content-sender' : (item.id_sender == 0 ? 'itemListConversContainerServer' : 'content-receiver'))}>
                    <Item item={item} />
                </div>)
            });
            console.log('itemList : ', itemList);
            setItemListHistory(itemList);
        })
    }

    const getUsers = async () => {
        console.log("getUsers");
        await axiosConfig.get('https://localhost:5001/participants/allUserForOneRoom/' + props.roomsConversData.name).then(async (res) => {
            console.log("get List User: ", res.data);
            let itemList: { id: number, login: string, nickname: string, profile_pic: string }[] = []
            res.data.forEach(async (item: { login: string, id: number }) => {
                await axiosConfig.get('https://localhost:5001/user/id/' + item.id).then(async (res) => {
                    itemList.push({ id: res.data.id, login: res.data.login, nickname: res.data.nickname, profile_pic: res.data.profile_pic });
                });
            });
            console.log('itemList get Users: ', itemList);
            setUsers(itemList);
            setUpdate(true);
        })
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [itemListHistory])

    useEffect(() => {
        setUpdate(false);
        checkIfOwner();
        getUsers();
        getListItem();
        bottom.current?.scrollIntoView();
    }, [props, update]);

    const handleClickOpenDialogChangePassword = () => {
        setOpenDialogChangePassword(true);
    };

    const handleCloseDialogChangePassword = () => {
        setPassword("");
        setPasswordOrNot(false);
        setOpenDialogChangePassword(false);
    };

    const updateSettings = async () => {
        if (password.length <= 0) {
            console.log("password empty");
            return;
        }
        if (password.length > 10) {
            console.log("password too long");
            return;
        }
        if (!valideInput(password, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
            console.log("valideInput false");
            return;
        }
        if (password.length >= 0) {
            console.log('update Settings with password: ', password, ", passwordOrNot: ", passwordOrNot);
            const newPassword = {
                login: userData.userReducer.user?.login,
                room_name: props.roomsConversData.name,
                passwordOrNot: passwordOrNot,
                password: password
            }
            console.log("roomName: ", props.roomsConversData.name);
            utilsData.socket.emit('changePassword', newPassword);
        }
        else
            console.log("empty password");
        setPassword("");
        setPasswordOrNot(false);
        setOpenDialogChangePassword(false);
    };

    function Header() {
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);

        const handleClickOpenOptions = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
        };

        const handleCloseOptions = () => {
            setAnchorEl(null);
        };

        function MenuOptionsOwner() {
            return (
                <Menu
                    disableAutoFocusItem
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleCloseOptions}
                    onClick={handleCloseOptions}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleClickOpenDialogChangePassword}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Change Password
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={quitConvers}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Quit Room
                    </MenuItem>
                    <MenuItem onClick={removeRoom}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        Remove Room
                    </MenuItem>
                </Menu>
            );
        };

        function MenuOptionsAdmin() {
            return (
                <Menu
                    disableAutoFocusItem
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleCloseOptions}
                    onClick={handleCloseOptions}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={quitConvers}>
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        Quit Room
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleClickOpenDialogChangePassword}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Change Password
                    </MenuItem>
                </Menu>
            );
        };

        if (isOwner)
            return (
                <div className="header">
                    <div className="mainHeaderLeft mainHeaderSide">
                        <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    </div>
                    <h3>{props.roomsConversData.name}</h3>
                    <div id="RoomsConversHeaderRight" className="mainHeaderRight mainHeaderSide">
                        <IconButton onClick={affParticipants}>
                            <BathtubIcon />
                        </IconButton>
                        <IconButton onClick={handleClickOpenOptions}>
                            <MoreVertIcon />
                        </IconButton>
                        <MenuOptionsOwner />
                        {/* <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={removeRoom} className="bi bi-x-lg"></button>
                        <button onClick={quitConvers}><i className="bi bi-box-arrow-left"></i></button>
                        <button onClick={handleClickChangePassword}><i className="bi bi-gear-fill"></i></button> */}
                    </div>
                </div>
            );
        else if (isAdmin)
            return (
                <div id="header" className="mainHeader">
                    <div className="mainHeaderLeft mainHeaderSide">
                        <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    </div>
                    <h3>{props.roomsConversData.name}</h3>
                    <div id="RoomsConversHeaderRight" className="mainHeaderRight mainHeaderSide">
                        <IconButton onClick={affParticipants}>
                            <BathtubIcon />
                        </IconButton>
                        <IconButton onClick={handleClickOpenOptions}>
                            <MoreVertIcon />
                        </IconButton>
                        <MenuOptionsAdmin />
                        {/* <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={quitConvers}><i className="bi bi-box-arrow-left"></i></button>
                        <button onClick={handleClickChangePassword}><i className="bi bi-gear-fill"></i></button> */}
                    </div>
                </div>
            );
        else
            return (
                <div id="header" className="mainHeader">
                    <div className="mainHeaderLeft mainHeaderSide">
                        <button onClick={closeConvers} className="bi bi-arrow-left"></button>
                    </div>
                    <h3>{props.roomsConversData.name}</h3>
                    <div id="RoomsConversHeaderRight" className="mainHeaderRight mainHeaderSide">
                        <IconButton onClick={affParticipants}>
                            <BathtubIcon />
                        </IconButton>
                        <IconButton onClick={quitConvers}>
                            <BabyChangingStationIcon />
                        </IconButton>
                        {/* <button onClick={affParticipants}><i className="bi bi-people-fill"></i></button>
                        <button onClick={quitConvers}><i className="bi bi-box-arrow-left"></i></button> */}
                    </div>
                </div>
            );
    };

    function AffRoomConvers() {

        const [messageText, setMessageText] = useState('');

        function sendMessage() {
            if (messageText.length <= 0)
                return;
            const newMsg = {
                id_sender: userData.userReducer.user?.id,
                id_receiver: 0,
                login_sender: userData.userReducer.user?.login,
                login_receiver: "",
                userOrRoom: true,
                room_id: props.roomsConversData.id,
                room_name: props.roomsConversData.name,
                text: messageText
            }
            utilsData.socket.emit('createMsg', newMsg);
            setMessageText("");
        };

        function SendButton() {
            if (messageText.length <= 0) {
                return (
                    <button className="sendButtonDisabled" onClick={sendMessage} disabled={messageText.length <= 0}>
                        send
                    </button>
                );
            }
            else {
                return (
                    <button onClick={sendMessage} disabled={messageText.length <= 0}>
                        send
                    </button>
                );
            }
        };

        return (
            <div className="chat">
                <Header />
                {isChangeRoomPassword && <ChangeRoomPassword roomsConversData={props.roomsConversData} />}
                <AffConvers />
                <div className="send-message">
                <TextField value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder='Your message...'
                    multiline maxRows={5}
                    onKeyDown={(e) => {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <SendButton />
            </div>
            </div>
        );
    };

    function AffConvers() {
            return (
                <div className="messages" ref={bottom}>
                    {itemListHistory}
                    <div ref={messagesEndRef} />
                </div>
            );
    };

    return (
        <div id="roomsConvers">
            {isConversRooms && <AffRoomConvers />}
            {isAffParticipantsRooms && <AffParticipantsRooms roomsConversData={props.roomsConversData} setAffParticipantsRooms={setAffParticipantsRooms} setConversRooms={setConversRooms} closeConvers={closeConvers} setRooms={props.setRooms} oldAffRoomConvers={props.oldAffRoomConvers} setChat={props.setChat} />}
            <Dialog open={openDialogChangePassword} onClose={handleCloseDialogChangePassword}>
                <Grid container direction={"column"} spacing={1}>
                    <Grid item>
                        <DialogTitle className="TitleContainerDialogChangePassword" >Change Password</DialogTitle>
                    </Grid>
                    <Grid item>
                        <DialogContent>
                            <Grid container direction={"row"} spacing={5}>
                                <Grid item>
                                    <Switch value={passwordOrNot} onChange={e => setPasswordOrNot(!passwordOrNot)} />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="outlined-password-input"
                                        label="Password"
                                        type="password"
                                        autoComplete="current-password"
                                        variant="outlined"
                                        disabled={!passwordOrNot}
                                        value={password} onChange={e => setPassword(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Grid>
                </Grid>
                <DialogActions>
                    <Button onClick={handleCloseDialogChangePassword}>Cancel</Button>
                    <Button onClick={updateSettings}>Enter</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RoomsConvers;
