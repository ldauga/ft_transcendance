
import axios from 'axios'
import { useEffect, useState } from 'react'
import { isPropertyAccessOrQualifiedName } from 'typescript'
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
import { Dictionary } from '@reduxjs/toolkit'
import axiosConfig from '../../Utils/axiosConfig'
import { useSelector } from 'react-redux'
import { RootState } from '../../State'
import { setUser } from '../../State/Action-Creators'
import { red } from '@mui/material/colors'
import Background from '../Background/Background'

export function StatPlayer() {
	const [profileUserId, setProfileUserId] = useState(0)
	const [rank, setRank] = useState({
		label: '',
		img: ''
	})
	const [userProfilePicture, setUserProfilePicture] = useState("")
	const [profileUser, setProfileUser] = useState<Dictionary<any>>({})
	const [check, setCheck] = useState(false)
	const [profileUserMatchHistory, setProfileUserMatchHistory] = useState(Array<any>);
	const [profile, setProfile] = useState({
		id: '',
		login: window.location.href.split('/')[window.location.href.split('/').length - 1],
		nickname: '',
		wins: '',
		losses: '',
		profile_pic: '',
		loaded: false
	})

	const persistantReduceur = useSelector((state: RootState) => state.persistantReducer)
	const nickname = persistantReduceur.userReducer.user?.nickname;
	// const login = persistantReduceur.userReducer.user?.login;

	var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
		"Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

	var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

	const [verifLogin, setVerifLogin] = useState(false)
	const [verifNick, setVerifNick] = useState(false)

	useEffect(() => {
		if (!profileUserId) {
			if (!verifLogin) {
				setVerifLogin(true);
				axiosConfig.get("http://localhost:5001/user/login/" + profile.login).then((res) => {
					if (res.data == '') return;
					setProfile({
						id: res.data.id,
						login: res.data.login,
						nickname: res.data.nickname,
						wins: res.data.wins,
						losses: res.data.losses,
						profile_pic: res.data.profile_pic,
						loaded: true
					})
					if (res.data.wins == '0' && res.data.losses == '0') {
						setRank({label: 'unranked', img: unranked})
					}
					else if (res.data.wins > 5) {
						setRank({label: 'silver', img: silver_rank_img})
					}
					else if (res.data.wins > 10) {
						setRank({label: 'gold', img: gold_rank_img})
					}
					else if (res.data.wins > 20) {
						setRank({label: 'platinium', img: platinium_rank_img})
					}
					else if (res.data.wins > 30) {
						setRank({label: 'diamond', img: diamond_rank_img})
					} else {
						setRank({label: 'bronze', img: bronze_rank_img})
					}
				})
			}
			else if (!verifNick) {
				setVerifNick(true);
				axiosConfig.get("http://localhost:5001/user/nickname/" + profile.login).then((res) => {
					if (res.data == '') return ;
					setProfileUser(res.data)
					setProfileUserId(res.data.id)
					setUserProfilePicture(res.data.profile_pic)

					const tmp1 = document.getElementById('userLoginText')
					if (tmp1)
						tmp1.textContent = res.data.login

					const tmp2 = document.getElementById('userNicknameText')
					if (tmp2)
						tmp2.textContent = res.data.nickname

					const tmp3 = document.getElementById('statUserRankNameValue')

					const tmp4 = document.getElementById('statPlayerNumberWinsValue')
					if (tmp4)
						tmp4.textContent = res.data.wins

					const tmp5 = document.getElementById('statPlayerNumberLossesValue')
					if (tmp5)
						tmp5.textContent = res.data.losses

					const tmp6 = document.getElementById('statPlayerWinRateValue')
					if (tmp6)
						tmp6.textContent = Math.floor((res.data.wins / (res.data.wins + res.data.losses)) * 100).toString() + '%'

				})}
		}
		else if (!profileUserMatchHistory.length && profileUserId && !check) {

			setCheck(true);
			axiosConfig.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + profileUserId).then((res) => {
				console.log('dos', res.data)

				let matches: any[] = []
				res.data.forEach((item: { nickname_user1: string, score_u1: number, nickname_user2: string, score_u2: number, winner_nickname: string, date: Date }) => {
					matches.push(
						<div key={matches.length.toString()} className={(item.winner_nickname == profile.nickname ? 'win' : 'defeat')} >
							<div className="card">
								<h3>{item.winner_nickname == profile.nickname ? 'Victory' : 'Defeat'}</h3>
								<div className='opponent'>
									<span onClick={() => {history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + item.nickname_user1)}}>
										{item.nickname_user1}
									</span>
									<span className='score'>{item.score_u1.toString() + '-' + item.score_u2.toString()}</span>
									<span onClick={() =>{history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + item.nickname_user2)}}>
										{item.nickname_user2}
									</span>
								</div>
							</div>
						</div>
						
					)
				})
				if (!matches.length)
					matches.push(<div className='noMatchHistory'>
						<div className="iconContainer">
							<RiFileWarningLine />
						</div>
						<div className="textContainer">
							No match history found...
						</div>
					</div>)

				console.log('matches', matches)
				setProfileUserMatchHistory(matches.reverse())

			})
		}
	})

	return (
		profile.loaded ? 
		<>
		<NavBar />
		<Background />
		<div className='stat-player-content'>
			<div className='profile'>
				<div className='user'>
					<img src={profile.profile_pic} />
					<div className='name'>
						<p>{profile.nickname}</p>
						<p>{profile.login}</p>
						<p><div className='status-player'></div> online</p>
					</div>
				</div>
				<div className='buttons'>
					<button>Add Friend</button>
					<button>Invite Game</button>
					<button>Send Message</button>
				</div>
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
		</> : <></>
	)

	// return (
	// 	<>
	// 		<NavBar />
	// 		<div className="statPlayerContent">
	// 			<div className="userIdentity">
	// 				<div className="userPictureNName">
	// 					<div className="userProfilePictureContainer">
	// 						<img src={userProfilePicture} />
	// 					</div>
	// 					<div className="userLogin">
	// 						<div className="userLoginText">Login :</div>
	// 						<div className="userLoginText" id='userLoginText'></div>
	// 					</div>
	// 					<div className="userNickname">
	// 						<div className="userNicknameText">Nickname :</div>
	// 						<div className="userNicknameText" id='userNicknameText'></div>
	// 					</div>
	// 				</div>
	// 				<div className="statUserInfo">
	// 					<div className='statUserRank'>
	// 						<div className='statUserImgContainer'>
	// 							<img src={rankImage} />
	// 						</div>
	// 						<div className='statUserRankName'>
	// 							<div className='statUserRankNameText'>Rank :</div>
	// 							<div className='statUserRankNameTextValue' id='statUserRankNameValue'></div>
	// 						</div>
	// 					</div>
	// 					<div className='statUserInfoContainer'>
	// 						<div className='statUserInfoElement first'>
	// 							<div className='userInfoText'>Number of Wins :</div>
	// 							<div className='userInfoText value' id='statPlayerNumberWinsValue'></div>
	// 						</div>
	// 						<div className='statUserInfoElement second'>
	// 							<div className='userInfoText'>Number of Losses :</div>
	// 							<div className='userInfoText value' id='statPlayerNumberLossesValue'></div>
	// 						</div>
	// 						<div className='statUserInfoElement third'>
	// 							<div className='userInfoText'>Win Rate :</div>
	// 							<div className='userInfoText value' id='statPlayerWinRateValue'></div>
	// 						</div>
	// 					</div>
	// 				</div>
	// 			</div>
	// 			<div className="userProfileMatches">
	// 				{profileUserMatchHistory}
	// 			</div>
	// 		</div>
	// 	</>
	// )

}