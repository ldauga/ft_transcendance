import React from 'react';
import './Homepage.scss';
import NavBar from '../../Module/Navbar/Navbar';
import Background from '../../Module/Background/Background';

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
                <button onClick={() => location.href = '/pong'}>Play !</button>
            </div>
        </>
    )
};

export default HomePage;