import React from 'react';
import './Homepage.scss';
import NavBar from '../../Module/Navbar/Navbar';
import Background from '../../Module/Background/Background';
import { Tooltip } from '@mui/material';

export const constWhileSecu = 10;

function HomePage() {
    return (
        <>
            <NavBar openFriendConversFromProfile={false} dataFriendConversFromProfile={{ id: 0, login: "", nickname: "", profile_pic: "" }} setOpenFriendConversFromProfile={() => { }} />
            <Background />
            <div className="homepage">
                <div className="field">
                    <div className="net"></div>
                    <div className="ping-racket"></div>
                    <div className="pong-racket"></div>
                    <div className="ball"></div>
                </div>
                <Tooltip title='Play for the gloire'>
                <button onClick={() => location.href = '/pong'}>Play !</button>
                </Tooltip>
            </div>
        </>
    )
};

export default HomePage;