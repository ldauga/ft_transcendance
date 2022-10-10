import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, TextField } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavBar from '../../Module/Navbar/Navbar';
import { actionCreators, RootState } from '../../State';
import './Settings.scss';

function Settings() {
	const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur)
	const nickname = persistantReduceur.userReducer.user?.nickname;
	const avatar = persistantReduceur.userReducer.user?.profile_pic;
	const [userParameterNewNickname, setUserParameterNewNickname] = useState(persistantReduceur.userReducer.user?.nickname)
    const [userParameter2FACode, setUserParameter2FACode] = useState("");
    const [userParameter2FAQrCode, setUserParameter2FAQrCode] = useState("");
    const [userParameter2FARes, setUserParameter2FARes] = useState(0);
    const dispatch = useDispatch();
	const { setUser, delNotif, delAllNotif, setTwoFactor } = bindActionCreators(actionCreators, dispatch);
    const [userParameterNewProfilePicture, setUserParameterNewProfilePicture] = useState<null | any>(null)

	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		console.log('userParameter: ' + userParameterNewNickname);
		if (userParameterNewNickname != persistantReduceur.userReducer.user?.nickname)
			axios.patch('http://localhost:5001/user/updateNickname', { nickname: userParameterNewNickname }, { withCredentials: true }).then((res) => { setUser(res.data) })

		if (userParameter2FACode) {
			setTwoFactor(true)
			axios.get('http://localhost:5001/auth/2fa/turn-on/' + userParameter2FACode, { withCredentials: true }).then(res => setUserParameter2FARes(res.status)).catch((e) => setUserParameter2FARes(e.response.status));
		}

		if (userParameterNewProfilePicture != null) {

			var formData = new FormData();
			formData.append("photo", userParameterNewProfilePicture);

			var config = {
				method: 'post',
				url: 'http://localhost:5001/user/upload',
				headers: { 
					'Content-Type': 'multipart/form-data',
				},
				data : formData,
				withCredentials: true
				};

				axios(config).then((res) => setUser(res.data))
		}
		setUserParameter2FAQrCode("")
		setUserParameter2FACode("")
		setUserParameter2FARes(0)
		setUserParameterNewProfilePicture(undefined)
		setOpen(false);
	};
	return (
		<>
		<NavBar />
		<div className='settings'>
			<div className="content">
				<div className='nick'>
					<h3>Your nickname :</h3>
					<div className='edit'>
						<p>{nickname}</p>
						<button onClick={handleClickOpen}>Edit</button>
						<Dialog open={open} onClose={handleClose}>
							<DialogTitle>Your new nickname</DialogTitle>
							<DialogContent>
							<TextField
								autoFocus
								margin="dense"
								id="name"
								label="New nickname"
								fullWidth
								variant="standard"
								onChange={e => setUserParameterNewNickname(e.target.value)}
							/>
							</DialogContent>
							<DialogActions>
								<Button onClick={e => {handleClose(); e.currentTarget.parentElement?.parentElement?.classList.toggle('expanded')}}>Edit</Button>
							</DialogActions>
						</Dialog>
					</div>
				</div>
				<Divider/>
				<div className='avatar'>
					<h3>Avatar :</h3>
					<div className='edit'>
						<img src={avatar} alt='avatar'/>
						<button>Edit</button>
					</div>
				</div>
				<Divider/>
				<div className='twoFA'>
					<h3>Set 2FA :</h3>
					<div className='edit'>
						<p>Set a double factor authentication to keep your security</p>
						<button>Edit</button>
					</div>
				</div>
			</div>
		</div>
		</>
	)
}

export default Settings;
