import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './CSS/AffParticipantsRooms.scss'
import '../Homepage.scss'
import { constWhileSecu } from '../HomePage';
import BanRoomParticipant from './BanRoomParticipant';
import AddAdmin from './AddAdmin';
import CreateInvitationRooms from './CreateInvitationRooms';
import axiosConfig from '../../../Utils/axiosConfig';
import MuteRoomParticipant from './MuteRoomParticipant';
import AffParticipantsBanned from './AffParticipantsBanned';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, ListItemIcon, Menu, TextField } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React from 'react';
import { ArrowBackIosNew, Person, Settings } from '@mui/icons-material';
import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SendIcon from '@mui/icons-material/Send';

function AffParticipantsRooms(props: { roomsConversData: { name: string, id: number }, setAffParticipantsRooms: Function, setConversRooms: Function, closeConvers: Function, setRooms: Function, oldAffRoomConvers: string, setChat: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [isCreateInvitation, setCreateInvitation] = useState(false);

    const [itemListHistory, setItemListHistory] = useState(Array<any>);

    const [isAdmin, setAdmin] = useState(false);

    const [banRoomParticipant, setBanRoomParticipant] = useState(false);
    const [muteRoomParticipant, setMuteRoomParticipant] = useState(false);
    const [addAdmin, setAddAdmin] = useState(false);

    const [pp1, setPp1] = useState("");
    const [pp2, setPp2] = useState("");

    const [isAffBanned, setAffBanned] = useState(false);

    const [openDialogMute, setOpenDialogMute] = useState(false);
    const [userToMute, setUserToMute] = useState({ login: "", id: 0, admin: false })

    const [openDialogBan, setOpenDialogBan] = useState(false);
    const [userToBan, setUserToBan] = useState({ login: "", id: 0, admin: false })

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [alwaysOrNot, setAlwaysOrNot] = useState(false);

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


    const handleClickOpenDialogMute = (item: { login: string, id: number, admin: boolean, participantAdmin: boolean }) => {
        setUserToMute(item);
        setOpenDialogMute(true);
    };

    const handleCloseDialogMute = () => {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAlwaysOrNot(false);
        setOpenDialogMute(false);
        setUserToMute({ login: "", id: 0, admin: false });
    };

    const handleClickOpenDialogBan = (item: { login: string, id: number, admin: boolean, participantAdmin: boolean }) => {
        setUserToBan(item);
        setOpenDialogBan(true);
    };

    const handleCloseDialogBan = () => {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAlwaysOrNot(false);
        setOpenDialogBan(false);
        setUserToBan({ login: "", id: 0, admin: false });
    };

    async function buttonMuteRoomParticipant() {
        let test = false;
        console.log("button with alwaysOrNot: ", alwaysOrNot);
        console.log("days = ", days, ", minutes = ", minutes, ", seconds = ", seconds, ", alwaysOrNot = ", alwaysOrNot);
        if (days == 0 && hours == 0 && minutes == 0 && seconds == 0 && !alwaysOrNot) {
            console.log("Wrong input for muteUser in Room");
            return;
        }
        console.log("button mute");
        await axiosConfig.get('https://localhost:5001/user/login/' + userToMute.login).then(async (res) => {
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
                await axiosConfig.get('https://localhost:5001/muteList/checkRoomMute/' + res.data.id + '/' + res.data.login + '/' + props.roomsConversData.name).then(async (res) => {
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
                        alwaysOrNot: alwaysOrNot,
                        timer: (seconds + minutes * 60 + hours * 3600 + days * 3600 * 24)
                    }
                    utilsData.socket.emit('createRoomMute', newMuted);
                }
                return;
            }
        });
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAlwaysOrNot(false);
        setOpenDialogMute(false);
        setUserToMute({ login: "", id: 0, admin: false });
    }

    async function buttonBanRoomParticipant() {
        let test = false;
        console.log("days = ", days, ", minutes = ", minutes, ", seconds = ", seconds, ", alwaysOrNot = ", alwaysOrNot);
        if (days == 0 && hours == 0 && minutes == 0 && seconds == 0 && !alwaysOrNot) {
            console.log("Wrong input for banUser in Room");
            return;
        }
        await axiosConfig.get('https://localhost:5001/user/login/' + userToBan.login).then(async (res) => {
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
                await axiosConfig.get('https://localhost:5001/blackList/checkRoomBan/' + res.data.id + '/' + res.data.login + '/' + props.roomsConversData.name).then(async (res) => {
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
                        userOrRoom: true,
                        receiver_login: "",
                        room_id: props.roomsConversData.id,
                        room_name: props.roomsConversData.name,
                        cause: "",
                        date: 0,
                        alwaysOrNot: alwaysOrNot,
                        timer: (seconds + minutes * 60 + hours * 3600 + days * 3600 * 24)
                    }
                    utilsData.socket.emit('createRoomBan', newBan);
                }
                return;
            }
        });
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAlwaysOrNot(false);
        setOpenDialogBan(false);
        setUserToBan({ login: "", id: 0, admin: false });
    }

    async function buttonAddAdmin(item: { login: string, id: number, admin: boolean }) {
        let test = false;
        console.log('addFriend');
        await axiosConfig.get('https://localhost:5001/user/login/' + item.login).then(async (res) => {
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

    async function buttonRemoveAdmin(item: { login: string, id: number, admin: boolean }) {
        let test = false;
        console.log('addFriend');
        await axiosConfig.get('https://localhost:5001/user/login/' + item.login).then(async (res) => {
            console.log("axios.get");
            console.log(res.data);
            console.log(res);
            let receiver_login_tmp: string = res.data.login;
            if (res.data == "") {
                console.log("login not found");
                return;
            }
            else {
                const removeAdmin = {
                    id_sender: userData.userReducer.user?.id,
                    id_admin: res.data.id,
                    login_sender: userData.userReducer.user?.login,
                    login_admin: res.data.login,
                    room_id: props.roomsConversData.id,
                    room_name: props.roomsConversData.name
                }
                utilsData.socket.emit('removeAdmin', removeAdmin);
            }
            return;
        });
    }

    const checkIfAdmin = async () => {
        let ifAdmin = false;
        await axiosConfig.get('https://localhost:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name, { withCredentials: true }).then(async (res) => {
            console.log("check ifOwner = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        await axiosConfig.get('https://localhost:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name, { withCredentials: true }).then(async (res) => {
            console.log("check ifAdmin = ", res.data);
            if (res.data == true) {
                setAdmin(true);
                ifAdmin = true;
            }
        })
        console.log("return: ", ifAdmin);
        return ifAdmin;
    };

    utilsData.socket.removeAllListeners('refreshParticipants');

    utilsData.socket.on('refreshParticipants', function (refreshParticipants: boolean) {
        console.log('refreshParticipants = ', refreshParticipants);
        if (refreshParticipants == true) {
            utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        }
        utilsData.socket.off('refreshParticipants');
        utilsData.socket.removeListener('refreshParticipants');
    })

    utilsData.socket.removeAllListeners('roomHasBeenDeleted');

    utilsData.socket.on('roomHasBeenDeleted', function (roomHasBeenDeletedReturn: boolean) {
        console.log('roomHasBeenDeleted = ', roomHasBeenDeletedReturn);
        if (roomHasBeenDeletedReturn == true) {
            console.log(props.roomsConversData.name, " has been deleted");//NOTIF à ajouter
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

    utilsData.socket.removeAllListeners('newParticipant');

    utilsData.socket.on('newParticipant', function (newParticipantReturn: boolean) {
        console.log('newParticipant = ', newParticipantReturn);
        utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('newParticipant');
        utilsData.socket.removeListener('newParticipant');
    })

    utilsData.socket.removeAllListeners('removeParticipantReturn');

    utilsData.socket.on('removeParticipantReturn', function (roomHasBeenDeletedReturn: string) {
        console.log('removeParticipantReturn = ', roomHasBeenDeletedReturn);
        utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('removeParticipantReturn');
        utilsData.socket.removeListener('removeParticipantReturn');
    })

    utilsData.socket.removeAllListeners('mutedUserInRoom');

    utilsData.socket.on('mutedUserInRoom', function (demutedUserInRoom: boolean) {
        console.log('mutedUserInRoom = ', demutedUserInRoom);
        utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
        utilsData.socket.off('mutedUserInRoom');
        utilsData.socket.removeListener('mutedUserInRoom');
    })

    const addInvitationRequest = () => {
        if (isCreateInvitation)
            setCreateInvitation(false);
        else
            setCreateInvitation(true);
    };

    const handleClickMuteRoomParticipant = () => {
        if (muteRoomParticipant)
            setMuteRoomParticipant(false);
        else
            setMuteRoomParticipant(true);
    }

    const handleClickBanRoomParticipant = () => {
        if (banRoomParticipant)
            setBanRoomParticipant(false);
        else
            setBanRoomParticipant(true);
    }

    const handleClickAddAdmin = () => {
        if (addAdmin)
            setAddAdmin(false);
        else
            setAddAdmin(true);
    }

    const closeAffParticipantsRooms = () => {
        props.setAffParticipantsRooms(false);
        props.setConversRooms(true);
    }

    const closeConvers = () => {
        console.log("closeConvers AffParticipantRooms");
        props.setAffParticipantsRooms(false);
        props.setConversRooms(false);
        if (props.oldAffRoomConvers == "chat")
            props.setChat(true);
        else
            props.setRooms(true);
    }

    const removeParticipant = (item: { login: string, id: number, admin: boolean, participantAdmin: boolean }) => {
        const participantToRemove = {
            id_sender: userData.userReducer.user?.id,
            login: item.login,
            room_name: props.roomsConversData.name
        }
        utilsData.socket.emit('removeParticipant', participantToRemove);
    }

    function demute(item: { login: string, id: number, admin: boolean }) {
        utilsData.socket.emit('removeRoomMute', { room_name: props.roomsConversData.name, room_id: props.roomsConversData.id, login_muted: item.login });
    };

    function RightItemMuted(item: { login: string, id: number, admin: boolean, participantAdmin: boolean }) {
        console.log("RightItemMuted isAdmin: ", isAdmin, ", admin: ", item.admin);
        if ((isAdmin || item.admin) && item.login != userData.userReducer.user?.login)
            return (
                <div className="inItemFriendList_right">
                    <button onClick={() => demute(item)} className="bi bi-mic-fill"></button>
                    <button onClick={() => removeParticipant(item)} className="bi bi-x-lg"></button>
                </div>
            );
        else
            return (
                <div className="inItemFriendList_right">
                </div>
            );
    };

    const affBanned = async () => {
        setAffBanned(true);
    };

    function RightItem(item: { login: string, id: number, admin: boolean, participantAdmin: boolean, muted: boolean }) {

        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);

        const handleClickOpenOptions = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
        };

        const handleCloseOptions = () => {
            setAnchorEl(null);
        };

        function MenuOptions() {

            function AddOrRemoveAdmin() {
                console.log("admin: ", item.admin)
                if (item.participantAdmin) {
                    return (
                        <MenuItem onClick={() => buttonRemoveAdmin(item)}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            Remove admin
                        </MenuItem>
                    );
                }
                else {
                    return (
                        <MenuItem onClick={() => buttonAddAdmin(item)}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            Add admin
                        </MenuItem>
                    );
                }
            };

            function MutedOrNot() {
                console.log("admin: ", item.admin)
                if (item.participantAdmin) {
                    return (
                        <MenuItem onClick={() => demute({ login: item.login, id: item.id, admin: item.admin })}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            Demute Participant
                        </MenuItem>
                    );
                }
                else {
                    return (
                        <MenuItem onClick={() => handleClickOpenDialogMute(item)}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            Mute Participant
                        </MenuItem>
                    );
                }
            };

            return (
                <Menu
                    disableAutoFocusItem
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    className='setting-participant'
                    // onClose={(e) => { e.stopPropagation(); handleCloseOptions()}}
                    onClick={(e) => { e.stopPropagation(); handleCloseOptions() }}
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
                    <AddOrRemoveAdmin />
                    <Divider />
                    <MutedOrNot />
                    <MenuItem onClick={() => handleClickOpenDialogBan(item)}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Ban Participant
                    </MenuItem>
                    <MenuItem onClick={() => removeParticipant(item)}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Remove Participant
                    </MenuItem>
                </Menu>
            );
        };

        console.log("Rigthitem isAdmin: ", isAdmin, ", admin: ", item.admin);
        if ((isAdmin || item.admin) && item.login != userData.userReducer.user?.login)
            return (
                <div className="inItemFriendList_right">
                    {/* <button onClick={() => removeParticipant(item)} className="bi bi-x-lg"></button> */}
                    <IconButton onClick={(e) => { e.stopPropagation(); console.log('menu'); handleClickOpenOptions(e) }}>
                        <MoreVertIcon />
                    </IconButton>
                    <MenuOptions />
                </div>
            );
        else
            return (
                <div className="inItemFriendList_right">
                </div>
            );
    };

    function RightHeader() {

        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);

        const handleClickOpenOptions = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
        };

        const handleCloseOptions = () => {
            setAnchorEl(null);
        };

        function MenuOptions() {
            return (
                <Menu
                    disableAutoFocusItem
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleCloseOptions}
                    onClick={() => { console.log('menu'); handleCloseOptions }}
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
                    <MenuItem onClick={addInvitationRequest}>
                        <ListItemIcon>
                            <SendIcon fontSize="small" />
                        </ListItemIcon>
                        Send Invitation
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={affBanned}>
                        <ListItemIcon>
                            <PersonOffIcon fontSize="small" />
                        </ListItemIcon>
                        Aff Ban
                    </MenuItem>
                </Menu>
            );
        };

        if (isAdmin)
            return (
                <div className="mainHeaderRight mainHeaderSide">
                    {/* <button onClick={handleClickMuteRoomParticipant}><i className="bi bi-person-x-fill"></i></button>
                    <button onClick={affBanned}><i className="bi bi-person-x-fill"></i></button>
                    <button onClick={handleClickAddAdmin}><i className="bi bi-diagram-2-fill"></i></button>
                    <button onClick={addInvitationRequest} className="bi bi-plus-lg"></button> */}
                    <IconButton onClick={handleClickOpenOptions}>
                        <MoreVertIcon />
                    </IconButton>
                    <MenuOptions />
                </div>
            );
        else
            return (
                <div className="mainHeaderRight mainHeaderSide">

                </div>
            );
    };

    utilsData.socket.on('getAllParticipantsReturn', function (data: { id: number, login: string, nickname: string, profile_pic: string, admin: boolean, mute: boolean }[]) {
        console.log('getAllParticipantsReturn = ', data);
        const oldLength = itemListHistory.length;
        getListItem(data);
        utilsData.socket.off('getAllParticipantsReturn');
        utilsData.socket.removeListener('getAllParticipantsReturn');
    })

    const getListItem = async (data: any) => {
        const admin = await checkIfAdmin();
        console.log("get affParticipantsRooms");
        let itemList: any[] = []
        console.log('data = ', data);
        let i = 0;
        data.forEach((item: { id: number, login: string, nickname: string, profile_pic: string, admin: boolean, mute: boolean }) => {
            console.log("item: ", item);
            if (i == 0) {
                setPp1(item.profile_pic);
                i++;
            }
            else if (i == 1) {
                setPp2(item.profile_pic);
                i++;
            }
            itemList.push(<div key={itemList.length.toString()} className='participant' onClick={(e) => { console.log('aff-participant'); history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + item.login) }}>
                <img src={item.profile_pic}></img>
                {item.mute ? <p>{item.nickname} (Mute)</p> : <p>{item.nickname}</p>}
                <RightItem login={item.login} id={item.id} admin={admin} participantAdmin={item.admin} muted={item.mute} />
            </div>
            )
        })
        setItemListHistory(itemList);
    }

    useEffect(() => {
        console.log("useEffect AffParticipantsRooms");
        utilsData.socket.emit('GET_ALL_PARTICIPANTS', { room_id: props.roomsConversData.id, room_name: props.roomsConversData.name });
    }, [props]);

    function MainAff() {
        if (isAffBanned) {
            return (
                <div className="mainAffGene">
                    <AffParticipantsBanned roomsConversData={props.roomsConversData} setAffParticipantsRooms={props.setAffParticipantsRooms} setConversRooms={props.setConversRooms} closeConvers={props.closeConvers} setRooms={props.setRooms} oldAffRoomConvers={props.oldAffRoomConvers} setChat={props.setChat} setAffBanned={setAffBanned} />
                </div>
            );
        }
        else {
            return (
                <div className="chat">
                    <div className="header">
                        <ArrowBackIosNew onClick={closeAffParticipantsRooms} />
                        <div className="group-profile">
                            {pp2 && pp1 ? <div className='profile-pic-group'>
                                <img src={pp1} />
                                <img src={pp2} />
                            </div> : pp1 ?
                                <img src={pp1} /> : <img src="" />}
                            <div className="group-name">
                                <p>{props.roomsConversData.name}</p>
                            </div>
                        </div>
                        <RightHeader />
                    </div>
                    {banRoomParticipant && <BanRoomParticipant roomsConversData={props.roomsConversData} />}
                    {muteRoomParticipant && <MuteRoomParticipant roomsConversData={props.roomsConversData} />}
                    {addAdmin && <AddAdmin roomsConversData={props.roomsConversData} />}
                    {isCreateInvitation && <CreateInvitationRooms roomsConversData={props.roomsConversData} />}
                    <div className="participants">
                        {itemListHistory}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="mainAffGene">
            <MainAff />
            <Dialog open={openDialogMute} onClose={handleCloseDialogMute}>
                <DialogTitle>Mute Participant</DialogTitle>
                <DialogContent>
                    <Grid container direction={"column"} spacing={5}>
                        <Grid item>
                            <FormControl className="FormControlDialog" fullWidth>
                                <InputLabel id="">Days</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Hours</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Minutes</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Secondes</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <div className='dialogContainerAlwaysOrNot'>
                                <p>Always</p>
                                <Checkbox
                                    value={alwaysOrNot}
                                    onChange={e => setAlwaysOrNot(!alwaysOrNot)}
                                    id="checkBoxBan"
                                />
                            </div>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogMute}>Cancel</Button>
                    <Button onClick={buttonMuteRoomParticipant}>Enter</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDialogBan} onClose={handleCloseDialogBan}>
                <DialogTitle>Ban Participant</DialogTitle>
                <DialogContent>
                    <Grid container direction={"column"} spacing={5}>
                        <Grid item>
                            <FormControl className="FormControlDialog" fullWidth>
                                <InputLabel id="">Days</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Hours</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Minutes</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth>
                                <InputLabel id="">Secondes</InputLabel>
                                <Select
                                    labelId=""
                                    id=""
                                    className=""
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
                        </Grid>
                        <Grid item>
                            <div className='dialogContainerAlwaysOrNot'>
                                <p>Always</p>
                                <Checkbox
                                    value={alwaysOrNot}
                                    onChange={e => setAlwaysOrNot(!alwaysOrNot)}
                                    id="checkBoxBan"
                                />
                            </div>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogBan}>Cancel</Button>
                    <Button onClick={buttonBanRoomParticipant}>Enter</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};

export default AffParticipantsRooms;
