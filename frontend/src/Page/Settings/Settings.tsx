import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, TextField } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavBar from '../../Module/Navbar/Navbar';
import { actionCreators, RootState } from '../../State';
import './Settings.scss';

function Settings() {
	const persistantReduceur = useSelector((state: RootState) => state.persistantReducer)
	const nickname = persistantReduceur.userReducer.user?.nickname;
	const avatar = persistantReduceur.userReducer.user?.profile_pic;
	const [userParameterNewNickname, setUserParameterNewNickname] = useState(persistantReduceur.userReducer.user?.nickname)
	const [userParameter2FACode, setUserParameter2FACode] = useState("");
	const [userParameter2FAQrCode, setUserParameter2FAQrCode] = useState("");
	const [userParameter2FARes, setUserParameter2FARes] = useState(0);
	const dispatch = useDispatch();
	const { setUser, delNotif, delAllNotif, setTwoFactor } = bindActionCreators(actionCreators, dispatch);
	const [userParameterNewProfilePicture, setUserParameterNewProfilePicture] = useState<null | any>(null)

	const [openEditZoneNickname, setOpenEditZoneNickname] = React.useState(false);
	const [openEditZoneProfilePicture, setOpenEditZoneProfilePicture] = React.useState(false);
	const [openEditZone2fa, setOpenEditZone2fa] = React.useState(false);

	const handleClickOpen = (param: any) => {
		param(true);

		if (param == setOpenEditZone2fa) {
			axios.get('http://localhost:5001/auth/2fa/generate/', { withCredentials: true }).then(res => (setUserParameter2FAQrCode(res.data)))
		}
	};

	const handleClose = (param: any) => {
		console.log('userParameter: ' + userParameterNewNickname);
		if (userParameterNewNickname != persistantReduceur.userReducer.user?.nickname)
			axios.post('http://localhost:5001/user/updateNickname', { nickname: userParameterNewNickname}, { withCredentials: true }).then((res) => { setUser(res.data) })

		if (userParameterNewProfilePicture != null) {

			var formData = new FormData();
			formData.append("photo", userParameterNewProfilePicture);

			var config = {
				method: 'post',
				url: 'http://localhost:5001/user/upload',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				data: formData,
				withCredentials: true
			};

			axios(config).then((res) => setUser(res.data))
		}

		console.log(userParameter2FARes)

		setUserParameter2FAQrCode("")
		setUserParameter2FACode("")
		setUserParameter2FARes(0)
		setUserParameterNewProfilePicture(undefined)

		param(false);
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
							<button onClick={() => { handleClickOpen(setOpenEditZoneNickname) }}>Edit</button>
							<Dialog open={openEditZoneNickname} onClose={() => { handleClose(setOpenEditZoneNickname) }}>
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
										onKeyDown={e => {if (e.key == 'Enter')handleClose(setOpenEditZoneNickname)}}
									/>
								</DialogContent>
								<DialogActions>
									<Button onClick={e => { handleClose(setOpenEditZoneNickname) }}>Edit</Button>
								</DialogActions>
							</Dialog>
						</div>
					</div>
					<Divider />
					<div className='avatar'>
						<h3>Avatar :</h3>
						<img src={avatar} alt='avatar' />
						<button onClick={() => { handleClickOpen(setOpenEditZoneProfilePicture) }}>Edit</button>
						<Dialog open={openEditZoneProfilePicture} onClose={() => { setOpenEditZoneProfilePicture(false) }}>
							{
								userParameterNewProfilePicture == null || userParameterNewProfilePicture == undefined ?
									(<>
										<DialogTitle>Select an image</DialogTitle>
										<DialogContent>
											<input type="file" accept=".jpeg,.jpg,.png" onChange={e => { setUserParameterNewProfilePicture(e.target.files?.item(0)) }} />
										</DialogContent>
									</>) :
									(<>
										<DialogTitle>Your new Profile Picture</DialogTitle>
										<DialogContent>
											<img src={URL.createObjectURL(userParameterNewProfilePicture as File)} />
										</DialogContent>
										<DialogActions>
											<Button onClick={e => { setUserParameterNewProfilePicture(undefined) }}>Change image</Button>
											<Button onClick={e => { handleClose(setOpenEditZoneProfilePicture) }}>Save</Button>
										</DialogActions>
									</>)
							}
						</Dialog>
					</div>
					<Divider />
					<div className='twoFA'>
						{!persistantReduceur.userReducer.user?.isTwoFactorAuthenticationEnabled ?
							<><h3>Set 2FA :</h3>
								<div className='edit'>
									<p>Set a double factor authentication to keep your connection secure</p>
									<button onClick={() => { handleClickOpen(setOpenEditZone2fa) }}>Activate</button>
									<Dialog open={openEditZone2fa} onClose={() => { setOpenEditZone2fa(false) }}>
										<DialogTitle>Scan the folowing QR code with Google authenticator</DialogTitle>
										<DialogContent>
											<img src={userParameter2FAQrCode} />
											<input placeholder={!userParameter2FARes ? 'Enter code' : userParameter2FARes == 200 ? 'Your 2FA is activated' : 'Wrong code'} type="text" autoFocus value={userParameter2FACode} onChange={e => { setUserParameter2FACode(e.target.value); setUserParameter2FARes(0) }} />
											<button onClick={() => { axios.get('http://localhost:5001/auth/2fa/turn-on/' + userParameter2FACode, { withCredentials: true }).then(res => { setUserParameter2FARes(res.status); setTwoFactor(true); setUserParameter2FACode(''); setUser(res.data) }).catch((e) => setUserParameter2FARes(e.response.status)); setUserParameter2FACode('') }} >Try code</button>
										</DialogContent>
										<DialogActions>
											<Button onClick={e => { handleClose(setOpenEditZone2fa) }}>Save</Button>
										</DialogActions>
									</Dialog>
								</div></> :
							<><h3>Deactivate 2FA :</h3>
								<div className='edit'>
									<p>Your two factor connection is already activated</p>
									<button onClick={() => { axios.get('http://localhost:5001/auth/2fa/turn-off/', { withCredentials: true }).then(res => {console.log(res); setUser(res.data)}) }}>Deactivate</button>
								</div>
							</>
						}
					</div>
				</div>
			</div>
		</>
	)
}

export default Settings;
