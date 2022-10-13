import { rmSync } from 'fs';
import React, { Component, useEffect, useState } from 'react';
import Navbar from '../../Module/Navbar/Navbar';
import './HomePage.css';
import FriendList from './ChatAndFriends/FriendList';
import { AddFriendHook, FriendListHook } from './Hooks';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, RootState } from '../../State';
import axios from 'axios';
import ReactDOM from 'react-dom';

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
import NavBar from '../../Module/Navbar/Navbar';

export const constWhileSecu = 10;

const fileTypes = ["JPG", "PNG"];

var test = false
var verif = false

const HomePage = (props: any) => {
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
    const utilsData = useSelector((state: RootState) => state.utils)
    const [cookies, setCookie, removeCookie] = useCookies(["auth-cookie"]);

    const dispatch = useDispatch();
    const { setUser, delNotif, delAllNotif, setTwoFactor } = bindActionCreators(actionCreators, dispatch);

    const [listNotif, setListNotif] = useState(Array<any>);

    const [isFriendList, setFriendList] = useState(true);
    const [isInvitationRequest, setInvitationRequest] = useState(false);
    const [isConvers, setConvers] = useState(false);
    const [isChat, setChat] = useState(false);
    const [isRooms, setRooms] = useState(false);
    const [isRoomsConvers, setRoomsConvers] = useState(false);
    const [conversCorrespondantData, setConversCorrespondantData] = useState({ id: 0, login: "" });
    const [roomsConversData, setroomsConversData] = useState({ name: "", id: 0 });
    const [oldAff, setOldAff] = useState("");
    const [oldAffRoomsConvers, setOldAffRoomConvers] = useState("");

    const [matchesHistory, setMatchesHistory] = useState(Array<any>);
    const [leaderBoardUsers, setLeaderBoardUsers] = useState(Array<any>);

    const [rankImage, setRankImage] = useState("");
    const [userProfileLogin, setUserProfileLogin] = useState("");

    const [userParameterAff, setUserParameterAff] = useState(false);
    const [userParameterNewProfilePicture, setUserParameterNewProfilePicture] = useState<null | any>(null)
    const [userParameterNewNickname, setUserParameterNewNickname] = useState(persistantReducer.userReducer.user?.nickname)
    const [userParameter2FAQrCode, setUserParameter2FAQrCode] = useState("");
    const [userParameter2FACode, setUserParameter2FACode] = useState("");
    const [userParameter2FARes, setUserParameter2FARes] = useState(0);
    const [userParameter2FAStatus, setUserParameter2FAStatus] = useState("Please enter the code above.");
    const [userParameter2FADeactivate, setUserParameter2FADeactivate] = useState(false);


    
    return (
        <>
            <NavBar/>
			<div className="homepage">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
					<a href='/Pong'><path href='/Pong' fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" /></a>
				</svg>
			</div>
		</>
	)
};

export default HomePage;