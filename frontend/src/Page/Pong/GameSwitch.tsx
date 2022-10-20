import React, { useEffect, useState } from 'react';
import GamePage from './GamePage';
import { useSelector } from 'react-redux';
import { RootState } from '../../State';
import PongHome from './PongHome';
import CreateMapTemp from './CreateMapTemp';

let checkReconnexion = false

const GameSwitch=() => {
    const [gameStart, setGameStart] = useState(false);
    const [createMap, setCreateMap] = useState(false);
    // const [checkReconnexion, setCheckReconnexion] = useState(false);
    const [specID, setSpecID] = useState("atourret");
    const [roomID, setRoomID] = useState("");
    const [gameMap, setGameMap] = React.useState('map1');

    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const utilsData = useSelector((state: RootState) => state.utils);


    // useEffect(() => {
        if (!checkReconnexion) {
            checkReconnexion = true
            console.log('oui')
            utilsData.socket.emit('CHECK_RECONNEXION', {user: persistantReducer.userReducer.user})
        }

    // })

    if (gameStart)
        return (
            <GamePage gameStart={gameStart} setGameStart={setGameStart} roomID={roomID} />
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
                setRoomID={setRoomID}
                specID={specID}
                setSpecID={setSpecID}
                gameMap={gameMap}
                setGameMap={setGameMap}
                createMap={createMap}
                setCreateMap={setCreateMap}
            />
            // <JoinRoom
            //     gameStart={gameStart}
            //     setGameStart={setGameStart}
            //     setRoomID={setRoomID}
            //     specID={specID}
            //     setSpecID={setSpecID}
            //     gameMap={gameMap}
            //     setGameMap={setGameMap}
            //     createMap={createMap}
            //     setCreateMap={setCreateMap}
            //     />
        )
}

export default GameSwitch;
