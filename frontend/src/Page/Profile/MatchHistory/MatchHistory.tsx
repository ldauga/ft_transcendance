import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import './MatchHistory.scss';

var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
	"Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]


function MatchHistory() {

	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)

	const [rows, setRows] = useState<any[]>([])
	const [verif, setVerif] = useState(false)


	useEffect(() => {
		if (!verif) {
			axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + persistantReducer.userReducer.user?.id).then(res => setRows(res.data.reverse()))
			setVerif(true);
		}
	})

	return (
		<div className='matchHistory'>
			<h1>Match History</h1>
			<div className="cards">
				{
					rows.map((row) => (
						<div className={row.winner_nickname == persistantReducer.userReducer.user?.nickname ? 'win' : 'defeat'}>
							<div className='card'>
								<div className='score'>
									<h3>{row.winner_nickname == persistantReducer.userReducer.user?.nickname ? 'Victory' : 'Defeat'}</h3>
									<div className="opponent">
										<span>{row.nickname_user1}</span><span>{row.score_u1.toString() + ' - ' + row.score_u2.toString()}</span><span>{row.nickname_user2}</span>
										{/* <h2 className='player' onClick={() => {history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + row.nickname_user1)}}>
											{row.nickname_user1}
											</h2>
										<h2>
											VS
											</h2>
										<h2 className='player' onClick={() =>{history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/Profile/' + row.nickname_user2)}}>
											{row.nickname_user2}
											</h2> */}
									</div>
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