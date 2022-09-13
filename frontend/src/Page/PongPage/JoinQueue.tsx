import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../../Module/Navbar/Navbar';
import './../assets/Font.css';
import { useSelector } from "react-redux";
import { RootState } from '../../State';
import imageMap1 from "./map1.png";
import imageMap2 from "./map2.png";

import './CSS/JoinQueue/Spectate.css'
import './CSS/JoinQueue/Queue.css'
import './CSS/JoinQueue/Invite.css'
import './CSS/JoinQueue/ChooseMap.css'
import './CSS/JoinQueue/CreateMap.css'
import './CSS/GamePage/GamePage.css';
import './CSS/Utils.css'

const JoinRoom = (props: any) => {
    const [inQueue, setInQueue] = useState(false);
    const [NotFound, setNotFound] = useState(false);

    const utilsData = useSelector((state: RootState) => state.utils);
    const userData = useSelector((state: RootState) => state.user);

    // utilsData.socket.removeAllListeners();

    function joinQueue() {
        if (!props.gameMap)
            return
        utilsData.socket.emit('JOIN_QUEUE', { user: userData.user, gameMap: props.gameMap });
    }

    function spectate() {
        utilsData.socket.emit('SPECTATE_CLIENT', { specID: props.specID, user: userData.user });
    }

    utilsData.socket.on('clientNotFound', function () {
        props.setSpecID("");
        setNotFound(true);
    });

    utilsData.socket.on('joined', function () {
        setInQueue(true);
    });

    utilsData.socket.on('start', function (roomID: string) {
        props.setRoomID(roomID);
        props.setGameStart(true);
    });

    async function chooseMap(map: string) {
        props.setGameMap(map)
    }

    useEffect(() => {
        var map1Button = document.getElementById('map1Button')
        var map2Button = document.getElementById('map2Button')
        var map3Button = document.getElementById('map3Button')
        var map4Button = document.getElementById('map4Button')

        if (props.gameMap == "map1") {
            if (map1Button !== null)
                map1Button.style.backgroundColor = "green"
        } else {
            if (map1Button !== null)
                map1Button.style.backgroundColor = "#7d0000"
        }
        if (props.gameMap == "map2") {
            if (map2Button !== null)
                map2Button.style.backgroundColor = "green"
        } else {
            if (map2Button !== null)
                map2Button.style.backgroundColor = "#7d0000"
        }
        if (props.gameMap == "map3") {
            if (map3Button !== null)
                map3Button.style.backgroundColor = "green"
        } else {
            if (map3Button !== null)
                map3Button.style.backgroundColor = "#7d0000"
        }
        if (props.gameMap == "map4") {
            if (map4Button !== null)
                map4Button.style.backgroundColor = "green"
        } else {
            if (map4Button !== null)
                map4Button.style.backgroundColor = "#7d0000"
        }

        var button = document.getElementById('queueButton')
        if (!props.gameMap) {
            if (button !== null) {
                button.textContent = "Select map before..."
                return
            }
        }
        else if (!inQueue) {
            if (button !== null) {
                button.textContent = "Join queue..."
                return
            }
        }
        else {
            if (button !== null) {
                button.textContent = "Loading..."
                return
            }
        }

    });

    return (
        <div className='Font'>
            <Navbar />
            <main>
                <div className='blocksContainerRow'>
                    <div className="div50">
                        <div className="queueDiv">
                            <div className='blocksContainerCenter'>
                                <div className='blocksContainerRow'>
                                    <button type="button" id='map1Button' className='mapButton' onClick={() => { chooseMap("map1") }}>
                                        <img src={imageMap1} />
                                        <h3>Just color</h3>
                                    </button>
                                    <button type="button" id='map2Button' className='mapButton' onClick={() => { chooseMap("map2") }}>
                                        <img src={imageMap2} />
                                        <h3>Just color</h3>
                                    </button>
                                </div>
                            </div>
                            <div className='blocksContainerCenter'>
                                <div className='blocksContainerRow'>
                                    <button type="button" id='map3Button' className='mapButton' onClick={() => { chooseMap("map3") }}>
                                        <img src={imageMap1} />
                                        <h3>Obstacle</h3>
                                    </button>
                                    <button type="button" id='map4Button' className='mapButton' onClick={() => { chooseMap("map4") }}>
                                        <img src={imageMap2} />
                                        <h3>Obstacle</h3>
                                    </button>
                                </div>
                            </div>
                            <div className='blocksContainerCenter'>
                                <button id='queueButton' type="button" className='queueButton' onClick={() => joinQueue()} />
                            </div>
                        </div>
                    </div>
                    <div className="div50">
                        <div className="spectateDiv">
                            <div className='blocksContainerCenter'>
                                <input className='spectateInput' value={props.specID} onChange={e => props.setSpecID(e.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') spectate() }} placeholder={NotFound ? 'Client not playing...' : 'Client To Spectate'} ></input>
                            </div>
                            <div className='blocksContainerCenter'>
                                <button type="button" className='spectateButton' onClick={() => spectate()}> Spectate </button>
                            </div>
                        </div>
                        <div className="createMapDiv">
                            <div className='blocksContainerCenter'>
                                <button type="button" className='createMapButton' onClick={() => { props.setCreateMap(true) }}> Create map </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JoinRoom;