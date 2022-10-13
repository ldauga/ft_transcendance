import { Avatar } from '@mui/material';
import './Leaderboard.scss';
import unranked from './../../../Assets/rank/unranked.png'

import iron_rank_img from '../../../Assets/rank/iron_rank.png'
import bronze_rank_img from '../../../Assets/rank/bronze_rank.png'
import gold_rank_img from '../../../Assets/rank/gold_rank.png'
import diamond_rank_img from '../../../Assets/rank/diamond_rank.png'
import master_rank_img from '../../../Assets/rank/master_rank.png'

import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../State';
import { useEffect, useState } from 'react';


function Leaderboard() {
	const persistantReducer = useSelector((state: RootState) => state.persistantReducer)

	const [rows, setRows] = useState<any[]>([])

	useEffect(() => {
		if (!rows.length) {
			axios.get('http://localhost:5001/user').then(res => {

				let tmp = res.data
				
				for (let index = 0; index < tmp.length; index++) {
					if (index + 1 < tmp.length) {
						if (tmp[index].wins < tmp[index + 1].wins || (tmp[index].wins == tmp[index + 1].wins && tmp[index].losses < tmp[index + 1].losses)) {
							let swap = tmp[index]
							tmp[index] = tmp[index + 1]
							tmp[index + 1] = swap
							index = -1;
						}
					}
				}
				setRows(tmp)
			})
		}

		console.log('oui', rows)
	})

	return (
		<div className='leaderboard'>
			<table>
				<thead>
					<tr>
						<th>Username</th>
						<th>Rank</th>
						<th>Wins</th>
						<th>Losses</th>
					</tr>
				</thead>
			</table>
			<div className='tabContent'>
				<table>
					<tbody>
						{rows.map((row) => (
							<tr key={row.nickname}>
								<td><img src={row.profile_pic} /> <span>{row.nickname}</span></td>
								<td><img src={
									row.login == 'ldauga' ? master_rank_img :
										!row.wins ? unranked :
											row.wins < 5 ? iron_rank_img :
												row.wins < 10 ? bronze_rank_img :
													row.wins < 20 ? gold_rank_img :
														row.wins < 50 ? diamond_rank_img :
															master_rank_img
								} /></td>
								<td>{row.wins}</td>
								<td>{row.losses}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default Leaderboard;