import React, { useEffect, useState } from 'react';
import GamePage from './GamePage';
import { useSelector } from 'react-redux';
import { RootState } from '../../State';
import PongHome from './PongHome';
import CreateMapTemp from './CreateMapTemp';

const GameSwitch = () => {
    const [gameStart, setGameStart] = useState(false);
    const [createMap, setCreateMap] = useState(false);
    const [verif, setVerif] = useState(false);
    const [spectate, setSpectate] = useState(false);
    const [specID, setSpecID] = useState("atourret");
    const [roomID, setRoomID] = useState("");
    const [gameMap, setGameMap] = React.useState('map1');

    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const utilsData = useSelector((state: RootState) => state.utils);


    if (!verif) {
        setVerif(true)
        utilsData.socket.emit('CHECK_RECONNEXION', { user: persistantReducer.userReducer.user })
    }

    if (gameStart)
        return (
            <GamePage gameStart={gameStart} spectate={spectate} setGameStart={setGameStart} roomID={roomID} />
        )
    if (createMap)
        return (
            <CreateMapTemp
                setGameStart={setGameStart}
                setRoomID={setRoomID}
            />
        )
    else
        return (
            <PongHome
                gameStart={gameStart}
                setGameStart={setGameStart}
                setVerif={setVerif}
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
