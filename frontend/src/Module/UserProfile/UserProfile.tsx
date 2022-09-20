
import axios from 'axios'
import { useEffect, useState } from 'react'
import './UserProfile.css'

export function UserProfile(props: { login: string }) {

	const [profileUserId, setProfileUserId] = useState(0)
	const [check, setCheck] = useState(false)
	const [profileUserMatchHistory, setProfileUserMatchHistory] = useState(Array<any>)

	var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
		"Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

	var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

	useEffect(() => {
		if (!profileUserId) {
			axios.get("http://localhost:5001/user/login/" + props.login).then((res) => {
				console.log('uno', res.data)
				setProfileUserId(res.data.id)
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
		<div className="userProfile">
			<div className="userProfileInfo">
				<div className='userProfilerankInfo'>
					<div className='userProfileImgContainer'>
						<img/>
					</div>
					<div className='userProfileRankName'>
						<div className='userProfileRankNameText'>Rank :</div>
						<div className='userProfileRankNameText' id='userProfileRankNameValue'></div>
					</div>
				</div>
				<div className='userProfileInfoContainer'>
					<div className='userProfileInfoStats first'>
						<div className='userProfileInfoText'>Wins :</div>
						<div className='userProfileInfoText value' id='numberWinsValue'></div>
					</div>
					<div className='userProfileInfoStats second'>
						<div className='userProfileInfoText'>Losses :</div>
						<div className='userProfileInfoText value' id='numberLossesValue'></div>
					</div>
					<div className='userProfileInfoStats third'>
						<div className='userProfileInfoText'>Win Rate :</div>
						<div className='userProfileInfoText value' id='winRateValue'></div>
					</div>
				</div>
			</div>
			<div className="userProfileMatches">
				{profileUserMatchHistory}
			</div>
		</div>
	)

}