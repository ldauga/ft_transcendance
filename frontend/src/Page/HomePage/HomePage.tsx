import { rmSync } from 'fs';
import React, { Component, useEffect, useState } from 'react';
import Navbar from '../../Module/Navbar/Navbar';
import './HomePage.css';
import FriendList from './FriendList';
import { AddFriendHook, FriendListHook } from './Hooks';
import AddFriend from './AddFriend';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../State';
import axios from 'axios';
import ReactDOM from 'react-dom';

import { AiOutlineClose } from 'react-icons/ai'

import iron_rank_img from '../assets/iron_rank.png'
import bronze_rank_img from '../assets/bronze_rank.png'
import gold_rank_img from '../assets/gold_rank.png'
import diamond_rank_img from '../assets/diamond_rank.png'
import master_rank_img from '../assets/master_rank.png'

import { bindActionCreators } from 'redux';
import { NotifType } from '../../State/type';
import affNotif from './affNotif';
import { StatPlayer } from '../../Module/UserProfile/StatPlayer';

var test = false

const HomePage = (props: any) => {
    const persistantReduceur = useSelector((state: RootState) => state.persistantReduceur)
    const utilsData = useSelector((state: RootState) => state.utils)

    const dispatch = useDispatch();
    const { delNotif, delAllNotif } = bindActionCreators(actionCreators, dispatch);

    const [listNotif, setListNotif] = useState(Array<any>)

    const [isFriendList, setFriendList] = FriendListHook(true);
    const [isAddFriend, setAddFriend] = AddFriendHook(false);

    const [matchesHistory, setMatchesHistory] = useState(Array<any>)
    const [leaderBoardUsers, setLeaderBoardUsers] = useState(Array<any>)

    const [rankImage, setRankImage] = useState("")
    const [userProfileLogin, setUserProfileLogin] = useState("")

    var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
        "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

    var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

    useEffect(() => {

        if (!test) {
            axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + persistantReduceur.userReducer.user?.id).then((res) => {
                let matches: any[] = []
                res.data.forEach((item: { login_user1: string, score_u1: number, login_user2: string, score_u2: number, winner_login: string, date: Date }) => {
                    matches.push(
                        <div key={matches.length.toString()} className={(item.winner_login == persistantReduceur.userReducer.user?.login ? 'game game-win' : 'game game-lose')} >
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
                setMatchesHistory(matches.reverse())
            })

            test = true
        } else if (!leaderBoardUsers.length) {
            axios.get('http://localhost:5001/user').then((res) => {
                let tmp: any[] = []
                res.data.forEach((item: any) => {

                    if (item.login == persistantReduceur.userReducer.user?.login) {
                        const tmp1 = document.getElementById('numberWinsValue')
                        if (tmp1)
                            tmp1.textContent = item.wins
                        const tmp2 = document.getElementById('numberLossesValue')
                        if (tmp2)
                            tmp2.textContent = item.losses
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

                    tmp.push(<div className={(item.login == persistantReduceur.userReducer.user?.login ? 'UserLeaderBoard Our' : 'UserLeaderBoard')} key={tmp.length + 1} onClick={(e) => {setUserProfileLogin(e.currentTarget.children[1].textContent as string); displayStatPlayer()}}>
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

    function displayStatPlayer() {
        const statPlayer = document.getElementById("statPlayer") as HTMLDivElement | null;
        if (statPlayer != null) {
            statPlayer.style.display = "flex";
        }
      }

    return (
        <div className='App'>
            <div className="horizontal">
                <Navbar />
                <div className="vertical">
                    <div className='main'>
                        <div className='statPlayer' id='statPlayer' >
                            <StatPlayer login={userProfileLogin} setLogin={setUserProfileLogin}/>
                        </div>
                        <div className="match-history" id='match-history' >
                            <h3>Match History</h3>
                            {matchesHistory}
                        </div>
                        <div className="stat" id='stat' >
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
                    </div>
                    <div className="info">
                        <div className="user-info">
                            <div className="user-picture">
                                <img src={persistantReduceur.userReducer.user?.profile_pic} />
                            </div>
                            <p className="username">{persistantReduceur.userReducer.user?.login}</p>
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
                    <div id="notifModal" className="notifModal">
                        <div className="notif-modal-content">
                            <AiOutlineClose onClick={() => { var tmp = document.getElementById('notifModal'); if (tmp) tmp.style.display = 'none' }} />
                            <div className='printNotif'>{affNotif()}</div>
                            {/* <div className='bgDeleteAllNotif'> */}
                                {persistantReduceur.notifReducer.notifArray.length ? <div className='deleteAllNotif' onClick={delAllNotif}>Delete all notif</div> : <></>}
                            {/* </div> */}
                        </div>
                    </div>
        </div>
    );
};

export default HomePage;