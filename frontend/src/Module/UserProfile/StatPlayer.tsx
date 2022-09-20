
import axios from 'axios'
import { useEffect, useState } from 'react'
import { isPropertyAccessOrQualifiedName } from 'typescript'
import './StatPlayer.css'

import iron_rank_img from '../../Page/assets/iron_rank.png'
import bronze_rank_img from '../../Page/assets/bronze_rank.png'
import gold_rank_img from '../../Page/assets/gold_rank.png'
import diamond_rank_img from '../../Page/assets/diamond_rank.png'
import master_rank_img from '../../Page/assets/master_rank.png'

export function StatPlayer(props: { login: string }) {
	const [profileUserId, setProfileUserId] = useState(0)
	const [rankImage, setRankImage] = useState("")
	const [userProfilePicture, setUserProfilePicture] = useState("")
	const [check, setCheck] = useState(false)
	const [profileUserMatchHistory, setProfileUserMatchHistory] = useState(Array<any>)

	var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
		"Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

	var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

	useEffect(() => {
		if (!profileUserId) {
			axios.get("http://localhost:5001/user/login/" + props.login).then((res) => {
				setProfileUserId(res.data.id)
				setUserProfilePicture(res.data.profile_pic)

				setRankImage(iron_rank_img)
				// tmp4.textContent = 'Iron | Noobies'
				if (res.data.wins > 5) {
					setRankImage(bronze_rank_img)
					// tmp4.textContent = 'Bronze | Trainer'
				}
				else if (res.data.wins > 10) {
					setRankImage(gold_rank_img)
					// tmp4.textContent = 'Gold | Not Bad'
				}
				else if (res.data.wins > 20) {
					setRankImage(diamond_rank_img)
					// tmp4.textContent = 'Diamond | Wow !!!'
				}
				else if (res.data.wins > 30) {
					setRankImage(master_rank_img)
					// tmp4.textContent = 'Master splinter | Our God !!!'
				}
				if (res.data.login == 'ldauga') {
					setRankImage(master_rank_img)
					// tmp4.textContent = 'Master splinter | Our God !!!'
				} else if (res.data.login == 'atourret') {
					setRankImage(gold_rank_img)
					// tmp4.textContent = 'GroNoob'
				}
			})
		}
		else if (!profileUserMatchHistory.length && profileUserId && !check) {

			setCheck(true);
			axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + profileUserId).then((res) => {
				console.log('dos', res.data)

				let matches: any[] = []
				res.data.forEach((item: { login_user1: string, score_u1: number, login_user2: string, score_u2: number, winner_login: string, date: Date }) => {
					matches.push(
						<div key={matches.length.toString()} className={(item.winner_login == props.login ? 'game game-win' : 'game game-lose')} >
							<div className='matchPlayers'>
								<div className='player'>
									<div className='Score'>{item.score_u1}</div>
									<div className='PlayerNickname'>{item.login_user1}</div>
								</div>
								<div className='player'>
									<div className='Score'>{item.score_u2}</div>
									<div className='PlayerNickname'>{item.login_user2}</div>
								</div>
							</div>
							<div className='matchDate'><>{dayNames[new Date(item.date).getDay()] + ' ' + new Date(item.date).getDate() + ' ' + monthNames[new Date(item.date).getMonth()] + ' ' + new Date(item.date).getHours() + ':' + new Date(item.date).getMinutes()}</></div>
						</div>
					)
				})
				console.log('matches', matches)
				setProfileUserMatchHistory(matches.reverse())

			})
		}
		console.log(profileUserId)
		console.log(profileUserMatchHistory)
	})

	return (
		<div className="statPlayerContent">
			<div className="userIdentity">
				<div className="userPictureNName">
					<img src={userProfilePicture} />
					<div className="userLogin">
						<div className="userLoginText">Login :</div>
						<div className="userLoginText">cgangaro</div>
					</div>
					<div className="userNickname">
						<div className="userNicknameText">Nickname :</div>
						<div className="userNicknameText">cgangaro</div>
					</div>
				</div>
				<div className="statUserInfo">
					<div className='statUserRank'>
						<div className='statUserImgContainer'>
							<img src={rankImage} />
						</div>
						<div className='statUserRankName'>
							<div className='statUserRankNameText'>Rank :</div>
							<div className='statUserRankNameTextValue' id='statUserRankNameValue'></div>
						</div>
					</div>
					<div className='userInfoContainer'>
						{/* <div className='userInfo first'>
							<div className='userInfoText'>Wins :</div>
							<div className='userInfoText value' id='numberWinsValue'></div>
						</div>
						<div className='userInfo second'>
							<div className='userInfoText'>Losses :</div>
							<div className='userInfoText value' id='numberLossesValue'></div>
						</div>
						<div className='userInfo third'>
							<div className='userInfoText'>Win Rate :</div>
							<div className='userInfoText value' id='winRateValue'></div>
						</div> */}
					</div>
				</div>
			</div>
			<div className="userProfileMatches">
				{profileUserMatchHistory}
			</div>
		</div>
	)

}