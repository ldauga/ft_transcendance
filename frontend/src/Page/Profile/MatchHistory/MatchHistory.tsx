import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import axiosConfig from '../../../Utils/axiosConfig';
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
			let res = axiosConfig.get('http://10.3.3.5:5001/matchesHistory/parsedMatchesHistory/' + persistantReducer.userReducer.user?.id).then(res => setRows(res.data.reverse()))
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
								<h3>{row.winner_nickname == persistantReducer.userReducer.user?.nickname ? 'Victory' : 'Defeat'}</h3>
								<div className="opponent">
									<span onClick={() => {history.pushState({}, '', window.URL.toString()); window.location.replace('http://10.3.3.5:3000/Profile/' + row.nickname_user1)}}>
										{row.nickname_user1}
									</span>
									<span className='score'>{row.score_u1.toString() + '-' + row.score_u2.toString()}</span>
									<span onClick={() =>{history.pushState({}, '', window.URL.toString()); window.location.replace('http://10.3.3.5:3000/Profile/' + row.nickname_user2)}}>
										{row.nickname_user2}
									</span>
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