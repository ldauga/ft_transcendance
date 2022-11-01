
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ExitStatus, isPropertyAccessOrQualifiedName } from 'typescript'
import './StatPlayer.scss'

import { AiOutlineClose } from 'react-icons/ai'

import unranked from '../../Assets/rank/unranked.png'
import bronze_rank_img from '../../Assets/rank/bronze_rank.png'
import gold_rank_img from '../../Assets/rank/gold_rank.png'
import diamond_rank_img from '../../Assets/rank/diamond_rank.png'
import silver_rank_img from '../../Assets/rank/silver_rank.png'
import platinium_rank_img from '../../Assets/rank/platinium_rank.png'

import { RiFileWarningLine } from 'react-icons/ri'
import NavBar from '../Navbar/Navbar'
import { bindActionCreators, Dictionary } from '@reduxjs/toolkit'
import axiosConfig from '../../Utils/axiosConfig'
import { useDispatch, useSelector } from 'react-redux'
import { actionCreators, RootState } from '../../State'
import { setUser } from '../../State/Action-Creators'
import { red } from '@mui/material/colors'
import Background from '../Background/Background'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'
import PinInput from 'react-pin-input'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { sassFalse } from 'sass'

export function StatPlayer() {
	const persistantReduceur = useSelector((state: RootState) => state.persistantReducer);
	const utilsData = useSelector((state: RootState) => state.utils);
	const userData = useSelector((state: RootState) => state.persistantReducer);
	const [open, setOpen] = useState(false);
	const [userParameter2FAQrCode, setUserParameter2FAQrCode] = useState("");
	const [openEditZone2fa, setOpenEditZone2fa] = useState(false);
	const [userParameter2FACode, setUserParameter2FACode] = useState("");
	const [userParameter2FARes, setUserParameter2FARes] = useState(0);
	const [fullPinCode, setFullPinCode] = useState(0);
	const [newNickname, setNewNickname] = useState(persistantReduceur.userReducer.user?.nickname);
	const [rank, setRank] = useState({
		label: '',
		img: ''
	})

	const [update, setUpdate] = useState(true);
	const [openConversFromProfile, setOpenConversFromProfile] = useState(false);
	const [dataOpenConversFromProfile, setDataOpenConversFromProfile] = useState({ id: 0, login: "", nickname: "" });

	const dispatch = useDispatch();
	const { setUser, delNotif, delAllNotif, setTwoFactor } = bindActionCreators(actionCreators, dispatch); // del?

	const [profileUserMatchHistory, setProfileUserMatchHistory] = useState(Array<any>);
	const [profile, setProfile] = useState({
		id: 0,
		login: window.location.href.split('/')[window.location.href.split('/').length - 1],
		nickname: '',
		wins: '',
		losses: '',
		profile_pic: '',
		loaded: false,
		friendOrInvitation: 0
	})

	const login = persistantReduceur.userReducer.user?.login;

	const changeNickname = () => {
		console.log('newNickname: ' + newNickname)
		if (newNickname != persistantReduceur.userReducer.user?.nickname) {
			axiosConfig.post('http://localhost:5001/user/updateNickname', { nickname: newNickname }).then((res) => { console.log(res); if (res.data) setUser(res.data) }).catch((err) => { console.log('err', err) })
			if (newNickname) {
				setProfile({ ...profile, nickname: newNickname });
				fetchMatchHistory();
			}
		}
	}

	utilsData.socket.removeAllListeners('returnCheckIfFriendOrInvit');

	utilsData.socket.on('returnCheckIfFriendOrInvit', function (returnCheckIfFriendOrInvit: number) {
		console.log('returnCheckIfFriendOrInvit = ', returnCheckIfFriendOrInvit);
		if (profile.friendOrInvitation != returnCheckIfFriendOrInvit)
			setProfile({ ...profile, friendOrInvitation: returnCheckIfFriendOrInvit })
		utilsData.socket.off('returnCheckIfFriendOrInvit');
		utilsData.socket.removeListener('returnCheckIfFriendOrInvit');
	})

	utilsData.socket.removeAllListeners('newFriendReceived');

	utilsData.socket.on('newFriendReceived', function (newFriendReceived: any) {
		console.log('newFriendReceived = ', newFriendReceived);
		setUpdate(true);
		utilsData.socket.off('newFriendReceived');
		utilsData.socket.removeListener('newFriendReceived');
	})

	const fetchUser = async (url: string) => {
		// const check = await checkIfFriendOrInvit();
		//console.log("check before: ", check);
		await axiosConfig.get(url + profile.login)
			.then(async (res) => {
				await setProfile({
					id: res.data.id,
					login: res.data.login,
					nickname: res.data.nickname,
					wins: res.data.wins,
					losses: res.data.losses,
					profile_pic: res.data.profile_pic,
					loaded: true,
					friendOrInvitation: 0
				})
				if (res.data.wins == '0' && res.data.losses == '0') {
					setRank({ label: 'unranked', img: unranked })
				}
				else if (res.data.wins > 5) {
					setRank({ label: 'silver', img: silver_rank_img })
				}
				else if (res.data.wins > 10) {
					setRank({ label: 'gold', img: gold_rank_img })
				}
				else if (res.data.wins > 20) {
					setRank({ label: 'platinium', img: platinium_rank_img })
				}
				else if (res.data.wins > 30) {
					setRank({ label: 'diamond', img: diamond_rank_img })
				} else {
					setRank({ label: 'bronze', img: bronze_rank_img })
				}
			})
	}

	const fetchMatchHistory = async () => {
		await axiosConfig.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + profile.id)
			.then((res) => {
				let matches: any[] = []
				res.data.forEach((item: { nickname_user1: string, login_user1: string, score_u1: number, nickname_user2: string, login_user2: string, score_u2: number, winner_nickname: string, date: Date }) => {
					matches.push(
						<div key={matches.length.toString()} className={(item.winner_nickname == profile.nickname ? 'win' : 'defeat')} >
							<div className="card">
								<h3>{item.winner_nickname == profile.nickname ? 'Victory' : 'Defeat'}</h3>
								<div className='opponent'>
									<span onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + item.login_user1) }}>
										{item.nickname_user1}
									</span>
									<span className='score'>{item.score_u1.toString() + '-' + item.score_u2.toString()}</span>
									<span onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + item.login_user2) }}>
										{item.nickname_user2}
									</span>
								</div>
							</div>
						</div>
					)
				})
				if (!matches.length)
				matches.push(<div key={'none'} className='no-match'>
					<SentimentVeryDissatisfiedIcon />
					<p>No match found</p>
				</div>)

				setProfileUserMatchHistory(matches.reverse())
			})
	}

	useEffect(() => {
		console.log("useEffect() StatPlayer");
		if (profile.id) {
			console.log("emit CHECK_IF_FRIEND_OR_INVIT with id1: ", userData.userReducer.user?.id, ", id2: ", profile.id);
			utilsData.socket.emit('CHECK_IF_FRIEND_OR_INVIT', { id1: userData.userReducer.user?.id, id2: profile.id });
		}
		setUpdate(false);
		if (!profile.loaded) {
			fetchUser('http://localhost:5001/user/login/')
		}
		if (profile.loaded)
			fetchMatchHistory();
		const wrongCode = document.querySelector<HTMLElement>('.wrong-code')!;
		if (fullPinCode && userParameter2FARes === 401) {
			if (wrongCode)
				wrongCode.style.display = 'block';
		} else {
			if (wrongCode)
				wrongCode.style.display = 'none';
		}
	}, [profile, userParameter2FARes, update])

	const editAvatar = (e: any) => {
		const img = e.target.files.item(0);
		var formData = new FormData();
		formData.append("photo", img);

		var config = {
			method: 'post',
			url: 'http://localhost:5001/user/upload',
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			data: formData,
			withCredentials: true
		};

		axios(config).then((res) => setProfile({ ...profile, profile_pic: res.data.profile_pic }))
	}

	const sendGetRequest = (value: string) => {
		axios.get('http://localhost:5001/auth/2fa/turn-on/' + value, { withCredentials: true })
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

	async function buttonAddFriend() {
		let test = false;
		console.log('addFriend');
		await axiosConfig.get('http://localhost:5001/user/login/' + profile.login).then(async (res) => {
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
				await axiosConfig.get('http://localhost:5001/invitationRequest/' + persistantReduceur.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
					console.log('check invit');
					console.log(res.data);
					console.log(res);
					if (res.data == true) {
						console.log("invitationRequest already exist");
					}
					else {
						a = 2;
						console.log('invitationRequest not exist');
					}
				})
				await axiosConfig.get('http://localhost:5001/friendList/' + persistantReduceur.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
					console.log('check friendList');
					console.log(res.data);
					console.log(res);
					if (res.data == true) {
						console.log("relation already exist");
					}
					else {
						b = 2;
						console.log('relation not exist');
					}
				})
				if (a == 2 && b == 2) {
					console.log('test == true');
					console.log(receiver_login_tmp);
					const newInvitationRequest = {
						id_user1: persistantReduceur.userReducer.user?.id,
						id_user2: res.data.id,
						user1_accept: true,
						user2_accept: false,
						sender_id: persistantReduceur.userReducer.user?.id,
						sender_login: persistantReduceur.userReducer.user?.login,
						receiver_login: receiver_login_tmp,
						userOrRoom: false,
						room_id: 0,
						room_name: ""
					}
					console.log('emit');
					utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
				}
				return;
			}
		});
	}

	utilsData.socket.removeAllListeners('refreshUser');

	utilsData.socket.on('refreshUser', function (data: boolean) {
		console.log('refreshUser = ', data);
		setUpdate(true);
		utilsData.socket.off('refreshUser');
		utilsData.socket.removeListener('refreshUser');
	})

	const removeFriend = () => {
		utilsData.socket.emit('removeFriend', { id_user1: userData.userReducer.user?.id, id_user2: profile.id, login_user1: userData.userReducer.user?.login, login_user2: profile.login });
		setUpdate(true);
	};

	const sendMsg = () => {
		setDataOpenConversFromProfile({ id: profile.id, login: profile.login, nickname: profile.nickname });
		setOpenConversFromProfile(true);
	};

	function profile_btn() {
		if (login != profile.login) {
			if (profile.friendOrInvitation == 1)
				return (
					<div className='buttons'>
						<button onClick={removeFriend}>Remove Friend</button>
						<button>Invite Game</button>
						<button onClick={sendMsg}>Send Message</button>
					</div>
				);
			else
				return (
					<div className='buttons'>
						<button disabled={profile.friendOrInvitation == 2} onClick={buttonAddFriend}>Add Friend</button>
						<button>Invite Game</button>
						<button>Send Message</button>
					</div>
				);
		} else {
			return (
				<div className='buttons'>
					<button onClick={() => { setOpen(true) }}>Edit Nickname</button>
					<Dialog open={open} onClose={() => { setOpen(false) }}>
						<DialogTitle>Your New Nickname</DialogTitle>
						<DialogContent>
							<TextField
								autoFocus
								margin="dense"
								id="name"
								label="New Nickname"
								type="text"
								onChange={e => setNewNickname(e.target.value)}
								fullWidth
								variant="standard"
								onKeyUp={(e) => {
									if (e.key === 'Enter') {
										changeNickname();
										setOpen(false);
									}
								}}
							/>
						</DialogContent>
						<DialogActions>
							<button onClick={() => { changeNickname(); setOpen(false); }}>Edit</button>
						</DialogActions>
					</Dialog>
					<label htmlFor="file-upload">
						Edit Avatar
					</label>
					<input id='file-upload' type='file' accept='.jpeg, .jpg, .png' onChange={editAvatar} />
					{!persistantReduceur.userReducer.user?.isTwoFactorAuthenticationEnabled ?
						<>
							<button onClick={() => { setOpenEditZone2fa(true); axiosConfig.get('http://localhost:5001/auth/2fa/generate/').then(res => (setUserParameter2FAQrCode(res.data))) }}>Set 2FA</button>
							<Dialog open={openEditZone2fa} onClose={() => { setOpenEditZone2fa(false) }}>
								<DialogTitle>Scan the folowing QR code with Google authenticator</DialogTitle>
								<DialogContent className='two-fa'>
									<img src={userParameter2FAQrCode} />
									<PinInput
										length={6}
										focus
										onChange={(value, index) => { setUserParameter2FACode(value); setUserParameter2FARes(0); setFullPinCode(0) }}
										type="numeric"
										inputMode="number"
										style={{ padding: '10px' }}
										onComplete={(value, index) => { sendGetRequest(value); setFullPinCode(1); setUserParameter2FACode('') }}
										autoSelect={true}
									/>
									<p className='wrong-code' style={{ display: 'none' }}>Wrong Code</p>
								</DialogContent>
							</Dialog></> : <button onClick={() => { axiosConfig.get('http://localhost:5001/auth/2fa/turn-off/').then(res => { console.log(res); setUser(res.data) }) }}>Desactivate 2FA</button>}
				</div>
			)
		}
	}

	return (
		<>
			<NavBar openFriendConversFromProfile={openConversFromProfile} dataFriendConversFromProfile={dataOpenConversFromProfile} setOpenFriendConversFromProfile={setOpenConversFromProfile} />
			<Background />
			<div className='stat-player-content'>
				<div className='profile'>
					<div className='user'>
						<img src={profile.profile_pic} />
						<div className='name'>
							<p>{profile.nickname}</p>
							<p>{profile.login}</p>
							<p><span className='status-player'></span> online</p>
						</div>
					</div>
					{profile_btn()}
				</div>
				<div className='stat'>
					<div className="rank">
						<img src={rank.img} />
						<span>{rank.label}</span>
					</div>
					<div className="all-match">
						<p className='match-played'>Match Played: {profile.wins + profile.losses}</p>
						<div className="wins-loses">
							<p>Wins: {profile.wins}</p>
							<p>Loses: {profile.losses}</p>
						</div>
					</div>
				</div>
				<div className="match-history">
					<h1>Match History</h1>
					<div className="cards">
						{profileUserMatchHistory}
					</div>
				</div>
			</div>
		</>
	)
}