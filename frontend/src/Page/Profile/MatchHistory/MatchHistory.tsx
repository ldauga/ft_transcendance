import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './MatchHistory.scss';

var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
	"Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

function MatchHistory() {

	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)

	const [rows, setRows] = useState<any[]>([])

	axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + persistantReducer.userReducer.user?.id).then(res => setRows(res.data.reverse()))

	// {rows.map((row) => (
	// 	<tr key={row.nickname}>
	// 		<td><img src={row.profile_pic} /> <span>{row.nickname}</span></td>
	// 		<td><img src={
	// 			row.login == 'ldauga' ? master_rank_img :
	// 				!row.wins ? unranked :
	// 					row.wins < 5 ? iron_rank_img :
	// 						row.wins < 10 ? bronze_rank_img :
	// 							row.wins < 20 ? gold_rank_img :
	// 								row.wins < 50 ? diamond_rank_img :
	// 									master_rank_img
	// 		} /></td>
	// 		<td>{row.wins}</td>
	// 		<td>{row.losses}</td>
	// 	</tr>
	// ))}



	{/* <div className="cards">
				<div className='win'>
					<div className='card'>
						<span className='mmr'>MMR: +10</span>
						<div className='score'>
							<h3>Victory</h3>
							<span>3 - 0</span> */}

	return (
		<div className='matchHistory'>
			<h1>Match History</h1>
			<div className="cards">
				{
					rows.map((row) => (
						<div className={row.winner_nickname == persistantReducer.userReducer.user?.nickname ? 'win' : 'defeat'}>
							<div className='card'>
								<span className='mmr'>{dayNames[new Date(row.date).getDay()] + ' ' + new Date(row.date).getDate() + ' ' + monthNames[new Date(row.date).getMonth()] + ' ' + new Date(row.date).getHours() + ':' + new Date(row.date).getMinutes()}</span>
								<div className='score'>
									<h3>{row.winner_nickname == persistantReducer.userReducer.user?.nickname ? 'Victory' : 'Defeat'}</h3>
									<div className="opponent">
										<h2 className='player' onClick={() => {history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + row.nickname_user1)}}>
											{row.nickname_user1}
											</h2>
										<h2>
											VS
											</h2>
										<h2 className='player' onClick={() =>{history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + row.nickname_user2)}}>
											{row.nickname_user2}
											</h2>
									</div>
									<span>{row.score_u1.toString() + ' - ' + row.score_u2.toString()}</span>
								</div>
							</div>
						</div>
					))

				}
			</div>
		</div>
	)

}

export default MatchHistory;