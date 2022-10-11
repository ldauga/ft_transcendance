import { rmSync } from 'fs';
import React, { Component, useEffect, useState } from 'react';
import './Homepage.scss';
import FriendList from './FriendList';
import { AddFriendHook, FriendListHook } from './Hooks';
import AddFriend from './AddFriend';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../State';
import axios from 'axios';
import ReactDOM from 'react-dom';

import { AiOutlineClose } from 'react-icons/ai'
import { RiFileWarningLine } from 'react-icons/ri'
import { BiCog } from 'react-icons/bi'

import iron_rank_img from '../assets/iron_rank.png'
import bronze_rank_img from '../assets/bronze_rank.png'
import gold_rank_img from '../assets/gold_rank.png'
import diamond_rank_img from '../assets/diamond_rank.png'
import master_rank_img from '../assets/master_rank.png'

import les_BGs from '../assets/les_BGs.jpeg'

import { bindActionCreators } from 'redux';
import { NotifType } from '../../State/type';
import affNotif from './affNotif';
import { StatPlayer } from '../../Module/UserProfile/StatPlayer';
import DropZone from './DropZone';
import Login from '../Login/Login';
import { useCookies } from 'react-cookie';
import InvitationRequest from './InvitationRequest';
import Convers from './Convers';
import Chat from './Chat';
import NavBar from '../../Module/Navbar/Navbar';

const fileTypes = ["JPG", "PNG"];

var test = false
var verif = false

