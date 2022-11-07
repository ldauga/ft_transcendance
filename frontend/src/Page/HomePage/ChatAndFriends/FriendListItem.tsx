import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../../State";
import './CSS/FriendList.scss';
import AddFriend from "./AddFriend";
import BanUser from "./BanUser";
import axiosConfig from "../../../Utils/axiosConfig";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Divider, IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { Person, Settings } from "@mui/icons-material";
import ChatIcon from '@mui/icons-material/Chat';
import { bindActionCreators } from "redux";
import { delChatNotif } from "../../../State/Action-Creators";

function FriendListItem(props: { setFriendList: Function, setConvers: Function, setConversCorrespondantData: Function, setOldAff: Function, closeFriendList: Function, item: { status: string, user: { id: number, login: string, nickname: string, profile_pic: string } }, setUpdate: Function }) {

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.persistantReducer);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const dispatch = useDispatch();

    const { delChatNotif, setConversChatNotif } = bindActionCreators(actionCreators, dispatch);

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
        props.setUpdate(true);
    };

    const openChat = async () => {
        //setConversChatNotif({ name: props.item.user.login, userOrRoom: false });
        props.setConversCorrespondantData({ id: props.item.user.id, login: props.item.user.login });
        delChatNotif({ name: props.item.user.login, userOrRoom: false });
        props.setFriendList(false);
        props.setConvers(true);
    };

    function FriendOptions() {
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
                    <>
                        <MenuItem onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Spectate/' + props.item.user.login) }}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            Spectate Friend
                        </MenuItem>
                        <Divider />
                    </> :
                    <></>}
                <MenuItem onClick={removeFriend}>
                    <ListItemIcon>
                        <Person fontSize="small" />
                    </ListItemIcon>
                    Remove Friend
                </MenuItem>
                <MenuItem onClick={() => { }}>
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

    function AffStatus() {
        return (
            <div className="itemFriendListStatus">
                <div className="itemFriendListStatusPoint" style={{ backgroundColor: props.item.status == 'online' ? 'green' : props.item.status == 'in-game' ? 'orange' : 'darkred' }} ></div>
                <p>{props.item.status}</p>
            </div>
        );
    };

    return (
        <div className="inItemFriendList">
            <div className="inItemFriendList_left">
                <div className="friend-profile" onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + props.item.user.login) }}>
                    <img src={props.item.user.profile_pic} />
                    <p>{props.item.user.nickname}</p>
                </div>
                <AffStatus />
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
        </div>
    )
}

export default FriendListItem;
