
import axios from 'axios'
import { useEffect, useState } from 'react'
import { isPropertyAccessOrQualifiedName } from 'typescript'
import './StatPlayer.scss'

import { AiOutlineClose } from 'react-icons/ai'

import unranked from '../../Assets/rank/unranked.png'
import iron_rank_img from '../../Assets/rank/iron_rank.png'
import bronze_rank_img from '../../Assets/rank/bronze_rank.png'
import gold_rank_img from '../../Assets/rank/gold_rank.png'
import diamond_rank_img from '../../Assets/rank/diamond_rank.png'
import master_rank_img from '../../Assets/rank/master_rank.png'

import { RiFileWarningLine } from 'react-icons/ri'
import NavBar from '../Navbar/Navbar'
import { Dictionary } from '@reduxjs/toolkit'
import axiosConfig from '../../Utils/axiosConfig'
import { useSelector } from 'react-redux'
import { RootState } from '../../State'

export function StatPlayer() {
	const [profileUserId, setProfileUserId] = useState(0)
	const [rankImage, setRankImage] = useState("")
	const [userProfilePicture, setUserProfilePicture] = useState("")
	const [profileUser, setProfileUser] = useState<Dictionary<any>>({})
	const [check, setCheck] = useState(false)
	const [profileUserMatchHistory, setProfileUserMatchHistory] = useState(Array<any>);

	const persistantReduceur = useSelector((state: RootState) => state.persistantReducer)
	const nickname = persistantReduceur.userReducer.user?.nickname;
	const login = persistantReduceur.userReducer.user?.login;

	// const login = window.location.href.split('/')[window.location.href.split('/').length - 1];

	var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
		"Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

	var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

	const [verifLogin, setVerifLogin] = useState(false)
	const [verifNick, setVerifNick] = useState(false)

	useEffect(() => {
		if (!profileUserId) {
			if (!verifLogin) {
				setVerifLogin(true);
				axiosConfig.get("http://localhost:5001/user/login/" + login).then((res) => {
					if (res.data == '') return;
					setVerifNick(true)
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

					if (tmp3) {
						setRankImage(iron_rank_img)
						tmp3.textContent = 'Iron | Noobies'
						if (res.data.wins > 5) {
							setRankImage(bronze_rank_img)
							tmp3.textContent = 'Bronze | Trainer'
						}
						else if (res.data.wins > 10) {
							setRankImage(gold_rank_img)
							tmp3.textContent = 'Gold | Not Bad'
						}
						else if (res.data.wins > 20) {
							setRankImage(diamond_rank_img)
							tmp3.textContent = 'Diamond | Wow !!!'
						}
						else if (res.data.wins > 30) {
							setRankImage(master_rank_img)
							tmp3.textContent = 'Master splinter | Our God !!!'
						}
						if (res.data.login == 'ldauga') {
							setRankImage(master_rank_img)
							tmp3.textContent = 'Master splinter | Our God !!!'
						} else if (res.data.login == 'atourret') {
							setRankImage(gold_rank_img)
							tmp3.textContent = 'GroNoob'
						}
					}

					const tmp4 = document.getElementById('statPlayerNumberWinsValue')
					if (tmp4)
						tmp4.textContent = res.data.wins

					const tmp5 = document.getElementById('statPlayerNumberLossesValue')
					if (tmp5)
						tmp5.textContent = res.data.losses

					const tmp6 = document.getElementById('statPlayerWinRateValue')
					if (tmp6)
						tmp6.textContent = Math.floor((res.data.wins / (res.data.wins + res.data.losses)) * 100).toString() + '%'

				})
			}
			else if (!verifNick) {
				setVerifNick(true);
				axiosConfig.get("http://localhost:5001/user/nickname/" + login).then((res) => {
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

					if (tmp3) {
						setRankImage(iron_rank_img)
						tmp3.textContent = 'Iron | Noobies'
						if (res.data.wins > 5) {
							setRankImage(bronze_rank_img)
							tmp3.textContent = 'Bronze | Trainer'
						}
						else if (res.data.wins > 10) {
							setRankImage(gold_rank_img)
							tmp3.textContent = 'Gold | Not Bad'
						}
						else if (res.data.wins > 20) {
							setRankImage(diamond_rank_img)
							tmp3.textContent = 'Diamond | Wow !!!'
						}
						else if (res.data.wins > 30) {
							setRankImage(master_rank_img)
							tmp3.textContent = 'Master splinter | Our God !!!'
						}
						if (res.data.login == 'ldauga') {
							setRankImage(master_rank_img)
							tmp3.textContent = 'Master splinter | Our God !!!'
						} else if (res.data.login == 'atourret') {
							setRankImage(gold_rank_img)
							tmp3.textContent = 'GroNoob'
						}
					}

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
						<div key={matches.length.toString()} className={(item.winner_nickname == profileUser.nickname ? 'game game-win' : 'game game-lose')} >
							<div className='matchPlayers'>
								<div className='player'>
									<div className='Score'>{item.score_u1}</div>
									<div className='PlayerNickname'>{item.nickname_user1}</div>
								</div>
								<div className='player'>
									<div className='Score'>{item.score_u2}</div>
									<div className='PlayerNickname'>{item.nickname_user2}</div>
								</div>
							</div>
							<div className='matchDate'><>{dayNames[new Date(item.date).getDay()] + ' ' + new Date(item.date).getDate() + ' ' + monthNames[new Date(item.date).getMonth()] + ' ' + new Date(item.date).getHours() + ':' + new Date(item.date).getMinutes()}</></div>
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
		<>
		<NavBar />
		<div className='stat-player-content'>
			<div className='profile'>
				<div className='user'>
					<img src={userProfilePicture} />
					<div className='name'>
						<p>{nickname}</p>
						<p>{login}</p>
						<p><div className='status-player'></div> online</p>
					</div>
				</div>
				<div className='buttons'>
					<button>Add Friend</button>
					<button>Invite Game</button>
					<button>Send Message</button>
				</div>
			</div>
		</div>
		</>
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