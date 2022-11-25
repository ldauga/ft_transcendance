
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
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem, Snackbar, TextField } from '@mui/material'
import PinInput from 'react-pin-input'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { sassFalse } from 'sass'
import { SnackbarKey, withSnackbar } from 'notistack'
import { useSnackbar } from 'notistack';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material'
import MapCarousel from '../../Page/Pong/MapCarousel/MapCarousel'
import { gameRoomClass } from '../../Page/Pong/gameRoomClass'
import { Navigate } from 'react-router-dom'
import TWOFA from './TwoFA'
import EditNickname from './EditNickname'

function StatPlayer() {
	const persistantReduceur = useSelector((state: RootState) => state.persistantReducer);
	const utilsData = useSelector((state: RootState) => state.utils);
	const userData = useSelector((state: RootState) => state.persistantReducer);

	const [rank, setRank] = useState({
		label: '',
		img: ''
	})

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const [update, setUpdate] = useState(true);
	const [openConversFromProfile, setOpenConversFromProfile] = useState(false);
	const [dataOpenConversFromProfile, setDataOpenConversFromProfile] = useState({ id: 0, login: "", nickname: "", profile_pic: "" });

	const dispatch = useDispatch();
	const { setUser, delNotif, delAllNotif } = bindActionCreators(actionCreators, dispatch);

	const [profileUserMatchHistory, setProfileUserMatchHistory] = useState(Array<any>());
	const [profile, setProfile] = useState({
		id: 0,
		login: window.location.href.split('/')[window.location.href.split('/').length - 1],
		nickname: '',
		wins: '',
		losses: '',
		profile_pic: '',
		loaded: false,
		friendOrInvitation: 0,
		status: ''
	})

	const login = persistantReduceur.userReducer.user?.login;

	utilsData.socket.removeAllListeners('returnCheckIfFriendOrInvit');

	utilsData.socket.off('changeNicknameError')

	utilsData.socket.on('changeNicknameError', function (error: string) {
		switch (error) {
			case 'too-short':
				enqueueSnackbar('The new nickname must be between 3 and 8 characters.', { variant: "warning", autoHideDuration: 2000 })
				break;
			case 'already-used':
				enqueueSnackbar('Nickname already taken.', { variant: "warning", autoHideDuration: 2000 })
				break;
			case 'special-char':
				enqueueSnackbar("Your nickname can only have alpha-numeric characters or \'_\'.", { variant: "warning", autoHideDuration: 2000 })
				break;
			case 'identical-nickname':
				enqueueSnackbar('Cannot use the same nickname.', { variant: "warning", autoHideDuration: 2000 })
				break;
			case 'same-as-login':
				enqueueSnackbar('Cannot use someone\'s login as your nickname.', { variant: "warning", autoHideDuration: 2000 })
				break;
		}
	})

	utilsData.socket.removeAllListeners('userBanned');

	utilsData.socket.on('userBanned', function (userBanned: boolean) {
		setUpdate(true);
		utilsData.socket.off('userBanned');
		utilsData.socket.removeListener('userBanned');
	})

	utilsData.socket.removeAllListeners('debanedUser');

	utilsData.socket.on('debanedUser', function (debanedUser: boolean) {
		setUpdate(true);
		utilsData.socket.off('debanedUser');
		utilsData.socket.removeListener('debanedUser');
	});

	utilsData.socket.on('returnCheckIfFriendOrInvit', function (returnCheckIfFriendOrInvit: number) {
		if (profile.friendOrInvitation != returnCheckIfFriendOrInvit)
			setProfile({ ...profile, friendOrInvitation: returnCheckIfFriendOrInvit })
		utilsData.socket.off('returnCheckIfFriendOrInvit');
		utilsData.socket.removeListener('returnCheckIfFriendOrInvit');
	})

	utilsData.socket.removeAllListeners('newFriendReceived');

	utilsData.socket.on('newFriendReceived', function (newFriendReceived: any) {
		setUpdate(true);
		utilsData.socket.off('newFriendReceived');
		utilsData.socket.removeListener('newFriendReceived');
	})

	utilsData.socket.removeAllListeners('returnRemoveFriend');

	utilsData.socket.on('returnRemoveFriend', function (returnRemoveFriend: any) {
		setUpdate(true);
		utilsData.socket.off('returnRemoveFriend');
		utilsData.socket.removeListener('returnRemoveFriend');
	})

	const fetchUser = async () => {
		if (profile.login) {
			const res = await axiosConfig.get('https://localhost:5001/user/login/' + profile.login)
			if (res.data && res.data !== '') {
				setProfile({
					...profile,
					id: res.data.id,
					login: res.data.login,
					nickname: res.data.nickname,
					wins: res.data.wins,
					losses: res.data.losses,
					profile_pic: res.data.profile_pic,
					loaded: true,
					friendOrInvitation: 0
				})
				if (res.data.wins == 0 && res.data.losses == 0) {
					setRank({ label: 'unranked', img: unranked })
				}
				else if (res.data.wins < 5) {
					setRank({ label: 'bronze', img: bronze_rank_img })
				}
				else if (res.data.wins < 10) {
					setRank({ label: 'silver', img: silver_rank_img })
				}
				else if (res.data.wins < 20) {
					setRank({ label: 'gold', img: gold_rank_img })
				}
				else if (res.data.wins < 50) {
					setRank({ label: 'platinium', img: platinium_rank_img })
				} else {
					setRank({ label: 'diamond', img: diamond_rank_img })
				}
				utilsData.socket.emit('GET_CLIENT_STATUS', { user: res.data })
			} else
				window.location.replace('https://localhost:3000/NotFound')
		} else
			window.location.replace('https://localhost:3000/NotFound')
	}

	const fetchMatchHistory = async () => {
		await axiosConfig.get('https://localhost:5001/matchesHistory/parsedMatchesHistory/' + profile.id)
			.then((res) => {
				let matches: any[] = []
				res.data.forEach((item: { nickname_user1: string, login_user1: string, score_u1: number, nickname_user2: string, login_user2: string, score_u2: number, winner_nickname: string, date: Date }) => {
					matches.push(
						<div key={matches.length.toString()} className={(item.winner_nickname == profile.nickname ? 'win' : 'defeat')} >
							<div className="card">
								<h3>{item.winner_nickname == profile.nickname ? 'Victory' : 'Defeat'}</h3>
								<div className='opponent'>
									<span onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + item.login_user1) }}>
										{item.nickname_user1}
									</span>
									<span className='score'>{item.score_u1.toString() + '-' + item.score_u2.toString()}</span>
									<span onClick={() => { history.pushState({}, '', window.URL.toString()); window.location.replace('https://localhost:3000/Profile/' + item.login_user2) }}>
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

	utilsData.socket.off('getClientStatus')

	utilsData.socket.on('getClientStatus', (info: { user: string, status: string, emitFrom: string }) => {
		if (info.user == profile.login)
			setProfile({ ...profile, status: info.status })
	})

	utilsData.socket.removeListener('friendConnection');

    utilsData.socket.on('friendConnection', function (data: any) {
		setProfile({ ...profile, status: "online" })
        utilsData.socket.off('friendConnection');
        utilsData.socket.removeListener('friendConnection');
    })

    utilsData.socket.removeListener('friendDeconnection');

    utilsData.socket.on('friendDeconnection', function (data: any) {
		setProfile({ ...profile, status: "offline" })
        utilsData.socket.off('friendDeconnection');
        utilsData.socket.removeListener('friendDeconnection');
    })

	useEffect(() => {
		if (profile.id) {
			utilsData.socket.emit('CHECK_IF_FRIEND_OR_INVIT', { id1: userData.userReducer.user?.id, id2: profile.id });
		}
		setUpdate(false);
		if (!profile.loaded) {
			fetchUser();
		}
		if (profile.loaded)
			fetchMatchHistory();
	}, [profile, update])

	const editAvatar = (e: any) => {
		const img = e.target.files.item(0);
		var formData = new FormData();
		formData.append("photo", img);

		var config = {
			method: 'post',
			url: 'https://localhost:5001/user/upload',
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			data: formData,
			withCredentials: true
		};

		axios(config).then((res) => {
			setUser(res.data);
			setProfile({ ...profile, profile_pic: res.data.profile_pic });
			enqueueSnackbar('Your profile picture has been updated !', { variant: 'success', autoHideDuration: 2000 })
		}).catch((err) => {
			if (err.response.status == 413)
				enqueueSnackbar('File size too big', { variant: 'warning', autoHideDuration: 2000 })
			else if (err.response.status == 400)
				enqueueSnackbar('Unable to update your avatar', { variant: 'warning', autoHideDuration: 2000 })
			else
				enqueueSnackbar(err.response?.data.error, { variant: 'warning', autoHideDuration: 2000 })
		})
	}

	async function buttonAddFriend() {
		let test = false;
		await axiosConfig.get('https://localhost:5001/user/login/' + profile.login).then(async (res) => {
			let receiver_login_tmp: string = res.data.login;
			if (res.data == "") {
				return;
			}
			else {
				let a = 1;
				let b = 1;
				let c = 1;
				await axiosConfig.get('https://localhost:5001/invitationRequest/' + persistantReduceur.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
					if (res.data == true) {
						enqueueSnackbar('Invitation already exist', { variant: "warning", autoHideDuration: 2000 })
					}
					else {
						a = 2;
					}
				})
				await axiosConfig.get('https://localhost:5001/friendList/' + persistantReduceur.userReducer.user?.id + '/' + res.data.id).then(async (res) => {
					if (res.data == true) {
						enqueueSnackbar('Relation already exist', { variant: "warning", autoHideDuration: 2000 })
					}
					else {
						b = 2;
					}
				})
				await axiosConfig.get('https://localhost:5001/blackList/checkUserBan/' + persistantReduceur.userReducer.user?.login + '/' + profile.login).then(async (res) => {
					if (res.data == true) {
						enqueueSnackbar('Your relation is blocked', { variant: "warning", autoHideDuration: 2000 })
					}
					else {
						c = 2;
					}
				})
				if (a == 2 && b == 2 && c == 2) {
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
					utilsData.socket.emit('createInvitationRequest', newInvitationRequest);
				}
				return;
			}
		});
	}

	utilsData.socket.removeAllListeners('refreshUser');

	utilsData.socket.on('refreshUser', function (data: boolean) {
		setUpdate(true);
		utilsData.socket.off('refreshUser');
		utilsData.socket.removeListener('refreshUser');
	})

	const removeFriend = () => {
		utilsData.socket.emit('removeFriend', { id_user1: userData.userReducer.user?.id, id_user2: profile.id, login_user1: userData.userReducer.user?.login, login_user2: profile.login });
		setUpdate(true);
	};

	const sendMsg = () => {
		setDataOpenConversFromProfile({ id: profile.id, login: profile.login, nickname: profile.nickname, profile_pic: profile.profile_pic });
		setOpenConversFromProfile(true);
	};

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

	utilsData.socket.off('changeNicknameSuccess')

    utilsData.socket.on('changeNicknameSuccess', function (param: any) {
        fetchMatchHistory()
    })

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const openInviteGame = Boolean(anchorEl);

	function profile_btn() {
		if (login != profile.login) {
			return (
				<div className='buttons'>
					{profile.friendOrInvitation == 1 ?
						<>
							<button onClick={removeFriend}>Remove Friend</button>
						</> :
						<>
							<button disabled={profile.friendOrInvitation == 2 || profile.friendOrInvitation == 3} onClick={buttonAddFriend}>Add Friend</button>
						</>}

					{profile.status == 'online' ?
						<>
							<button id="basic-button"
								aria-controls={openInviteGame ? 'menu-invite-game' : undefined}
								aria-haspopup="true"
								aria-expanded={openInviteGame ? 'true' : undefined}
								onClick={e => setAnchorEl(e.currentTarget)}
							>
								Invite Game
							</button>
							<Dialog open={openInviteGame} onClose={() => { setAnchorEl(null) }}>
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
									<button className='join-queue' type='button' onClick={() => { setAnchorEl(null) }}>Cancel</button>
									<button className='join-queue' type='button' onClick={() => { utilsData.socket.emit('INVITE_CUSTOM', { user: persistantReduceur.userReducer.user, userLoginToSend: profile.login, gameRoom: new gameRoomClass('', '', null, inviteGameMap), fromProfile: true, map: inviteGameMap }); setAnchorEl(null); enqueueSnackbar(`Game invitation sent to ${profile.login}.`, { variant: 'success', autoHideDuration: 2000 }) }}>{'Invite ' + profile.nickname}</button>
								</DialogActions>
							</Dialog>
						</> : <></>}
					<button disabled={profile.friendOrInvitation == 3} onClick={sendMsg}>Send Message</button>
				</div>
			);
		} else {
			return (
				<div className='buttons'>
					<EditNickname profile={profile} setProfile={setProfile} />
					<label htmlFor="file-upload">
						Edit Avatar
					</label>
					<input id='file-upload' type='file' accept='.jpeg, .jpg, .png' onChange={editAvatar} />
					<TWOFA />
				</div>
			)
		}
	}

	const [alertArray] = useState(Array<{ text: string, open: boolean }>())

	return (
		<>
		{ (profile.loaded) ?
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
								<p><span className='status-player' style={{ backgroundColor: profile.status == 'online' ? 'rgb(28, 177, 123)' : profile.status == 'in-game' ? 'orange' : 'rgb(203, 90, 98)' }} ></span> {profile.status}</p>
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
								<p>Losses: {profile.losses}</p>
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
			</> : <></>

}
</>
	)
}

export default withSnackbar(StatPlayer)
