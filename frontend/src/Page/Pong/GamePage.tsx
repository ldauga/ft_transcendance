import React, { useState } from 'react';
import Navbar from '../../Module/Navbar/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../State';
import { gameRoomClass } from './gameRoomClass';

import './CSS/GamePage/GamePage.css';
import './CSS/GamePage/Board.css';
import './CSS/Utils.css';
import Background from '../../Module/Background/Background';
import { Tab } from '@mui/material';


var canvas = {
    "width": 800,
    "height": 600
}


const GamePage = (props: any) => {

    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [finishGame, setFinishGame] = useState(false);
    const [finishRoom, setFinishRoom] = useState<gameRoomClass | undefined>(undefined);

    // drawFont : desine le fond du jeu
    function drawFont(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.fillStyle = 'rgb(245, 246, 247)';

            ctx.fillRect(0, 0, canvas.width, canvas.height);

        }
    }

    // drawObstacle : desine les obstacles du jeu
    function drawObstacle(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            for (let index = 0; index < room.map.obstacles.length; index++) {
                const element = room.map.obstacles[index];

                ctx.fillStyle = 'rgb(48, 56, 76)';

                ctx.fillRect(element.x, element.y, element.width, element.height);
            }
        }
    }

    function drawBallParticles(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            for (var index = room.ball.particle_x.length - 1; index >= 0; index--) {

                ctx.beginPath();

                ctx.fillStyle = '#00' + ((255 - ((index) * (256 / 16))).toString(16).length == 1 ? "0" + (255 - ((index) * (256 / 16))).toString(16) : (255 - ((index) * (256 / 16))).toString(16)) + '00';

                ctx.arc(room.ball.particle_x[index], room.ball.particle_y[index], room.ball.radius, 0, Math.PI * 2);

                ctx.fill();

            }
        }
    }

    // drawBall : dessine la balle en fonction de sa position
    function drawBall(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.fillStyle = 'rgb(48, 56, 76)';

            ctx.arc(room.ball.x, room.ball.y, room.ball.radius, 0, Math.PI * 2);

            ctx.fill();

            ctx.shadowBlur = 0;

        }
    }

    // drawPlayers : dessine les joueurs suivant leurs positions
    function drawPlayers(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            const currentPlayer = room.players.find(item => item.user?.login == persistantReducer.userReducer.user?.login)

            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = "center";

            ctx.fillText("YOU", currentPlayer!.x + currentPlayer!.width / 2, currentPlayer!.y - 10);

            ctx.fillStyle = 'rgb(48, 56, 76)';

            ctx.fillRect(room.players[0].x, room.players[0].y, room.players[0].width, room.players[0].height);

            ctx.fillStyle = 'rgb(48, 56, 76)';

            ctx.fillRect(room.players[1].x, room.players[1].y, room.players[1].width, room.players[1].height);

            ctx.shadowBlur = 0;


        }
    }

    // drawScore : dessine les scores des deux joueurs
    function drawScore(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.textAlign = 'center';
            ctx.font = '50px Arial';

            ctx.fillStyle = 'black'
            ctx.fillText(room.players[0].score.toString(), canvas.width / 4 + canvas.width / 16, canvas.height / 10);

            ctx.fillStyle = 'black'
            ctx.fillText(room.players[1].score.toString(), (canvas.width / 4 * 3) - canvas.width / 16, canvas.height / 10);

        }
    }

    // drawLimitsMove : dessine les limitations de mouveùent des deux joueurs (les deux lignes sous les joueurs)
    function drawLimitsMove(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgb(48, 56, 76)';

            ctx.moveTo(canvas.width / 8, 0);
            ctx.lineTo(canvas.width / 8, canvas.height);

            ctx.moveTo((canvas.width / 8) * 7, 0);
            ctx.lineTo((canvas.width / 8) * 7, canvas.height);

            ctx.stroke();
            ctx.fill();

        }
    }

    // drawLimitCamps : dessine la limitation des deux camps (la grande ligne en pointillé au centre du plateau)
    function drawLimitCamps(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgb(48, 56, 76)';
            ctx.setLineDash([canvas.height / 30, canvas.height / 120]);

            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);

            ctx.stroke();

            ctx.setLineDash([]);
        }
    }

    // drawText : dessine "Press ENTER to play" au centre de l'écran
    function drawText(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.font = 'bold 50px Arial';
            ctx.fillStyle = 'rgb(48, 56, 76)';
            ctx.textAlign = "center";

            if (!room.players[0].connected || !room.players[1].connected) {
                ctx.fillText("Oponent disconected.", canvas.width / 2, canvas.height / 3);
                ctx.fillText((15 - Math.floor((Date.now() - room.players[room.players[0].connected ? 1 : 0].dateDeconnection) / 1000)).toString(), canvas.width / 2, canvas.height / 2);
            }
            else
                ctx.fillText("Press ENTER to play !", canvas.width / 2, canvas.height / 2);

            ctx.fillStyle = 'black';

            ctx.fillRect(canvas.width / 6 - canvas.width / 48, canvas.height / 8 * 5, canvas.width / 3, canvas.height / 8);
            ctx.fillRect(canvas.width / 6 * 3 + canvas.width / 48, canvas.height / 8 * 5, canvas.width / 3, canvas.height / 8);

            ctx.fillStyle = (room.players[0].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)');

            ctx.fillRect(canvas.width / 6 - canvas.width / 48 + 5, canvas.height / 8 * 5 + 5, canvas.width / 3 - 10, canvas.height / 8 - 10);

            ctx.fillStyle = (room.players[1].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)');

            ctx.fillRect(canvas.width / 6 * 3 + canvas.width / 48 + 5, canvas.height / 8 * 5 + 5, canvas.width / 3 - 10, canvas.height / 8 - 10);

            ctx.font = 'bold 50px Arial';
            ctx.textAlign = "center";

            if (room.players[0].user!.login == persistantReducer.userReducer.user!.login) {

                ctx.fillStyle = !room.players[0].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("YOU", canvas.width / 6 - canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
                ctx.fillStyle = !room.players[1].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("HIM", canvas.width / 6 * 3 + canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
            }
            else {
                ctx.fillStyle = !room.players[1].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("YOU", canvas.width / 6 * 3 + canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
                ctx.fillStyle = !room.players[0].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("HIM", canvas.width / 6 - canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
            }
        }
    }

    function drawSpectator(room: gameRoomClass) {

        room.spectate.forEach((item: any) => {
            var canvas: HTMLCanvasElement | null
            if (item.pannel)
                canvas = document.getElementById('spectate1') as HTMLCanvasElement
            else
                canvas = document.getElementById('spectate2') as HTMLCanvasElement
            if (canvas !== null) {
                var ctx = canvas.getContext('2d')
                if (ctx !== null) {
                    const img = new Image();

                    img.onload = function () {
                        if (ctx) {

                            ctx.save()
                            ctx.beginPath()
                            ctx.arc(item.x, item.y, 40, 0, Math.PI * 2, false)
                            ctx.stroke()
                            ctx.clip()
                            ctx.drawImage(img, item.x - 40, item.y - 40, 80, 80)
                            ctx.restore()
                        }
                    };
                    img.src = item.user.profile_pic
                }
            }
        })
    }


    function resetCanvas() {
        var canvas = document.getElementById('pongBoard') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }
    }

    const utilsData = useSelector((state: RootState) => state.utils);

    var interval = setInterval(() => { if (!finishGame) utilsData.socket.emit('RENDER', props.roomID) }, 10);

    function render(room: gameRoomClass) {

        var canvas = document.getElementById('pongBoard') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {

                resetCanvas()

                // drawSpectator(room)

                drawFont(ctx, room)

                drawLimitsMove(ctx)

                if (room.players[0].ready && room.players[1].ready) {
                    drawLimitCamps(ctx)


                    drawObstacle(ctx, room)
                }

                drawScore(ctx, room)


                if (!room.players[0].ready || !room.players[1].ready) {
                    drawText(ctx, room)
                    return
                }


                // drawBallParticles(ctx, room)

                drawBall(ctx, room)

                drawPlayers(ctx, room)

            }
        }
    }

    utilsData.socket.on('render', render);

    utilsData.socket.on('finish', (room: gameRoomClass) => {
        utilsData.socket.emit('RENDER', props.roomID)
        setFinishGame(true)

        setFinishRoom(room)

    });

    let verifKey = false

    function onKeyDown(e: any) {
        if (e.key === 'ArrowUp')
            utilsData.socket.emit('ARROW_UP', [props.roomID, true]);
        if (e.key === 'ArrowDown')
            utilsData.socket.emit('ARROW_DOWN', [props.roomID, true]);
        if (e.key === 'Enter') {
            utilsData.socket.emit('ENTER', [props.roomID, true]);
        }
        if (e.key === ' ')
            utilsData.socket.emit('SPACE', [props.roomID, true]);
    }

    // Lance la fonction onKeyDown chaque fois qu'une touche est appuyée
    document.addEventListener("keydown", (e) => onKeyDown(e));

    function onKeyUp(e: any) {
        if (e.key === 'ArrowUp')
            utilsData.socket.emit('ARROW_UP', [props.roomID, false]);
        if (e.key === 'ArrowDown')
            utilsData.socket.emit('ARROW_DOWN', [props.roomID, false]);
        if (e.key === ' ')
            utilsData.socket.emit('SPACE', [props.roomID, false]);
    }

    // Lance la fonction onKeyDown chaque fois qu'une touche est relachée
    document.addEventListener("keyup", onKeyUp);

    const [tabValue, setTabValue] = useState('1')

    function affFinishScreen() {

        let U, H;

        if (finishRoom?.players[0].user?.login == persistantReducer.userReducer.user?.login) {
            U = finishRoom?.players[0]
            H = finishRoom?.players[1]
        } else {
            U = finishRoom?.players[1]
            H = finishRoom?.players[0]
        }

        return (
            <div className='finishGameScreen'>

                <div className="finishMsg">
                    <span>
                        {U?.score == 3 ? 'VICTORY' : 'DEFEAT'}
                    </span>
                </div>

                <div className="versusContainer">

                    <div className="playerContainer">

                        <div className={U?.score == 3 ? 'profile_pic winner' : 'profile_pic looser'}>
                            <img src={U?.user?.profile_pic} />
                        </div>

                        <div className="name">
                            <span>
                                {U?.user?.nickname}
                            </span>
                        </div>

                        <div className="name">
                            <span>
                                {U?.score}
                            </span>
                        </div>

                    </div>

                    <div className="vs">
                        <span>VS</span>
                    </div>

                    <div className="playerContainer">

                        <div className={H?.score == 3 ? 'profile_pic winner' : 'profile_pic looser'}>
                            <img src={H?.user?.profile_pic} />
                        </div>

                        <div className="name">
                            <span>
                                {H?.user?.nickname}
                            </span>
                        </div>

                        <div className="name">
                            <span>
                                {H?.score}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="buttonContainer">

                    <button onClick={() => {window.location.replace('http://localhost:3000/pong')}} >Replay</button>
                    <button onClick={() => {history.pushState({}, '', window.URL.toString()); window.location.replace('http://localhost:3000/')}} >Home Page</button>

                </div>

            
            </div>
        )

    }

    return (
        <div className="mainDiv">
            <Navbar />
            <Background />
            {
                !finishGame ?
                    <div className="boardDiv">
                        <div className="blocksContainerCenter">
                            <canvas id='spectate1'
                                className='spectate'
                                height='1000'
                                width='400'
                            />
                            <canvas
                                id='pongBoard'
                                className='pongBoard'
                                height={canvas.height}
                                width={canvas.width}
                            />
                            <canvas id='spectate2'
                                className='spectate'
                                height='1000'
                                width='400'
                            />
                        </div>
                    </div>
                    :
                    <>{affFinishScreen()}</>
            }
        </div>
    );
};

export default GamePage;