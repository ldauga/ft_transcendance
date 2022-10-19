import React from 'react';
import './Homepage.scss';
import NavBar from '../../Module/Navbar/Navbar';

export const constWhileSecu = 10;

function HomePage() {
    return (
        <>
            <NavBar />
            <div className="homepage">
                <div className="field">
                    <div className="net"></div>
                    <div className="ping-racket"></div>
                    <div className="pong-racket"></div>
                    <div className="ball"></div>
                </div>
                <button onClick={ () => location.href='/pong'}>Play !</button>
            </div>
        </>
    )
};

export default HomePage;