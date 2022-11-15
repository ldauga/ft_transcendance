import { DriveFolderUpload } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, TextField } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PinInput from 'react-pin-input';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavBar from '../../Module/Navbar/Navbar';
import { actionCreators, RootState } from '../../State';
import axiosConfig from '../../Utils/axiosConfig';
import './Settings.scss';

function Settings() {
	const persistantReduceur = useSelector((state: RootState) => state.persistantReducer)
	const nickname = persistantReduceur.userReducer.user?.nickname;
	const avatar = persistantReduceur.userReducer.user?.profile_pic;
	const [userParameterNewNickname, setUserParameterNewNickname] = useState(persistantReduceur.userReducer.user?.nickname)
	const [userParameter2FACode, setUserParameter2FACode] = useState("");
	const [userParameter2FAQrCode, setUserParameter2FAQrCode] = useState("");
	const [userParameter2FARes, setUserParameter2FARes] = useState(0);
	const [fullPinCode, setFullPinCode] = useState(0);
	const dispatch = useDispatch();
	const { setUser, delNotif, delAllNotif, setTwoFactor } = bindActionCreators(actionCreators, dispatch);
	const [userParameterNewProfilePicture, setUserParameterNewProfilePicture] = useState<null | any>(null)

	const [openEditZoneNickname, setOpenEditZoneNickname] = React.useState(false);
	const [openEditZoneProfilePicture, setOpenEditZoneProfilePicture] = React.useState(false);
	const [openEditZone2fa, setOpenEditZone2fa] = React.useState(false);

	const handleClickOpen = (param: any) => {
		param(true);

		if (param == setOpenEditZone2fa) {
			axiosConfig.get('https://localhost:5001/auth/2fa/generate/').then(res => (setUserParameter2FAQrCode(res.data)))
		}
	};

	const handleClose = (param: any) => {
		if (userParameterNewNickname != persistantReduceur.userReducer.user?.nickname)
			axiosConfig.post('https://localhost:5001/user/updateNickname', { nickname: userParameterNewNickname }).then((res) => { if (res.data) setUser(res.data) })

		if (userParameterNewProfilePicture != null) {

			var formData = new FormData();
			formData.append("photo", userParameterNewProfilePicture);

			var config = {
				method: 'post',
				url: 'https://localhost:5001/user/upload',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				data: formData,
				withCredentials: true
			};

			axios(config).then((res) => setUser(res.data))
		}
		setUserParameter2FAQrCode("")
		setUserParameter2FACode("")
		setUserParameter2FARes(0)
		setUserParameterNewProfilePicture(undefined)

		param(false);
	};

	const sendGetRequest = (value: string) => {
		axiosConfig.get('https://localhost:5001/auth/2fa/turn-on/' + value)
			.then(res => {
				setTwoFactor(true);
				setUserParameter2FACode('');
				setUser(res.data);
				setUserParameter2FARes(res.status);
			})
			.catch(err => {
				setUserParameter2FARes(err.response.status);
			});
	}

	useEffect(() => {
		const wrongCode = document.querySelector<HTMLElement>('.wrong-code')!;
		if (fullPinCode && userParameter2FARes === 401) {
			if (wrongCode)
				wrongCode.style.display = 'block';
		} else {
			if (wrongCode)
				wrongCode.style.display = 'none';
		}
	}, [userParameter2FARes]);

	return (
		<>
			<NavBar openFriendConversFromProfile={false} dataFriendConversFromProfile={{ id: 0, login: "", nickname: "", profile_pic: "" }} setOpenFriendConversFromProfile={() => { }} />
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
										onChange={e => { if (e.target.value.length < 30) setUserParameterNewNickname(e.target.value) }}
									/>
								</DialogContent>
								<DialogActions>
									<Button onClick={e => { if (userParameterNewNickname!.length >= 3 && userParameterNewNickname!.length <= 30) handleClose(setOpenEditZoneNickname); }}>Edit</Button>
								</DialogActions>
							</Dialog>
						</div>
					</div>
					<Divider />
					<div className='avatar'>
						<h3>Avatar :</h3>
						<div className='edit'>
							<img src={avatar} alt='avatar' />
							<button onClick={() => { handleClickOpen(setOpenEditZoneProfilePicture) }}>Edit</button>
							<Dialog open={openEditZoneProfilePicture} onClose={() => { setOpenEditZoneProfilePicture(false) }}>
								{
									userParameterNewProfilePicture == null || userParameterNewProfilePicture == undefined ?
										(<>
											<DialogTitle>Select an image</DialogTitle>
											<DialogContent>
												<label htmlFor="file-upload" className="custom-file-upload">
													<DriveFolderUpload /> Change Image
												</label>
												<input id='file-upload' type="file" accept=".jpeg,.jpg,.png" onChange={e => { setUserParameterNewProfilePicture(e.target.files?.item(0)) }} />
											</DialogContent>
										</>) :
										(<>
											<DialogTitle>Your new Profile Picture</DialogTitle>
											<DialogContent>
												<img className='new-pofile-picture' src={URL.createObjectURL(userParameterNewProfilePicture as File)} />
											</DialogContent>
											<DialogActions>
												<Button onClick={e => { setUserParameterNewProfilePicture(undefined) }}>Change image</Button>
												<Button onClick={e => { handleClose(setOpenEditZoneProfilePicture) }}>Save</Button>
											</DialogActions>
										</>)
								}
							</Dialog>
						</div>
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
										<DialogContent className='two-fa'>
											<img src={userParameter2FAQrCode} />
											<PinInput
												length={6}
												focus
												onChange={(value, index) => { setUserParameter2FACode(value); setUserParameter2FARes(0); setFullPinCode(0) }}
												type="numeric"
												inputFocusStyle={{ borderColor: '#f55951' }}
												inputMode="number"
												style={{ padding: '10px' }}
												onComplete={(value, index) => { sendGetRequest(value); setFullPinCode(1); setUserParameter2FACode('') }}
												autoSelect={true}
											/>
											<p className='wrong-code' style={{ display: 'none' }}>Wrong Code</p>
										</DialogContent>
									</Dialog>
								</div></> :
							<><h3>Desactivate 2FA :</h3>
								<div className='edit'>
									<p>Your two factor connection is already activated</p>
									<button onClick={() => { axiosConfig.get('https://localhost:5001/auth/2fa/turn-off/').then(res => { setUser(res.data) }) }}>Desactivate</button>
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
