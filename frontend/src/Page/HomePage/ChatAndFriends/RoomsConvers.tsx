import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/RoomsConvers.scss'
import './CSS/Rooms.scss'
import './CSS/Convers.scss'
import '../Homepage.scss'
import React from 'react';
import AffParticipantsRooms from './AffParticipantsRooms';
import axiosConfig from '../../../Utils/axiosConfig';
import { Divider, IconButton, ListItemIcon, Menu, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Grid, Switch, TextField, Tooltip } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ArrowBackIosNew, Person, Settings } from "@mui/icons-material";
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { valideInput } from '../../../Utils/utils';
import AffConvers from './AffRoomConvers';
import { useSnackbar } from 'notistack';

function RoomsConvers(props: { setFriendList: Function, setRooms: Function, setRoomsConvers: Function, roomsConversData: { name: string, id: number }, oldAffRoomConvers: string, setChat: Function, setRoomsConversData: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [isOwner, setOwner] = useState(false);
    const [isAdmin, setAdmin] = useState(false);
    const [isMute, setMute] = useState(false);
    const [textPlaceHolder, setTextPlaceHolder] = useState("Your message...");

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [update, setUpdate] = useState(true);

    const [isAffParticipantsRooms, setAffParticipantsRooms] = useState(false);
    const [isConversRooms, setConversRooms] = useState(true);

    const [openDialogChangePassword, setOpenDialogChangePassword] = useState(false);

    const [pp1, setPp1] = useState("");
    const [pp2, setPp2] = useState("");

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: string) {
        if (roomHasBeenDeletedReturn == props.roomsConversData.name) {//NOTIF Ã  ajouter
            closeConvers();
        }
        utilsData.socket.off('roomHasBeenDeleted');
        utilsData.socket.removeListener('roomHasBeenDeleted');
    })

    utilsData.socket.removeAllListeners('kickedOutOfTheGroup');

    utilsData.socket.on('kickedOutOfTheGroup', function (kickedOutOfTheGroupReturn: boolean) {
        if (kickedOutOfTheGroupReturn == true) {
            closeConvers();
        }
        utilsData.socket.off('kickedOutOfTheGroup');
        utilsData.socket.removeListener('kickedOutOfTheGroup');
    })

    utilsData.socket.removeAllListeners('mutedUserInRoom');

    utilsData.socket.on('mutedUserInRoom', function (mutedUserInRoomReturn: boolean) {
        checkIfMute();
        utilsData.socket.off('mutedUserInRoom');
        utilsData.socket.removeListener('mutedUserInRoom');
    })

    utilsData.socket.removeAllListeners('newParticipant');

    utilsData.socket.on('newParticipant', function (newParticipantReturn: boolean) {
        utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        getUsers();
        utilsData.socket.off('newParticipant');
        utilsData.socket.removeListener('newParticipant');
    })

    utilsData.socket.removeAllListeners('demutedUserInRoom');

    utilsData.socket.on('demutedUserInRoom', function (newParticipantReturn: boolean) {
        checkIfMute();
        utilsData.socket.off('demutedUserInRoom');
        utilsData.socket.removeListener('demutedUserInRoom');
    })

    utilsData.socket.removeAllListeners('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (removeParticipantReturnReturn: boolean) {
        utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        getUsers();
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    const closeConvers = () => {
        props.setRoomsConversData({ name: "", id: 0 });
        props.setRoomsConvers(false);
        props.setChat(true);
    };

    const quitConvers = () => {
        const participantToRemove = {
            id_sender: userData.userReducer.user?.id,
            login_sender: userData.userReducer.user?.login,
            login: userData.userReducer.user?.login,
            id: userData.userReducer.user?.id,
            room_name: props.roomsConversData.name,
            room_id: props.roomsConversData.id
        }
        utilsData.socket.emit('removeParticipant', participantToRemove);
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

    const checkIfOwner = async () => {
        await axiosConfig.get('https://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            if (res.data == true) {
                setOwner(true);
            }
            else {
                setOwner(false);
            }
        })
    };

    useEffect(() => {
        checkIfOwner();
        checkIfAdmin();
        checkIfMute();
        getUsers();
    }, [props]);

    const getUsers = async () => {
        let i = 0;
        setPp1("");
        setPp2("");
        await axiosConfig.get('https://localhost:5001/participants/allUserForOneRoom/' + props.roomsConversData.name).then(async (res) => {
            res.data.forEach(async (item: { login: string, id: number }) => {
                await axiosConfig.get('https://localhost:5001/user/id/' + item.id).then(async (res) => {
                    if (i == 0) {
                        setPp1(res.data.profile_pic);
                        i++;
                    }
                    else if (i == 1) {
                        setPp2(res.data.profile_pic);
                        i++;
                    }
                    else
                        return;
                });
                if (i > 1)
                    return;
            });
        })
    }

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
                    <MenuItem key='Change Password' onClick={handleClickOpenDialogChangePassword}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Change Password
                    </MenuItem>
                    <Divider />
                    <MenuItem key='Quit Room' onClick={quitConvers}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Quit Room
                    </MenuItem>
                    <MenuItem key='Remove Room' onClick={removeRoom}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        Remove Room
                    </MenuItem>
                </Menu>
            );
        };

        function HeaderPrint() {

            const [textNicknameHeader, setTextNicknameHeader] = useState("");

            utilsData.socket.removeAllListeners('getAllParticipantsReturn');

            utilsData.socket.on('getAllParticipantsReturn', function (data: { id: number, login: string, nickname: string, profile_pic: string, admin: boolean, mute: boolean }[]) {
                let str_nickname = "";
                for (let i = 0; i < data.length; i++) {
                    if (i + 1 < data.length)
                        str_nickname = str_nickname + data[i].nickname + ", ";
                    else
                        str_nickname = str_nickname + data[i].nickname;
                }
                setTextNicknameHeader(str_nickname);
                utilsData.socket.off('getAllParticipantsReturn');
                utilsData.socket.removeListener('getAllParticipantsReturn');
            })

            const getAllParticipant = async () => {
                let str_nickname = "";
                await axiosConfig.get('https://localhost:5001/participants/allUserForOneRoom/' + props.roomsConversData.name).then(async (res) => {
                    for (let i = 0; i < res.data.length; i++) {
                        if (i + 1 < res.data.length) {
                            await axiosConfig.get('https://localhost:5001/user/id/' + res.data[i].id).then(async (element) => {
                                str_nickname = str_nickname + element.data.nickname + ", ";
                            });
                        }
                        else {
                            await axiosConfig.get('https://localhost:5001/user/id/' + res.data[i].id).then(async (element) => {
                                str_nickname = str_nickname + element.data.nickname;
                            });
                        }
                    }
                    setTextNicknameHeader(str_nickname);
                })
            }

            useEffect(() => {
                getAllParticipant();
                if (update) {
                    setUpdate(false);
                }
            })

            return (
                <>
                    <ArrowBackIosNew onClick={closeConvers} />
                    <div className="group-profile">
                        {pp2 && pp1 ? <div className='profile-pic-group'>
                            <img src={pp1} />
                            <img src={pp2} />
                        </div> : pp1 ?
                            <div className='profile'><img src={pp1} /></div> :
                            <div className='profile-pic-group'><img src="" /></div>}
                        <div className="group-name">
                            <p>{props.roomsConversData.name}</p>
                            <p className='name-participants' onClick={affParticipants}>{textNicknameHeader}</p>
                        </div>
                    </div>
                </>
            )
        }

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
                                backgroundColor: "transparent",
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem key='Quit Room' onClick={quitConvers}>
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        Quit Room
                    </MenuItem>
                    <Divider />
                    <MenuItem key='Change Password' onClick={handleClickOpenDialogChangePassword}>
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
                    <HeaderPrint />
                    <IconButton onClick={handleClickOpenOptions}>
                        <MoreVertIcon />
                    </IconButton>
                    <MenuOptionsOwner />
                </div>
            );
        else if (isAdmin)
            return (
                <div className="header">
                    <HeaderPrint />
                    <IconButton onClick={handleClickOpenOptions}>
                        <MoreVertIcon />
                    </IconButton>
                    <MenuOptionsAdmin />
                </div>
            );
        else
            return (
                <div className="header">
                    <HeaderPrint />
                    <Tooltip title="Quit chat room">
                        <IconButton onClick={quitConvers}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            );
    };

    function SendZone() {
        const [messageText, setMessageText] = useState('');

        const [count, setCount] = useState(0);

        function sendMessage() {
            if (messageText.length <= 0 || isMute)
                return;
            if (messageText.length > 300) {
                enqueueSnackbar(`Max message size: 300 characters`, { variant: 'warning', autoHideDuration: 1000 })
                setMessageText("");
            }
            if ((Math.round(((new Date()).valueOf() / 1000))) < count + 2) {
                enqueueSnackbar(`Please wait ${(count + 2) - (Math.round(((new Date()).valueOf() / 1000)))} seconds`, { variant: 'warning', autoHideDuration: 1000 })
                return;
            }
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
            setCount(Math.round(((new Date()).valueOf() / 1000)));
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
            <div className="send-message">
                <TextField value={messageText}
                    autoFocus
                    onChange={e => setMessageText(e.target.value)}
                    placeholder={textPlaceHolder}
                    multiline maxRows={5}
                    onKeyDown={(e) => {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    disabled={isMute}
                />
                <SendButton />
            </div>
        );
    }

    function AffRoomConvers() {
        return (
            <div className="chat">
                <Header />
                <AffConvers roomsConversData={props.roomsConversData} />
                <SendZone />
            </div>
        );
    };

    const checkIfAdmin = async () => {
        let ifAdmin = false;
        await axiosConfig.get('https://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        await axiosConfig.get('https://localhost:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
    };

    const checkIfMute = async () => {
        await axiosConfig.get('https://localhost:5001/muteList/checkRoomMute/' + userData.userReducer.user?.id + '/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
            if (res.data == true) {
                setMute(true);
                setTextPlaceHolder("You are mute");
            }
            else {
                setMute(false);
                setTextPlaceHolder("Your message...");
            }
        })
    };

    const handleClickOpenDialogChangePassword = () => {
        setOpenDialogChangePassword(true);
    };

    function ChangePassword() {
        const [password, setPassword] = useState('');

        const [passwordOrNot, setPasswordOrNot] = useState(false);

        const handleCloseDialogChangePassword = () => {
            setPassword("");
            setPasswordOrNot(false);
            setOpenDialogChangePassword(false);
        };

        const updateSettings = async () => {
            if (password.length <= 0 && passwordOrNot) {
                enqueueSnackbar('Empty password.', { variant: 'error', autoHideDuration: 2000 })
                return;
            }
            if (password.length > 10 && passwordOrNot) {
                enqueueSnackbar('Password too long. (10 char. max.)', { variant: 'error', autoHideDuration: 2000 })
                return;
            }
            if (!valideInput(password, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890") && passwordOrNot) {
                enqueueSnackbar('Allowed characters: only alpha and only digits.', { variant: 'error', autoHideDuration: 2000 })
                return;
            }
            if (password.length >= 0 || !passwordOrNot) {
                const newPassword = {
                    login: userData.userReducer.user?.login,
                    room_id: props.roomsConversData.id,
                    room_name: props.roomsConversData.name,
                    passwordOrNot: passwordOrNot,
                    password: password
                }
                utilsData.socket.emit('changePassword', newPassword);
            }
            else
                setPassword("");
            setPasswordOrNot(false);
            setOpenDialogChangePassword(false);
        };

        return (
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
                                        onKeyDown={(e) => {
                                            if (e.keyCode == 13) {
                                                e.preventDefault();
                                                updateSettings();
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Grid>
                </Grid>
                <DialogActions>
                    <button onClick={handleCloseDialogChangePassword}>Cancel</button>
                    <button onClick={updateSettings}>Enter</button>
                </DialogActions>
            </Dialog>
        );
    }


    return (
        <div className="roomsConvers">
            {isConversRooms && <AffRoomConvers />}
            {isAffParticipantsRooms && <AffParticipantsRooms roomsConversData={props.roomsConversData} setAffParticipantsRooms={setAffParticipantsRooms} setConversRooms={setConversRooms} closeConvers={closeConvers} setRooms={props.setRooms} oldAffRoomConvers={props.oldAffRoomConvers} setChat={props.setChat} />}
            <ChangePassword />
        </div>
    );
};

export default RoomsConvers;
