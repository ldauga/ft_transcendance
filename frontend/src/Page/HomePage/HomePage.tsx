import { rmSync } from 'fs';
import React, { Component, useEffect, useState } from 'react';
import Navbar from '../../Module/Navbar/Navbar';
import './../assets/Font.css';
import './HomePage.css';
import FriendList from './FriendList';
import { AddFriendHook, FriendListHook } from './Hooks';
import AddFriend from './AddFriend';
import { useSelector } from 'react-redux';
import { RootState } from '../../State';
import axios from 'axios';
import ReactDOM from 'react-dom';

import iron_rank_img from '../assets/iron_rank.png'
import bronze_rank_img from '../assets/bronze_rank.png'
import gold_rank_img from '../assets/gold_rank.png'
import diamond_rank_img from '../assets/diamond_rank.png'
import master_rank_img from '../assets/master_rank.png'

var test = false
const matches: any[] = [];

const HomePage = (props: any) => {
    const userData = useSelector((state: RootState) => state.user)
    // console.log(userData.user);
    const [isFriendList, setFriendList] = FriendListHook(true);
    const [isAddFriend, setAddFriend] = AddFriendHook(false);

    const [matchesHistory, setMatchesHistory] = useState(Array<any>)
    const [leaderBoardUsers, setLeaderBoardUsers] = useState(Array<any>)

    const [rankImage, setRankImage] = useState("")

    var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
        "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

    var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

    useEffect(() => {

        if (!test) {
            axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + userData.user?.id).then((res) => {
                console.log('testestest', res.data)

                let matches: any[] = []
                res.data.forEach((item: { login_user1: string, score_u1: number, login_user2: string, score_u2: number, winner_login: string, date: Date }) => {
                    matches.push(<div key={matches.length.toString()} className={(item.winner_login == userData.user?.login ? 'game game-win' : 'game game-lose')} >
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
                    </div>)
                })
                console.log('matches', matches)
                var invertMatches: any[] = []
                for (let index = matches.length - 1; index >= 0; index--)
                    invertMatches.push(matches[index])
                setMatchesHistory(invertMatches)
            })

            test = true
        } else if (!leaderBoardUsers.length) {
            axios.get('http://localhost:5001/user').then((res) => {
                let tmp: any[] = []
                res.data.forEach((item: any) => {

                    if (item.login == userData.user?.login) {
                        const tmp1 = document.getElementById('numberWinsValue')
                        if (tmp1)
                            tmp1.textContent = item.wins
                        const tmp2 = document.getElementById('numberLossesValue')
                        if (tmp2)
                            tmp2.textContent = item.wins
                        const tmp3 = document.getElementById('winRateValue')
                        if (tmp3)
                            tmp3.textContent = Math.floor((item.wins / (item.wins + item.losses)) * 100).toString() + '%'
                        const tmp4 = document.getElementById('rankNameValue')
                        if (tmp4) {
                            setRankImage(iron_rank_img)
                            tmp4.textContent = 'Iron | Noobies'
                            if (item.wins > 5) {
                                setRankImage(bronze_rank_img)
                            tmp4.textContent = 'Bronze | Trainer'
                        }
                            else if (item.wins > 10) {
                                setRankImage(gold_rank_img)
                                tmp4.textContent = 'Gold | Not Bad'
                            }
                            else if (item.wins > 20) {
                                setRankImage(diamond_rank_img)
                                tmp4.textContent = 'Diamond | Wow !!!'
                            }
                            else if (item.wins > 30) {
                                setRankImage(master_rank_img)
                                tmp4.textContent = 'Master splinter | Our God !!!'
                            }
                            if (item.login == 'ldauga') {
                                setRankImage(master_rank_img)
                                tmp4.textContent = 'Master splinter | Our God !!!'
                            } else if (item.login == 'atourret') {
                                setRankImage(gold_rank_img)
                                tmp4.textContent = 'GroNoob'
                            }
                        }
                    }

                    tmp.push(<div className='UserLeaderBoard' key={tmp.length + 1} style={{ backgroundColor: (item.login == userData.user?.login ? 'darkblue' : 'none') }}>
                        <div className='UserLeaderBoardInfo little' id={item.login + 'Rank'}>{ }</div>
                        <div className='UserLeaderBoardInfo medium'>{item.login}</div>
                        <div className='UserLeaderBoardInfo little'>{item.wins}</div>
                        <div className='UserLeaderBoardInfo little'>{item.losses}</div>
                        <div className='UserLeaderBoardInfo medium'>{Math.floor((item.wins / (item.wins + item.losses)) * 100).toString() + '%'}</div>
                    </div>)
                })

                for (let index = 0; index < tmp.length; index++) {
                    if (index + 1 != tmp.length && tmp[index].props.children[2].props.children > tmp[index + 1].props.children[2].props.children) {
                        var oui = tmp[index]
                        tmp[index] = tmp[index + 1]
                        tmp[index + 1] = oui
                        index = 0
                    }
                }

                tmp.forEach((item, index) => {
                    var rank = document.getElementById(item.props.children[1].props.children + 'Rank')
                    if (rank)
                        rank.textContent = (tmp.length - index).toString()
                })

                var invertMatches: any[] = []
                for (let index = tmp.length - 1; index >= 0; index--)
                    invertMatches.push(tmp[index])

                setLeaderBoardUsers(invertMatches)
            })
        }
    })

    return (
        <div className='Font'>
            <div className="horizontal">
                <Navbar />
                <div className="vertical">
                    <main>
                        <div className="match-history">
                            <h3>Match History</h3>
                            {matchesHistory}
                        </div>
                        <div className="stat">
                            <div className="rank">
                                <div className='rankInfo'>
                                    <div className='imgContainer'>
                                        <img src={rankImage} />
                                    </div>
                                    <div className='rankName'>
                                        <div className='rankNameText'>Rank :</div>
                                        <div className='rankNameText' id='rankNameValue'></div>
                                    </div>
                                </div>
                                <div className='userInfoContainer'>
                                    <div className='userInfo first'>
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
                                    </div>
                                </div>
                            </div>
                            <div className="leaderBoard">
                                <div className='infoLeaderBoard'>
                                    <div className='infoContent little'>Rank</div>
                                    <div className='infoContent medium'>Nickname</div>
                                    <div className='infoContent little'>Wins</div>
                                    <div className='infoContent little'>Looses</div>
                                    <div className='infoContent medium'>Win Rate</div>
                                </div>
                                {leaderBoardUsers}
                            </div>
                        </div>
                    </main>
                    <div className="info">
                        <div className="user-info">
                            <div className="user-picture">
                                <img src={userData.user?.profile_pic} />
                            </div>
                            <p className="username">{userData.user?.login}</p>
                            <p className="level">lvl</p>
                        </div>
                        <div className="friends-info">
                            {isFriendList && <FriendList />}
                            {isAddFriend && <AddFriend />}
                        </div>
                        <div className="chat"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;