const HomePage = (props: any) => {
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
    const utilsData = useSelector((state: RootState) => state.utils)
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);

    const dispatch = useDispatch();
    const { setUser, delNotif, delAllNotif, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

    const [listNotif, setListNotif] = useState(Array<any>)

    const [isFriendList, setFriendList] = useState(true);
    const [isAddFriend, setAddFriend] = useState(false);
    const [isInvitationRequest, setInvitationRequest] = useState(false);
    const [isConvers, setConvers] = useState(false);
    const [isChat, setChat] = useState(false);
    const [conversCorrespondantData, setConversCorrespondantData] = useState({ id: 0, login: "" });
    const [oldAff, setOldAff] = useState("");

    const [matchesHistory, setMatchesHistory] = useState(Array<any>)
    const [leaderBoardUsers, setLeaderBoardUsers] = useState(Array<any>)

    const [rankImage, setRankImage] = useState("")
    const [userProfileLogin, setUserProfileLogin] = useState("")

    const [userParameterAff, setUserParameterAff] = useState(false);
    const [userParameterNewProfilePicture, setUserParameterNewProfilePicture] = useState<null | any>(null)
    const [userParameterNewNickname, setUserParameterNewNickname] = useState(persistantReducer.userReducer.user?.nickname)
    const [userParameter2FAQrCode, setUserParameter2FAQrCode] = useState("");
    const [userParameter2FACode, setUserParameter2FACode] = useState("");
    const [userParameter2FARes, setUserParameter2FARes] = useState(0);
    const [userParameter2FAStatus, setUserParameter2FAStatus] = useState("Please enter the code above.");
    const [userParameter2FADeactivate, setUserParameter2FADeactivate] = useState(false);


    var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
        "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

    var dayNames = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."]

    function openChat() {
        setUserParameterAff(false);
        if (isChat) {
            setChat(false);
            setFriendList(true);
        }
        else {
            setAddFriend(false);
            setFriendList(false);
            setInvitationRequest(false);
            setConvers(false);
            setChat(true);
        }
    };

    function refreshMatchHistory() {
        axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + persistantReducer.userReducer.user?.id).then((res) => {
            let matches: any[] = []
            res.data.forEach((item: { login_user1: string, score_u1: number, login_user2: string, score_u2: number, winner_login: string, date: Date }) => {
                matches.push(
                    <div key={matches.length.toString()} className={(item.winner_login == persistantReducer.userReducer.user?.login ? 'game game-win' : 'game game-lose')} >
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
            setMatchesHistory(matches.reverse())
        })
    }

    function refreshUserRank() {
        const tmp1 = document.getElementById('numberWinsValue')
        if (tmp1)
            tmp1.textContent = persistantReducer.userReducer.user!.wins.toString()
        const tmp2 = document.getElementById('numberLossesValue')
        if (tmp2)
            tmp2.textContent = persistantReducer.userReducer.user!.losses.toString()
        const tmp3 = document.getElementById('winRateValue')
        if (tmp3)
            tmp3.textContent = Math.floor((persistantReducer.userReducer.user!.wins / (persistantReducer.userReducer.user!.wins + persistantReducer.userReducer.user!.losses)) * 100).toString() + '%'
        const tmp4 = document.getElementById('rankNameValue')
        if (tmp4) {
            setRankImage(iron_rank_img)
            tmp4.textContent = 'Iron | Noobies'
            if (persistantReducer.userReducer.user!.wins > 5) {
                setRankImage(bronze_rank_img)
                tmp4.textContent = 'Bronze | Trainer'
            }
            else if (persistantReducer.userReducer.user!.wins > 10) {
                setRankImage(gold_rank_img)
                tmp4.textContent = 'Gold | Not Bad'
            }
            else if (persistantReducer.userReducer.user!.wins > 20) {
                setRankImage(diamond_rank_img)
                tmp4.textContent = 'Diamond | Wow !!!'
            }
            else if (persistantReducer.userReducer.user!.wins > 30) {
                setRankImage(master_rank_img)
                tmp4.textContent = 'Master splinter | Our God !!!'
            }
            if (persistantReducer.userReducer.user!.login == 'ldauga') {
                setRankImage(master_rank_img)
                tmp4.textContent = 'Master splinter | Our God !!!'
            } else if (persistantReducer.userReducer.user!.login == 'atourret') {
                setRankImage(gold_rank_img)
                tmp4.textContent = 'GroNoob'
            }
        }
    }

    function refresh2FAParameter() {
        if (!persistantReducer.userReducer.user?.isTwoFactorAuthenticationEnabled) {
            if (userParameter2FAQrCode === "")
                axios.get('http://localhost:5001/auth/2fa/generate/', { withCredentials: true }).then(res => (setUserParameter2FAQrCode(res.data)))
            if (userParameter2FARes === 401)
                setUserParameter2FAStatus("Error, wrong code.")
            else if (userParameter2FARes == 404)
                setUserParameter2FAStatus("You must enter the code.")
            else if (userParameter2FARes == 200)
                setUserParameter2FAStatus("2FA activated !")
        }
    }

    function refreshLeaderBoard() {
        axios.get('http://localhost:5001/user').then((res) => {
            let tmp: any[] = []
            res.data.forEach((item: any) => {

                tmp.push(<div className={(item.login == persistantReducer.userReducer.user?.login ? 'UserLeaderBoard Our' : 'UserLeaderBoard')} key={tmp.length + 1} onClick={(e) => { setUserProfileLogin(e.currentTarget.children[1].textContent as string); displayStatPlayer() }}>
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

            setLeaderBoardUsers(tmp.reverse())
        })
    }

    useEffect(() => {

        if (!test) {
            refreshMatchHistory()
            refreshUserRank()
            refresh2FAParameter()
            refreshLeaderBoard()
            test = true
        }
        if (leaderBoardUsers.length && !verif) {
            for (let index = 0; index < leaderBoardUsers.length; index++) {
                var rank = document.getElementById(leaderBoardUsers[index].props.children[1].props.children + 'Rank')
                if (rank)
                    rank.textContent = (index + 1).toString()
            }
            verif = true
        }
    })

    function saveParameter() {

        if (userParameterNewNickname != persistantReducer.userReducer.user?.nickname)
            axios.patch('http://localhost:5001/user/updateNickname', { nickname: userParameterNewNickname }, { withCredentials: true }).then((res) => { setUser(res.data) })

        if (userParameter2FACode) {
            setTwoFactor(true)
            axios.get('http://localhost:5001/auth/2fa/turn-on/' + userParameter2FACode, { withCredentials: true }).then(res => setUserParameter2FARes(res.status)).catch((e) => setUserParameter2FARes(e.response.status));
        }

        if (userParameterNewProfilePicture != null) {

        



            // console.log('ci')
            // const form = document.querySelector('form') || undefined
            // console.log(form)

            var formData = new FormData();

            // // formData.append("somePropName", 'somePropValue');
            formData.append("photo", userParameterNewProfilePicture);

            var config = {
                method: 'post',
                url: 'http://localhost:5001/user/upload',
                headers: { 
                    'Content-Type': 'multipart/form-data',
                },
                data : formData,
                withCredentials: true
              };

              axios(config).then((res) => setUser(res.data))
            // console.log('formData', formData)
            /*  const requestOptions = {
                  method: 'POST',
                  body: formData,
              };*/
            // const config = {
            //     withCredentials: true,
            //     headers: { 'content-type': 'multipart/form-data' }
            //   }
            // const response = axios.post('http://localhost:5001/user/upload', formData, config)
            // .then(response => {
            //   console.log(response);
            // })
            // .catch(error => {
            //     console.log(error);
            // });
            //  const response = fetch('http://localhost:5001/user/upload', requestOptions).then((res) => console.log(res));
        };
        // form.append('newProfilePic', userParameterNewProfilePicture.buffer, file.originalname);


        // Create a form and append image with additional fields
        // form.append('newProfile', userParameterNewProfilePicture, userParameterNewProfilePicture.name);

        // Send form data with axios
        // axios.post('https://example.com', form, {
        //     headers: {
        //         ...form.getHeaders(),
        //         Authentication: 'Bearer ...',
        //     },
        // });

        // form.append('newProfilePicture', userParameterNewProfilePicture.size.toString, userParameterNewProfilePicture.name);

        // axios.post('http://localhost:5001/user/upload?file', userParameterNewProfilePicture).catch()


        // axios.post('http://localhost:5001/user/upload', { userParameterNewProfilePicture }).then((res) => { console.log(res) }).catch((err) => console.log(err))

        setUserParameter2FAQrCode("")
        setUserParameter2FACode("")
        setUserParameter2FARes(0)
        setUserParameterNewProfilePicture(undefined)
        // if (userParameterNewProfilePicture !== null)
        //    axios.post('http://localhost:3000/user/upload?file', ).catch()
    }

    function displayStatPlayer() {
        const statPlayer = document.getElementById("statPlayer") as HTMLDivElement | null;
        if (statPlayer != null) {
            statPlayer.style.display = "flex";
        }
    }

    return (
        <>
            <NavBar/>
			<div className="homepage">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
					<a href='/PongTest'><path href='/Pong' fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" /></a>
				</svg>
			</div>
		</>
	)
    
    // function openChat() {
    //     setUserParameterAff(false);
    //     if (isChat) {
    //         setChat(false);
    //         setFriendList(true);
    //     }
    //     else {
    //         setAddFriend(false);
    //         setFriendList(false);
    //         setInvitationRequest(false);
    //         setConvers(false);
    //         setChat(true);
    //     }
    // };

    // useEffect(() => {

        // console.log('file :', userParameterNewProfilePicture)

        // if (!test) {
        //     axios.get('http://localhost:5001/matchesHistory/parsedMatchesHistory/' + persistantReduceur.userReducer.user?.id).then((res) => {
        //         let matches: any[] = []
        //         res.data.forEach((item: { login_user1: string, score_u1: number, login_user2: string, score_u2: number, winner_login: string, date: Date }) => {
        //             matches.push(
        //                 <div key={matches.length.toString()} className={(item.winner_login == persistantReduceur.userReducer.user?.login ? 'game game-win' : 'game game-lose')} >
        //                     <div className='matchPlayers'>
        //                         <div className='player'>
        //                             <div className='Score'>{item.score_u1}</div>
        //                             <div className='PlayerNickname'>{item.login_user1}</div>
        //                         </div>
        //                         <div className='player'>
        //                             <div className='Score'>{item.score_u2}</div>
        //                             <div className='PlayerNickname'>{item.login_user2}</div>
        //                         </div>
        //                     </div>
        //                     <div className='matchDate'><>{dayNames[new Date(item.date).getDay()] + ' ' + new Date(item.date).getDate() + ' ' + monthNames[new Date(item.date).getMonth()] + ' ' + new Date(item.date).getHours() + ':' + new Date(item.date).getMinutes()}</></div>
        //                 </div>
        //             )
        //         })
        //         if (!matches.length)
        //             matches.push(<div className='noMatchHistory'>
        //                 <div className="iconContainer">
        //                     <RiFileWarningLine />
        //                 </div>
        //                 <div className="textContainer">
        //                     No match history found...
        //                 </div>
        //             </div>)
        //         console.log('matches', matches)
        //         setMatchesHistory(matches.reverse())
        //     })

        //     if (!persistantReduceur.userReducer.user?.isTwoFactorAuthenticationEnabled) {
        //         if (userParameter2FAQrCode === "")
        //             axios.get('http://localhost:5001/auth/2fa/generate/', { withCredentials: true }).then(res => (setUserParameter2FAQrCode(res.data)))
        //         if (userParameter2FARes === 401)
        //             setUserParameter2FAStatus("Error, wrong code.")
        //         else if (userParameter2FARes == 404)
        //             setUserParameter2FAStatus("You must enter the code.")
        //         else if (userParameter2FARes == 200)
        //             setUserParameter2FAStatus("2FA activated !")
        //     }

        //     test = true
        // } else if (!leaderBoardUsers.length) {
        //     axios.get('http://localhost:5001/user').then((res) => {
        //         let tmp: any[] = []
        //         res.data.forEach((item: any) => {

        //             if (item.login == persistantReduceur.userReducer.user?.login) {
        //                 const tmp1 = document.getElementById('numberWinsValue')
        //                 if (tmp1)
        //                     tmp1.textContent = item.wins
        //                 const tmp2 = document.getElementById('numberLossesValue')
        //                 if (tmp2)
        //                     tmp2.textContent = item.losses
        //                 const tmp3 = document.getElementById('winRateValue')
        //                 if (tmp3)
        //                     tmp3.textContent = Math.floor((item.wins / (item.wins + item.losses)) * 100).toString() + '%'
        //                 const tmp4 = document.getElementById('rankNameValue')
        //                 if (tmp4) {
        //                     setRankImage(iron_rank_img)
        //                     tmp4.textContent = 'Iron | Noobies'
        //                     if (item.wins > 5) {
        //                         setRankImage(bronze_rank_img)
        //                         tmp4.textContent = 'Bronze | Trainer'
        //                     }
        //                     else if (item.wins > 10) {
        //                         setRankImage(gold_rank_img)
        //                         tmp4.textContent = 'Gold | Not Bad'
        //                     }
        //                     else if (item.wins > 20) {
        //                         setRankImage(diamond_rank_img)
        //                         tmp4.textContent = 'Diamond | Wow !!!'
        //                     }
        //                     else if (item.wins > 30) {
        //                         setRankImage(master_rank_img)
        //                         tmp4.textContent = 'Master splinter | Our God !!!'
        //                     }
        //                     if (item.login == 'ldauga') {
        //                         setRankImage(master_rank_img)
        //                         tmp4.textContent = 'Master splinter | Our God !!!'
        //                     } else if (item.login == 'atourret') {
        //                         setRankImage(gold_rank_img)
        //                         tmp4.textContent = 'GroNoob'
        //                     }
        //                 }
        //             }

        //             tmp.push(<div className={(item.login == persistantReduceur.userReducer.user?.login ? 'UserLeaderBoard Our' : 'UserLeaderBoard')} key={tmp.length + 1} onClick={(e) => { setUserProfileLogin(e.currentTarget.children[1].textContent as string); displayStatPlayer() }}>
        //                 <div className='UserLeaderBoardInfo little' id={item.login + 'Rank'}>{ }</div>
        //                 <div className='UserLeaderBoardInfo medium'>{item.login}</div>
        //                 <div className='UserLeaderBoardInfo little'>{item.wins}</div>
        //                 <div className='UserLeaderBoardInfo little'>{item.losses}</div>
        //                 <div className='UserLeaderBoardInfo medium'>{Math.floor((item.wins / (item.wins + item.losses)) * 100).toString() + '%'}</div>
        //             </div>)
        //         })

        //         for (let index = 0; index < tmp.length; index++) {
        //             if (index + 1 != tmp.length && tmp[index].props.children[2].props.children > tmp[index + 1].props.children[2].props.children) {
        //                 var oui = tmp[index]
        //                 tmp[index] = tmp[index + 1]
        //                 tmp[index + 1] = oui
        //                 index = 0
        //             }
        //         }

        //         tmp.forEach((item, index) => {
        //             var rank = document.getElementById(item.props.children[1].props.children + 'Rank')
        //             if (rank)
        //                 rank.textContent = (tmp.length - index).toString()
        //         })

        //         var invertMatches: any[] = []
        //         for (let index = tmp.length - 1; index >= 0; index--)
        //             invertMatches.push(tmp[index])

        //         setLeaderBoardUsers(invertMatches)
        //     })
        // }
    // })

    // function saveParameter() {

    //     if (userParameterNewNickname != persistantReduceur.userReducer.user?.nickname)
    //         axios.post('http://localhost:5001/user/updateNickname', { id: persistantReduceur.userReducer.user?.id, nickname: userParameterNewNickname }).then((res) => { setUser(res.data) })

    //     axios.get('http://localhost:5001/auth/2fa/turn-on/' + userParameter2FACode, { withCredentials: true }).then(res => setUserParameter2FARes(res.status)).catch((e) => setUserParameter2FARes(e.response.status));
    //     // if (userParameterNewProfilePicture !== null)
    //     //    axios.post('http://localhost:3000/user/upload?file', ).catch()
    // }

    // function displayStatPlayer() {
    //     const statPlayer = document.getElementById("statPlayer") as HTMLDivElement | null;
    //     if (statPlayer != null) {
    //         statPlayer.style.display = "flex";
    //     }
    // }

    // return (
    //     <div className='App'>
    //         <div className="horizontal">
    //             <Navbartheo/>
    //             <div className="vertical">
    //                 <div className='main'>
    //                     <div className='statPlayer' id='statPlayer' >
    //                         <StatPlayer login={userProfileLogin} setLogin={setUserProfileLogin} />
    //                     </div>
    //                     <div className="match-history" id='match-history' >
    //                         <h3>Match History</h3>
    //                         {matchesHistory}
    //                     </div>
    //                     <div className="stat" id='stat' >
    //                         <div className="rank">
    //                             <div className='rankInfo'>
    //                                 <div className='imgContainer'>
    //                                     <img src={rankImage} />
    //                                 </div>
    //                                 <div className='rankName'>
    //                                     <div className='rankNameText'>Rank :</div>
    //                                     <div className='rankNameText' id='rankNameValue'></div>
    //                                 </div>
    //                             </div>
    //                             <div className='userInfoContainer'>
    //                                 <div className='userInfo first'>
    //                                     <div className='userInfoText'>Wins :</div>
    //                                     <div className='userInfoText value' id='numberWinsValue'></div>
    //                                 </div>
    //                                 <div className='userInfo second'>
    //                                     <div className='userInfoText'>Losses :</div>
    //                                     <div className='userInfoText value' id='numberLossesValue'></div>
    //                                 </div>
    //                                 <div className='userInfo third'>
    //                                     <div className='userInfoText'>Win Rate :</div>
    //                                     <div className='userInfoText value' id='winRateValue'></div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                         <div className="leaderBoard">
    //                             <div className='infoLeaderBoard'>
    //                                 <div className='infoContent little'>Rank</div>
    //                                 <div className='infoContent medium'>Nickname</div>
    //                                 <div className='infoContent little'>Wins</div>
    //                                 <div className='infoContent little'>Looses</div>
    //                                 <div className='infoContent medium'>Win Rate</div>
    //                             </div>
    //                             {leaderBoardUsers}
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className="info">
    //                     <div className="user-info">
    //                         <div className="user-picture">
    //                             <img src={persistantReduceur.userReducer.user?.profile_pic} />
    //                             <Avatar alt="Remy Sharp" src={persistantReduceur.userReducer.user?.profile_pic} />
    //                         </div>
    //                         <p className="username">{persistantReduceur.userReducer.user?.login}</p>
    //                         <p className="level">lvl</p>
    //                         <div className="userParameterIconContainer">
    //                             <BiCog onClick={e => setUserParameterAff(!userParameterAff)} />
    //                         </div>
    //                     </div>
    //                     {(!userParameterAff) ?
    //                         <div className="friends-info" id='friends-info-id'>
    //                             {isFriendList && <FriendList setFriendList={setFriendList} setAddFriend={setAddFriend} setInvitationRequest={setInvitationRequest} setConvers={setConvers} setConversCorrespondantData={setConversCorrespondantData} setOldAff={setOldAff} />}
    //                             {isAddFriend && <AddFriend setFriendList={setFriendList} setAddFriend={setAddFriend} />}
    //                             {isInvitationRequest && <InvitationRequest setFriendList={setFriendList} setInvitationRequest={setInvitationRequest} />}
    //                             {isConvers && <Convers setFriendList={setFriendList} setChat={setChat} setConvers={setConvers} conversCorrespondantData={conversCorrespondantData} oldAff={oldAff} />}
    //                             {isChat && <Chat setFriendList={setFriendList} setChat={setChat} setConvers={setConvers} setConversCorrespondantData={setConversCorrespondantData} setOldAff={setOldAff} />}
    //                         </div> :
    //                         <div className="user-parameter">
    //                             <div className="user-parameter-element"  >
    //                                 <div className="user-parameter-title" onClick={e => e.currentTarget.parentElement?.classList.toggle('expanded')}>Change nickname :</div>
    //                                 <div className="user-parameter-content">
    //                                     <div className="user-parameter-content-text">Enter New nickname and click save</div>
    //                                     <input type="text" className='user-parameter-input-bar' maxLength={30} placeholder='Enter new nickname' value={userParameterNewNickname} onChange={e => setUserParameterNewNickname(e.target.value)} />
    //                                     <div className="save-parameter" onClick={e => {saveParameter(); e.currentTarget.parentElement?.parentElement?.classList.toggle('expanded')}}>Save</div>
    //                                 </div>
    //                             </div>
    //                             {/* <div className="user-parameter-element">
    //                                 <div className="user-parameter-text">Change profile picture :</div>
    //                                 <DropZone setUserParameterNewProfilePicture={setUserParameterNewProfilePicture} />
    //                             </div>
    //                             <div className="user-parameter-element">
    //                                 {!persistantReduceur.userReducer.user?.isTwoFactorAuthenticationEnabled ?
    //                                     <><div className="user-parameter-text">Set 2FA :</div>
    //                                         <p>Scan the following QR Code using Google Authenticator</p>
    //                                         <img src={userParameter2FAQrCode} />
    //                                         <input
    //                                             type="text"
    //                                             value={userParameter2FACode}
    //                                             onChange={(e) => setUserParameter2FACode(e.target.value)}
    //                                         />
    //                                         <p>{userParameter2FAStatus}</p>
    //                                     </> :
    //                                     <>
    //                                         <div className="user-parameter-text">Deactivate 2FA :</div>
    //                                         <input type="checkbox" onChange={e => setUserParameter2FADeactivate(!userParameter2FADeactivate)}></input>
    //                                     </>
    //                                 }
    //                             </div> */}
    //                         </div>}
    //                     <button id="openChatButton" onClick={() => openChat()}>Chat</button>
    //                 </div>
    //             </div>
    //         </div>
    //         <div id="notifModal" className="notifModal">
    //             <div className="notif-modal-content">
    //                 <AiOutlineClose onClick={() => { var tmp = document.getElementById('notifModal'); if (tmp) tmp.style.display = 'none' }} />
    //                 <div className='printNotif'>{affNotif()}</div>
    //                 {/* <div className='bgDeleteAllNotif'> */}
    //                 {persistantReduceur.notifReducer.notifArray.length ? <div className='deleteAllNotif' onClick={delAllNotif}>Delete all notif</div> : <></>}
    //                 {/* </div> */}
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default HomePage;