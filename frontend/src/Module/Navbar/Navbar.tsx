import { Leaderboard, Logout, Person, Settings, Search, RemoveCircleOutlineSharp } from '@mui/icons-material';
import { Badge, Divider, IconButton, Link, ListItemIcon, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import ChatAndFriendAndNotif from '../../Page/HomePage/ChatAndFriends/ChatAndFriendAndNotif';
import { actionCreators, RootState } from '../../State';
import axiosConfig from '../../Utils/axiosConfig';
import { PopupContainer } from '../PopupContainer/PopupContainer';
import './Navbar.scss';
import { SnackbarKey, withSnackbar } from 'notistack'
import { useSnackbar } from 'notistack';

let tmp = 0
let verif = false
function NavBar(props: { openFriendConversFromProfile: boolean, dataFriendConversFromProfile: { id: number, login: string, nickname: string, profile_pic: string }, setOpenFriendConversFromProfile: Function }) {
	const ref = useRef<any>(null);
	const utilsData = useSelector((state: RootState) => state.utils);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	let location = useLocation();
	const dispatch = useDispatch();
	const { setUser, setAllNotifSeen, delAllNotif, setTwoFactor, setConversChatNotif, addChatNotif, initChatNotif } = bindActionCreators(actionCreators, dispatch);
	const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);
	const [openPopup, setOpenPopUp] = useState(false);
	const [content, setContent] = useState('');
	const [conversNotif, setConversNotif] = useState({ name: "", userOrRoom: false });
	const [searchBarContent, setSearchBarContent] = useState('');

	const [lastNbNotif, setLastNbNotif] = useState(tmp);

	const [isChat, setChat] = useState(false);
	const [isFriendList, setFriendList] = useState(false);
	const [isNotif, setNotif] = useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const logout = () => {
		removeCookie("auth-cookie", { path: '/' });

		setUser(null);

		delAllNotif();
		setTwoFactor(false);
		window.location.replace('https://localhost:3000')
	}

	async function findUserProfile() {
		if (searchBarContent) {
			let res = await axiosConfig.get('https://localhost:5001/user/login/' + searchBarContent);
			if (!res.data.login)
				res = await axiosConfig.get('https://localhost:5001/user/nickname/' + searchBarContent);
			if (!res.data.login)
				enqueueSnackbar('Cannot find user\'s profile.', { variant: "error", autoHideDuration: 2000 })
			else
				window.location.replace('https://localhost:3000/Profile/' + res.data.login);
		}
		return true;
	}

	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
	const nickname = persistantReducer.userReducer.user?.nickname;
	const avatar = persistantReducer.userReducer.user?.profile_pic;

	utilsData.socket.removeAllListeners('ChatNotifsInit');

	utilsData.socket.on('ChatNotifsInit', function (chatNotifsTab: { nb: number, name: string, userOrRoom: boolean }[]) {
		initChatNotif();
		for (let i = 0; i < chatNotifsTab.length; i++) {
			addChatNotif({ name: chatNotifsTab[i].name, userOrRoom: chatNotifsTab[i].userOrRoom, nb: chatNotifsTab[i].nb });
		}
		utilsData.socket.off('ChatNotifsInit');
		utilsData.socket.removeListener('ChatNotifsInit');
	})

	// utilsData.socket.removeAllListeners('newMsgReceived');

	// utilsData.socket.on('newMsgReceived', function (data: any) {
	// 	// if (!(persistantReducer.chatNotifReducer.convers.name == newNotif.name && persistantReducer.chatNotifReducer.convers.userOrRoom == newNotif.userOrRoom))
	// 	if (data.login_sender == persistantReducer.userReducer.user?.login)
	// 		addChatNotif({ name: data.login_sender, userOrRoom: data.userOrRoom, nb: 1 });
	// 	utilsData.socket.off('newMsgReceived');
	// 	utilsData.socket.removeListener('newMsgReceived');
	// })

	utilsData.socket.removeAllListeners('newChatNotif');

	utilsData.socket.on('newChatNotif', function (newNotif: { name: string, userOrRoom: boolean }) {
		// if (!(persistantReducer.chatNotifReducer.convers.name == newNotif.name && persistantReducer.chatNotifReducer.convers.userOrRoom == newNotif.userOrRoom))
		if (!(conversNotif.name == newNotif.name && conversNotif.userOrRoom == newNotif.userOrRoom))
			addChatNotif({ name: newNotif.name, userOrRoom: newNotif.userOrRoom, nb: 1 });
		else
			utilsData.socket.emit('delChatNotifs', { loginOwner: persistantReducer.userReducer.user?.login, name: newNotif.name, userOrRoom: newNotif.userOrRoom });
		utilsData.socket.off('newChatNotif');
		utilsData.socket.removeListener('newChatNotif');
	})

	useEffect(() => {
		console.log('useEffect navbar')
		if (props.openFriendConversFromProfile) {
			if (isChat) {
				closeChat();
				openFriendList();
			}
			else if (isNotif) {
				closeNotif();
				openFriendList();
			}
			else if (isFriendList) {

			}
			else
				openFriendList();
		}
	}, [props]);

	const closeFriendList = () => {
		//setConversChatNotif({ name: "", userOrRoom: false });
		setOpenPopUp(false);
		setFriendList(false);
	}

	const closeChat = () => {
		//setConversChatNotif({ name: "", userOrRoom: false });
		setOpenPopUp(false);
		setChat(false);
	}

	const closeNotif = () => {
		setOpenPopUp(false);
		setNotif(false);
	}

	const openFriendList = () => {
		setOpenPopUp(true);
		setFriendList(true);
	}

	const openChat = () => {
		setOpenPopUp(true);
		setChat(true);
	}

	const openNotif = () => {
		setOpenPopUp(true);
		setNotif(true);
	}

	console.log("navbar");
	return (
		<div className="App">
			<nav>
				<a href='/'>FT_TRANSCENDENCE</a>
				<div className='right'>
					<div className='search-box reactour-search-box'>
						<svg onClick={() => ref.current.focus()} onMouseEnter={() => ref.current.focus()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
							<path d="M8.25 10.875a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z" />
							<path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 102.338 7.524l2.007 2.006a.75.75 0 101.06-1.06l-2.006-2.007a4.125 4.125 0 00-3.399-6.463z" clipRule="evenodd" />
						</svg>
						<input onMouseLeave={() => ref.current.blur()} ref={ref} type="text" maxLength={8} placeholder="Find user..." onChange={e => setSearchBarContent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') findUserProfile() }} />
					</div>
					<button className='reactour-friend-list' onClick={() => { //friendList
						setOpenPopUp(!open);
						if (isChat) {
							setChat(false);
							setFriendList(true);
						}
						else if (isFriendList) {
							setFriendList(false);
							setOpenPopUp(false);
						}
						else if (isNotif) {
							setNotif(false);
							setFriendList(true);
						}
						else
							setFriendList(true);
					}}>
						<Tooltip title="Friends">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
								<path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
								<path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
							</svg>
						</Tooltip>
					</button>
					<button className='reactour-notif' onClick={() => { //notifs
						setLastNbNotif(persistantReducer.notifReducer.notifArray.length)
						setOpenPopUp(!open);
						if (isChat) {
							setChat(false);
							setNotif(true);
						}
						else if (isFriendList) {
							setFriendList(false);
							setNotif(true);
						}
						else if (isNotif) {
							setNotif(false);
							setOpenPopUp(false);
						}
						else
							setNotif(true);
					}}>
						<Badge color="error" badgeContent={(persistantReducer.notifReducer.notifArray.length - lastNbNotif >= 0 ? persistantReducer.notifReducer.notifArray.length - lastNbNotif : 0)}>
							<Tooltip title="Notifications">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
									<path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
								</svg>
							</Tooltip>
						</Badge>
					</button>
					<button className='reactour-chat' onClick={() => { //chat
						setOpenPopUp(!open);
						setAllNotifSeen()
						if (isChat) {
							setOpenPopUp(false);
							setChat(false);
						}
						else if (isFriendList) {
							setFriendList(false);
							setChat(true);
						}
						else if (isNotif) {
							setNotif(false);
							setChat(true);
						}
						else
							setChat(true);
					}}>
						<Badge color="error" badgeContent={persistantReducer.chatNotifReducer.total}>
							<Tooltip title="Chat">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
									<path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
									<path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
								</svg>
							</Tooltip>
						</Badge>
					</button>
					<Tooltip title="Account">
						<div className='profile reactour-profile' onClick={handleClick}>
							<img className='avatar' src={avatar} alt="avatar" />
							<span>{nickname}</span>
						</div>
					</Tooltip>
					<Menu
						disableAutoFocusItem
						anchorEl={anchorEl}
						id="account-menu"
						open={open}
						onClose={handleClose}
						onClick={handleClose}
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
						<MenuItem key='Profile' component={Link} href={`/Profile/${persistantReducer.userReducer.user!.login}`}>
							<ListItemIcon>
								<Person fontSize="small" />
							</ListItemIcon>
							Profile
						</MenuItem>
						<MenuItem key='Leaderboard' component={Link} href="/LeaderBoard">
							<ListItemIcon>
								<Leaderboard fontSize="small" />
							</ListItemIcon>
							Leaderboard
						</MenuItem>
						<Divider />
						<MenuItem key='Logout' onClick={logout}>
							<ListItemIcon>
								<Logout fontSize="small" />
							</ListItemIcon>
							Logout
						</MenuItem>
					</Menu>
				</div>
			</nav>
			<PopupContainer open={openPopup} setClose={() => setOpenPopUp(false)}>
				<ChatAndFriendAndNotif setLastNbNotif={setLastNbNotif} setOpenPopUp={setOpenPopUp} isNotif={isNotif} isNavChat={isChat} isNavFriendList={isFriendList} closeFriendList={closeFriendList} closeChat={closeChat} closeNotif={closeNotif} openFriendList={openFriendList} openChat={openChat} openNotif={openNotif} openFriendConversFromProfile={props.openFriendConversFromProfile} dataFriendConversFromProfile={props.dataFriendConversFromProfile} setOpenFriendConversFromProfile={props.setOpenFriendConversFromProfile} setConversNotif={setConversNotif} />
			</PopupContainer>
		</div>
	);
}

export default NavBar;
