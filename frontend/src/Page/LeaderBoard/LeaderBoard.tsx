import { useEffect, useState } from "react";
import Background from "../../Module/Background/Background";
import NavBar from "../../Module/Navbar/Navbar";
import axiosConfig from "../../Utils/axiosConfig";
import './LeaderBoard.scss';
import unranked from './../../Assets/rank/unranked.png'
import bronze_rank_img from '../../Assets/rank/bronze_rank.png'
import gold_rank_img from '../../Assets/rank/gold_rank.png'
import diamond_rank_img from '../../Assets/rank/diamond_rank.png'
import silver_rank_img from '../../Assets/rank/silver_rank.png'
import platinium_rank_img from '../../Assets/rank/platinium_rank.png'

function LeaderBoard() {

    const [rows, setRows] = useState<any[]>([])

	useEffect(() => {
		if (!rows.length) {
			axiosConfig.get('http://10.3.3.5:5001/user').then(res => {

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
        <>
        <NavBar />
        <Background />
        <div className="leaderboard">
            <table>
				<thead>
					<tr>
						<th>Nickname</th>
						<th>Rank</th>
						<th>Wins</th>
						<th>Loses</th>
					</tr>
				</thead>
			</table>
            <div className='tabContent'>
				<table>
					<tbody>
						{rows.map((row) => (
							<tr className='element' onClick={() => {history.pushState({}, '', window.URL.toString()); window.location.replace('http://10.3.3.5:3000/Profile/' + row.nickname)}} key={row.nickname}>
								<td><img src={row.profile_pic} /> <span>{row.nickname}</span></td>
								<td><img src={
										!row.wins ? unranked :
											row.wins < 5 ? bronze_rank_img :
												row.wins < 10 ? silver_rank_img :
													row.wins < 20 ? gold_rank_img :
														row.wins < 50 ? platinium_rank_img :
															diamond_rank_img
								} /></td>
								<td>{row.wins}</td>
								<td>{row.losses}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
        </div>
        </>
    )
}

export default LeaderBoard;