import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../../State";
import './CSS/FriendList.scss';
import AddFriend from "./AddFriend";
import BanUser from "../../../Trash/BanUser";
import axiosConfig from "../../../Utils/axiosConfig";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, ListItemIcon, Menu, MenuItem, TextField } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos, Person, Settings } from "@mui/icons-material";
import ChatIcon from '@mui/icons-material/Chat';
import { bindActionCreators } from "redux";
import { delChatNotif } from "../../../State/Action-Creators";
import MapCarousel from "../../Pong/MapCarousel/MapCarousel";
import { gameRoomClass } from "../../Pong/gameRoomClass";
import '../../Pong/PongHome.scss'
import { useSnackbar } from 'notistack';

function FriendListItem(props: { setFriendList: Function, setConvers: Function, setConversCorrespondantData: Function, setOldAff: Function, closeFriendList: Function, item: { status: string, user: { id: number, login: string, nickname: string, profile_pic: string } }, setUpdate: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const { enqueueSnackbar } = useSnackbar();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const [openDialogInviteGame, setOpenDialogInviteGame] = useState(false);

    const [anchorEl2, setAnchorEl2] = React.useState<null | HTMLElement>(null);
    const openInviteGame = Boolean(anchorEl2);

    const [activeStep, setActiveStep] = useState(0);
    const [inviteGameMap, setInviteGameMap] = useState('map1');

    const handleNext = () => {
        if (inviteGameMap == 'map1')
            setInviteGameMap('map2')
        else if (inviteGameMap == 'map2')
            setInviteGameMap('map3')
        else if (inviteGameMap == 'map3')
            setInviteGameMap('map1')

        setActiveStep((prevActiveStep) => (prevActiveStep + 1) % 3);
    };

    const handleBack = () => {
        if (inviteGameMap == 'map1')
            setInviteGameMap('map3')
        else if (inviteGameMap == 'map3')
            setInviteGameMap('map2')
        else if (inviteGameMap == 'map2')
            setInviteGameMap('map1')

        setActiveStep((prevActiveStep) => (prevActiveStep + (3 - 1)) % 3);
    };

    const open = Boolean(anchorEl);

    const dispatch = useDispatch();

    const { delChatNotif, setConversChatNotif, setInviteCheck } = bindActionCreators(actionCreators, dispatch);

    // <button onClick={() => { utilsData.socket.emit('SPECTATE_CLIENT', { user: userData.userReducer.user, specID: friendLogin }) }} className="bi bi-eye"></button>
    // <button onClick={() => openChat(item)} className="bi bi-chat"></button>
    // <button onClick={() => removeFriend(item)} className="bi bi-x-lg"></button>

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseOptions = () => {
        setAnchorEl(null);
    };

    const removeFriend = () => {
        utilsData.socket.emit('removeFriend', { id_user1: userData.userReducer.user?.id, id_user2: props.item.user.id, login_user1: userData.userReducer.user?.login, login_user2: props.item.user.login });
        enqueueSnackbar('Friend was removed', { variant: "success", autoHideDuration: 2000 })
        props.setUpdate(true);
    };

    async function buttonBanUser() {
        let test = false;
        await axiosConfig.get('https://localhost:5001/user/login/' + props.item.user.login).then(async (res) => {
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
                await axiosConfig.get('https://localhost:5001/blackList/checkUserBan/' + res.data.login + '/' + userData.userReducer.user?.login).then(async (res) => {
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
                        userOrRoom: false,
                        receiver_login: "",
                        room_id: 0,
                        room_name: "",
                        cause: "",
                        date: 0,
                        alwaysOrNot: true,
                        timer: 0
                    }
                    utilsData.socket.emit('createBan', newBan);
                    enqueueSnackbar('User banned', { variant: "success", autoHideDuration: 2000 })
                }
            }
        });
    }

    const openChat = async () => {
        //setConversChatNotif({ name: props.item.user.login, userOrRoom: false });
        props.setConversCorrespondantData({ id: props.item.user.id, login: props.item.user.login, nickname: props.item.user.nickname, profile_pic: props.item.user.profile_pic });
        delChatNotif({ name: props.item.user.login, userOrRoom: false });
        props.setFriendList(false);
        props.setConvers(true);
    };

    function FriendOptions(): JSX.Element {
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
                {props.item.status == 'in-game' ?
                    <MenuItem
                        onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Spectate/' + props.item.user.login) }}>
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        Spectate Friend
                    </MenuItem> :
                    <MenuItem
                        // aria-controls={openInviteGame ? 'menu-invite-game' : undefined}
                        // aria-haspopup="true"
                        // aria-expanded={openInviteGame ? 'true' : undefined}
                        onClick={() => { setOpenDialogInviteGame(true) }}
                        disabled={!(props.item.status == 'online')}>
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        Invite Game
                    </MenuItem>}
                <MenuItem onClick={removeFriend}>
                    <ListItemIcon>
                        <Person fontSize="small" />
                    </ListItemIcon>
                    Remove Friend
                </MenuItem>
                <MenuItem key='Ban Frien' onClick={buttonBanUser}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Ban Friend
                </MenuItem>
            </Menu>
        );
    };

    useEffect(() => {
        // if (props.item.id_user1 == userData.userReducer.user?.id)
        //     setFriendLogin(props.item.login_user2);
        // else
        //     setFriendLogin(props.item.login_user1);
        // setProfilePic(`https://cdn.intra.42.fr/users/${props.item.login}.jpg`);
    }, [props]);

    const inviteGame = async () => {
        setOpenDialogInviteGame(false);
        setInviteCheck(true)
        utilsData.socket.emit('INVITE_CUSTOM', { user: userData.userReducer.user, userLoginToSend: props.item.user.login, gameRoom: new gameRoomClass('', '', null, inviteGameMap) });
        enqueueSnackbar('Invit sent', { variant: "success", autoHideDuration: 2000 })
    };

    return (
        <div className="inItemFriendList">
            <div className="inItemFriendList_left">
                <div className="friend-profile" onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + props.item.user.login) }}>
                    <div className="picture-status">
                        <div className="status" style={{ backgroundColor: props.item.status == 'online' ? 'rgb(28, 177, 123)' : props.item.status == 'in-game' ? 'orange' : 'rgb(203, 90, 98)' }}></div>
                        <img src={props.item.user.profile_pic} />
                    </div>
                    <p>{props.item.user.nickname}</p>
                </div>
            </div>
            <div className="inItemFriendList_right">
                <button onClick={openChat}>
                    <ChatIcon />
                </button>
                <button onClick={handleClick}>
                    <MoreVertIcon />
                </button>
                <FriendOptions />
            </div>
            <Dialog open={openDialogInviteGame} onClose={() => { setOpenDialogInviteGame(false) }}>
                <div className="invite-pong">
                    <DialogContent>
                        <div className='select-map'>
                            <button onClick={handleBack}><ArrowBackIosNew /></button>
                            <MapCarousel activeStep={activeStep} />
                            <button onClick={handleNext}> <ArrowForwardIos /> </button>
                        </div>
                    </DialogContent>
                </div>
                <DialogActions>
                    <button className='join-queue' type='button' onClick={() => { setOpenDialogInviteGame(false) }}>Cancel</button>
                    <button className='join-queue' type='button' onClick={inviteGame}>{'Invite ' + props.item.user.nickname}</button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default FriendListItem;
