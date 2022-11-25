import React, { useEffect, useState } from 'react';
import NavBar from '../../Module/Navbar/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../State';
import { gameRoomClass } from './gameRoomClass';

import './CSS/GamePage/GamePage.css';
import './CSS/GamePage/Board.css';
import './CSS/GamePage/GameFinished.scss';
import './CSS/Utils.css';
import Background from '../../Module/Background/Background';

var canvas = {
    "width": 800,
    "height": 600
}


const GamePage = (props: any) => {

    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [finishGame, setFinishGame] = useState(false);
    const [finishRoom, setFinishRoom] = useState<gameRoomClass | undefined>(undefined);

    function drawFont(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.fillStyle = 'rgb(245, 246, 247)';

            ctx.fillRect(0, 0, canvas.width, canvas.height);

        }
    }

    function drawObstacle(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            for (let index = 0; index < room.map.obstacles.length; index++) {
                const element = room.map.obstacles[index];

                ctx.fillStyle = 'rgb(48, 56, 76)';

                ctx.fillRect(element.x, element.y, element.width, element.height);
            }
        }
    }

    function drawBall(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.fillStyle = 'rgb(48, 56, 76)';

            ctx.arc(room.ball.x, room.ball.y, room.ball.radius, 0, Math.PI * 2);

            ctx.fill();

            ctx.shadowBlur = 0;

        }
    }

    function drawPlayers(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            const currentPlayer = room.players.find(item => item.user?.login == persistantReducer.userReducer.user?.login)

            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = "center";

            if (currentPlayer != undefined)
                ctx.fillText("YOU", currentPlayer!.x + currentPlayer!.width / 2, currentPlayer!.y - 10);

            ctx.fillStyle = 'rgb(48, 56, 76)';

            ctx.fillRect(room.players[0].x, room.players[0].y, room.players[0].width, room.players[0].height);

            ctx.fillStyle = 'rgb(48, 56, 76)';

            ctx.fillRect(room.players[1].x, room.players[1].y, room.players[1].width, room.players[1].height);

            ctx.shadowBlur = 0;


        }
    }

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

    function drawText(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.font = 'bold 50px Arial';
            ctx.fillStyle = 'rgb(48, 56, 76)';
            ctx.textAlign = "center";

            if (!room.players[0].connected || !room.players[1].connected) {
                ctx.fillText("Opponent disconnected.", canvas.width / 2, canvas.height / 3);
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

    function render(room: gameRoomClass) {

        var canvas = document.getElementById('pongBoard') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {

                resetCanvas()

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

                drawBall(ctx, room)

                drawPlayers(ctx, room)

            }

        }

    }

    utilsData.socket.on('render', function (room: gameRoomClass) {
        render(room)
    });

    utilsData.socket.on('finish', (room: gameRoomClass) => {
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
        if (e.key === '+')
            utilsData.socket.emit('PLUS', [props.roomID, true]);
        if (e.key === '-')
            utilsData.socket.emit('MINUS', [props.roomID, true]);
    }



    function onKeyUp(e: any) {
        if (e.key === 'ArrowUp')
            utilsData.socket.emit('ARROW_UP', [props.roomID, false]);
        if (e.key === 'ArrowDown')
            utilsData.socket.emit('ARROW_DOWN', [props.roomID, false]);
        if (e.key === ' ')
            utilsData.socket.emit('SPACE', [props.roomID, false]);
        if (e.key === '+')
            utilsData.socket.emit('PLUS', [props.roomID, false]);
        if (e.key === '-')
            utilsData.socket.emit('MINUS', [props.roomID, false]);
    }



    const [tabValue, setTabValue] = useState('1')

    function affFinishScreen() {

        let U, H;
        setTimeout(function () {
            window.location.replace('https://localhost:3000');
        }, 5000);

        if (finishRoom?.players[0].user?.login == persistantReducer.userReducer.user?.login) {
            U = finishRoom?.players[0]
            H = finishRoom?.players[1]
        } else {
            U = finishRoom?.players[1]
            H = finishRoom?.players[0]
        }

        return (
            <div className='game-finished'>
                <h1>{U?.score === 3 ? 'Victory' : 'Defeat'}</h1>
                <div className='result'>
                    <span>
                        <img src={U?.user?.profile_pic} />
                        {U?.user?.nickname}
                    </span>
                    <span>
                        {U?.score} - {H?.score}
                    </span>
                    <span>
                        {H?.user?.nickname}
                        <img src={H?.user?.profile_pic} />
                    </span>
                </div>
            </div>
        )

    }

    const [verif, setVerif] = useState(false)

    useEffect(() => {
        if (!verif) {
            document.addEventListener("keydown", (e) => onKeyDown(e));
            document.addEventListener("keyup", onKeyUp);
            setVerif(true);
        }
    })

    return (
        <div className="mainDiv">
            <NavBar openFriendConversFromProfile={false} dataFriendConversFromProfile={{ id: 0, login: "", nickname: "", profile_pic: "" }} setOpenFriendConversFromProfile={() => { }} />
            <Background />
            {
                !finishGame ?
                    <div className="boardDiv">
                        <div className="blocksContainerCenter">
                            <canvas
                                id='pongBoard'
                                className='pongBoard'
                                height={canvas.height}
                                width={canvas.width}
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
