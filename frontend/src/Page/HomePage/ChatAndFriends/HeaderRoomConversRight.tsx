import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../../State';
import './CSS/RoomsConvers.scss'
import './CSS/Rooms.scss'
import './CSS/Convers.scss'
import '../Homepage.scss'
import React from 'react';
import AffParticipantsRooms from './AffParticipantsRooms';
import axiosConfig from '../../../Utils/axiosConfig';
import { Divider, IconButton, ListItemIcon, Menu, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, SelectChangeEvent, Grid, Switch, TextField, Tooltip } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ArrowBackIosNew, Logout, Person, Settings, Update } from "@mui/icons-material";
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { valideInput } from '../../../Utils/utils';
import { bindActionCreators } from 'redux';
import AffConvers from './AffConvers';
import HeaderRoomConvers from './HeaderRoomConvers';

function HeaderRoomConversRight(props: { closeConvers: Function, roomsConversData: { name: string, id: number } }) {

	const userData = useSelector((state: RootState) => state.persistantReducer);
	const utilsData = useSelector((state: RootState) => state.utils);

	const [isConversRooms, setConversRooms] = useState(true);
	const [isChangeRoomPassword, setChangeRoomPassword] = useState(false);
	const [openDialogChangePassword, setOpenDialogChangePassword] = useState(false);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const [isOwner, setOwner] = useState(false);
	const [isAdmin, setAdmin] = useState(false);

	useEffect(() => {
		console.log('useEffect aff room convers')
		checkIfAdmin();
		checkIfOwner();
	})

	const handleClickOpenOptions = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseOptions = () => {
		setAnchorEl(null);
	};

	const closeConvers = () => {
		//setConversChatNotif({ name: props.roomsConversData.name, userOrRoom: true });
		props.closeConvers();
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

	const handleClickOpenDialogChangePassword = () => {
		setOpenDialogChangePassword(true);
	};

	const checkIfAdmin = async () => {
		let ifAdmin = false;
		await axiosConfig.get('https://10.3.4.5:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
			if (res.data == true) {
				setAdmin(true);
				ifAdmin = true;
			}
		})
		await axiosConfig.get('https://10.3.4.5:5001/participants/checkAdmin/' + userData.userReducer.user?.login + '/' + props.roomsConversData.name).then(async (res) => {
			if (res.data == true) {
				setAdmin(true);
				ifAdmin = true;
			}
		})
	};

	const checkIfOwner = async () => {
		await axiosConfig.get('https://10.3.4.5:5001/rooms/checkIfOwner/' + userData.userReducer.user?.id + '/' + props.roomsConversData.name).then(async (res) => {
			if (res.data == true) {
				setOwner(true);
			}
			else {
				setOwner(false);
			}
		})
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

		const removeRoom = () => {
			const roomToRemove = {
				id: userData.userReducer.user?.id,
				room_name: props.roomsConversData.name
			}
			utilsData.socket.emit('removeRoom', roomToRemove);
			closeConvers();
		}

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

		function ChangePassword() {
			const [password, setPassword] = useState('');

			const [passwordOrNot, setPasswordOrNot] = useState(false);

			const handleCloseDialogChangePassword = () => {
				setPassword("");
				setPasswordOrNot(false);
				setOpenDialogChangePassword(false);
			};

			const updateSettings = async () => {
				if (password.length <= 0) {
					return;
				}
				if (password.length > 10) {
					return;
				}
				if (!valideInput(password, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
					return;
				}
				if (password.length >= 0) {
					const newPassword = {
						login: userData.userReducer.user?.login,
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

	if (isOwner) {
		return (
			<>
				<IconButton onClick={handleClickOpenOptions}>
					<MoreVertIcon />
				</IconButton>
				<MenuOptionsOwner />
				<ChangePassword />
			</>
		);
	}
	else if (isAdmin) {
		return (
			<>
				<IconButton onClick={handleClickOpenOptions}>
					<MoreVertIcon />
				</IconButton>
				<MenuOptionsAdmin />
				<ChangePassword />
			</>
		);
	}

	return (
		<div className="header">
			{/* <IconButton onClick={handleClickOpenOptions}>
				<MoreVertIcon />
			</IconButton>
			<HeaderRoomConversRightOwner setRoomsConversData={props.setRoomsConversData} setRoomsConvers={props.setRoomsConvers} setChat={props.setChat} roomsConversData={props.roomsConversData}/> */}
		</div>
	);
};

export default HeaderRoomConversRight
