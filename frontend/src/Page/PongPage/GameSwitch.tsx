import React, { useEffect, useState } from 'react';
import JoinRoom from './JoinQueue';
import GamePage from './GamePage';
import CreateMap from './CreateMap';
import { useSelector } from 'react-redux';
import { RootState } from '../../State';

let checkReconnexion = false

const GameSwitch=() => {
    const [gameStart, setGameStart] = useState(false);
    const [createMap, setCreateMap] = useState(false);
    // const [checkReconnexion, setCheckReconnexion] = useState(false);
    const [specID, setSpecID] = useState("atourret");
    const [roomID, setRoomID] = useState("");
    const [gameMap, setGameMap] = React.useState("");

    const userData = useSelector((state: RootState) => state.user);
    const utilsData = useSelector((state: RootState) => state.utils);


    // useEffect(() => {
        if (!checkReconnexion) {
            checkReconnexion = true
            console.log('oui')
            utilsData.socket.emit('CHECK_RECONNEXION', {user: userData.user})
        }

    // })

    if (gameStart)
        return (
            <GamePage gameStart={gameStart} setGameStart={setGameStart} roomID={roomID} />
        )
    if (createMap)
        return (
            <CreateMap
                setGameStart={setGameStart}
                setRoomID={setRoomID}
            />
        )
    else
        return (
            <JoinRoom
                gameStart={gameStart}
                setGameStart={setGameStart}
                setRoomID={setRoomID}
                specID={specID}
                setSpecID={setSpecID}
                gameMap={gameMap}
                setGameMap={setGameMap}
                createMap={createMap}
                setCreateMap={setCreateMap}
                />
        )
}

export default GameSwitch;
