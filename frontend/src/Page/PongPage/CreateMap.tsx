import Navbar from "../../Module/Navbar/Navbar";

import './CSS/CreateMap/Div.css'
import './CSS/CreateMap/Canvas.css'
import './CSS/CreateMap/Parameter.css'
import './CSS/Utils.css'
import { Ball, gameRoomClass, Obstacle } from "./gameRoomClass";
import { KeyboardEventHandler, useEffect, useState } from "react";
import { render } from "react-dom";
import { RootState } from "../../State";
import { useSelector } from "react-redux";

var canvas = {
    "width": 800,
    "height": 600
}


const CreateMap = (props: any) => {
    const userData = useSelector((state: RootState) => state.user);

    const [room] = useState(new gameRoomClass("", "", null, "custom"));

    room.setOponnent("", null)

    function resetCanvas(ctx: CanvasRenderingContext2D) {
        if (ctx != null) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    function drawFont(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {

            ctx.fillStyle = room.map.mapColor;

            ctx.fillRect(0, 0, canvas.width, canvas.height);

        }
    }

    function drawLimitCamps(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.lineWidth = 3;
            ctx.strokeStyle = '#3A3935';
            ctx.setLineDash([canvas.height / 30, canvas.height / 120]);

            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);

            ctx.stroke();

            ctx.setLineDash([]);
        }
    }

    function drawLimitsMove(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.lineWidth = 1;
            ctx.strokeStyle = '#3A3935';

            ctx.moveTo(canvas.width / 8, 0);
            ctx.lineTo(canvas.width / 8, canvas.height);

            ctx.moveTo((canvas.width / 8) * 7, 0);
            ctx.lineTo((canvas.width / 8) * 7, canvas.height);

            ctx.stroke();
            ctx.fill();

        }
    }

    function drawObstacle(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {


            for (let index = 0; index < room.map.obstacles.length; index++) {
                const element = room.map.obstacles[index];

                if (actualObstacleID != element.id) {
                    ctx.fillStyle = element.color;

                    ctx.fillRect(element.x, element.y, element.width, element.height);
                }
            }
        }
    }

    function drawSelectedObstacle(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {


            for (let index = 0; index < room.map.obstacles.length; index++) {
                const element = room.map.obstacles[index];

                if (actualObstacleID == element.id) {
                    ctx.fillStyle = element.color;

                    ctx.fillRect(element.x, element.y, element.width, element.height);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x + element.width / 2 - 5, element.y - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x + element.width / 2 - 4, element.y - 4, 8, 8);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x + element.width / 2 - 5, element.y + element.height - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x + element.width / 2 - 4, element.y + element.height - 4, 8, 8);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x + element.width - 5, element.y + element.height / 2 - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x + element.width - 4, element.y + element.height / 2 - 4, 8, 8);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x - 5, element.y + element.height / 2 - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x - 4, element.y + element.height / 2 - 4, 8, 8);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x - 5, element.y - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x - 4, element.y - 4, 8, 8);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x + element.width - 5, element.y + element.height - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x + element.width - 4, element.y + element.height - 4, 8, 8);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x + element.width - 5, element.y - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x + element.width - 4, element.y - 4, 8, 8);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(element.x - 5, element.y + element.height - 5, 10, 10);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(element.x - 4, element.y + element.height - 4, 8, 8);

                }
            }
        }
    }

    function drawScore(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.textAlign = 'center';
            ctx.font = '50px Arial';

            ctx.fillStyle = 'red'
            ctx.fillText(room.players[0].score.toString(), canvas.width / 4 + canvas.width / 16, canvas.height / 10);

            ctx.fillStyle = 'blue'
            ctx.fillText(room.players[1].score.toString(), (canvas.width / 4 * 3) - canvas.width / 16, canvas.height / 10);

        }
    }

    function drawPlayers(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {
            ctx.fillStyle = 'red';
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'red';

            ctx.fillRect(room.players[0].x, room.players[0].y, room.players[0].width, room.players[0].height);

            ctx.fillStyle = 'blue';
            ctx.shadowColor = 'blue';

            ctx.fillRect(room.players[1].x, room.players[1].y, room.players[1].width, room.players[1].height);

            ctx.shadowBlur = 0;
        }
    }

    function drawBall(ctx: CanvasRenderingContext2D | null, room: gameRoomClass) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.shadowBlur = 20;

            ctx.fillStyle = 'green';
            ctx.shadowColor = 'green';

            room.map.obstacles.forEach((item) => {
                if (checkCollisionsBall(room.ball, item)) {
                    ctx.fillStyle = 'red';
                    ctx.shadowColor = 'red';

                    var button = document.getElementById('inviteButton')
                    if (button) {
                        button.style.backgroundColor = 'red'
                        button.textContent = 'Move ball first'
                    }

                }
            })

            ctx.arc(room.ball.x, room.ball.y, room.ball.radius, 0, Math.PI * 2);

            ctx.fill();

            ctx.shadowBlur = 0;

        }
    }

    function render() {
        var button = document.getElementById('inviteButton')
        if (button) {
            button.style.backgroundColor = 'blue'
            button.textContent = (declineInvite[0] ? declineInvite[1] + " declines your invitation" : "Invite player")
        }

        var canvas = document.getElementById('canvas') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {

                drawFont(ctx)

                drawLimitCamps(ctx)

                drawLimitsMove(ctx)

                drawObstacle(ctx, room)

                drawSelectedObstacle(ctx, room)

                drawPlayers(ctx, room)

                drawScore(ctx, room)

                drawBall(ctx, room)

            }
        }
    }

    const [nbObstacle, setNbObstacle] = useState(0)

    useEffect(() => {

        setInputValue()

        for (let index = 0; index < room.map.obstacles.length; index++) {
            if (lastObstacleID == room.map.obstacles[index].id)
                room.map.obstacles[index].color = 'gray'
            if (actualObstacleID == room.map.obstacles[index].id)
                room.map.obstacles[index].color = '#003300'
        }

        render()

    })

    function setInputValue() {
        for (let index = 0; index < room.map.obstacles.length; index++) {
            if (actualObstacleID == room.map.obstacles[index].id) {
                setXInput(room.map.obstacles[index].x)
                setYInput(room.map.obstacles[index].y)
                setWidthInput(room.map.obstacles[index].width)
                setHeightInput(room.map.obstacles[index].height)
            }
        }
    }

    const [lastObstacleID, setlastObstacleID] = useState(0);
    const [actualObstacleID, setActualObstacleID] = useState(0);
    const [xInput, setXInput] = useState(0);
    const [yInput, setYInput] = useState(0);
    const [widthInput, setWidthInput] = useState(0);
    const [heightInput, setHeightInput] = useState(0);

    const [holdClick, setHoldClick] = useState(false);
    const [holdClickDiff] = useState({ "diffX": 0, "diffY": 0 });
    const [holdClickExpand, setHoldClickExpand] = useState(0);

    function checkHoldClickExpandCollision(cursorX: number, cursorY: number,): boolean {
        for (let index = 0; index < room.map.obstacles.length; index++) {
            const element = room.map.obstacles[index];
            if (actualObstacleID == element.id) {
                if (cursorX >= element.x - 5 && cursorX <= element.x + 5 && cursorY >= element.y - 5 && cursorY <= element.y + 5) {
                    setHoldClickExpand(1)
                    return true
                }
                else if (cursorX >= element.x + element.width / 2 - 5 && cursorX <= element.x + element.width / 2 + 5 && cursorY >= element.y - 5 && cursorY <= element.y + 5) {
                    setHoldClickExpand(2)
                    return true
                }
                else if (cursorX >= element.x + element.width - 5 && cursorX <= element.x + element.width + 5 && cursorY >= element.y - 5 && cursorY <= element.y + 5) {
                    setHoldClickExpand(3)
                    return true
                }
                else if (cursorX >= element.x + element.width - 5 && cursorX <= element.x + element.width + 5 && cursorY >= element.y + element.height / 2 - 5 && cursorY <= element.y + element.height / 2 + 5) {
                    setHoldClickExpand(4)
                    return true
                }
                else if (cursorX >= element.x + element.width - 5 && cursorX <= element.x + element.width + 5 && cursorY >= element.y + element.height - 5 && cursorY <= element.y + element.height + 5) {
                    setHoldClickExpand(5)
                    return true
                }
                else if (cursorX >= element.x + element.width / 2 - 5 && cursorX <= element.x + element.width / 2 + 5 && cursorY >= element.y + element.height - 5 && cursorY <= element.y + element.height + 5) {
                    setHoldClickExpand(6)
                    return true
                }
                else if (cursorX >= element.x - 5 && cursorX <= element.x + 5 && cursorY >= element.y + element.height - 5 && cursorY <= element.y + element.height + 5) {
                    setHoldClickExpand(7)
                    return true
                }
                else if (cursorX >= element.x - 5 && cursorX <= element.x + 5 && cursorY >= element.y + element.height / 2 - 5 && cursorY <= element.y + element.height / 2 + 5) {
                    setHoldClickExpand(8)
                    return true
                }
            }
        }
        setHoldClickExpand(0)
        return false
    }

    function checkCollisionsObstacle(obstacle: Obstacle, cursorX: number, cursorY: number) {
        if (obstacle.width < 0 && obstacle.height < 0)
            return (cursorX < obstacle.x && cursorX > obstacle.x + obstacle.width && cursorY < obstacle.y && cursorY > obstacle.y + obstacle.height)
        else if (obstacle.width < 0)
            return (cursorX < obstacle.x && cursorX > obstacle.x + obstacle.width && obstacle.y < cursorY && obstacle.y + obstacle.height > cursorY)
        else if (obstacle.height < 0)
            return (obstacle.x < cursorX && obstacle.x + obstacle.width > cursorX && cursorY < obstacle.y && cursorY > obstacle.y + obstacle.height)
        else
            return (obstacle.x < cursorX && obstacle.x + obstacle.width > cursorX && obstacle.y < cursorY && obstacle.y + obstacle.height > cursorY)
    }

    function checkCollisionsActualObstacle(cursorX: number, cursorY: number) {
        for (let index = 0; index < room.map.obstacles.length; index++) {
            const element = room.map.obstacles[index];
            if (actualObstacleID == element.id) {
                if (element.width < 0 && element.height < 0)
                    return (cursorX < element.x && cursorX > element.x + element.width && cursorY < element.y && cursorY > element.y + element.height)
                else if (element.width < 0)
                    return (cursorX < element.x && cursorX > element.x + element.width && element.y < cursorY && element.y + element.height > cursorY)
                else if (element.height < 0)
                    return (element.x < cursorX && element.x + element.width > cursorX && cursorY < element.y && cursorY > element.y + element.height)
                else
                    return (element.x < cursorX && element.x + element.width > cursorX && element.y < cursorY && element.y + element.height > cursorY)
            }
        }
    }

    function checkCollisionsBall(ball: Ball, obstacle: Obstacle) {
        var otop = obstacle.y
        var obottom = obstacle.y + obstacle.height
        var oleft = obstacle.x
        var oright = obstacle.x + obstacle.width

        var btop = ball.y - ball.radius
        var bbottom = ball.y + ball.radius
        var bleft = ball.x - ball.radius
        var bright = ball.x + ball.radius

        return oleft < bright && otop < bbottom && oright > bleft && obottom > btop
    }

    function checkAllCollisionsBall(ball: Ball) {
        var btop = ball.y - ball.radius
        var bbottom = ball.y + ball.radius
        var bleft = ball.x - ball.radius
        var bright = ball.x + ball.radius

        var ret = false;

        room.map.obstacles.forEach((obstacle) => {

            var otop = obstacle.y
            var obottom = obstacle.y + obstacle.height
            var oleft = obstacle.x
            var oright = obstacle.x + obstacle.width

            if (oleft < bright && otop < bbottom && oright > bleft && obottom > btop)
                ret = true
        })
        return ret
    }

    function handleCanvasMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        var canvas = document.getElementById('canvas') as HTMLCanvasElement
        if (canvas != null) {
            var bound = canvas.getBoundingClientRect()
            let cursorX = (event.clientX - bound.left) / (bound.right - bound.left) * canvas.width
            let cursorY = (event.clientY - bound.top) / (bound.bottom - bound.top) * canvas.height

            if (Math.abs(Math.sqrt(Math.pow((cursorX - room.ball.x), 2) + Math.pow((cursorY - room.ball.y), 2))) < room.ball.radius) {
                setHoldClick(true)
                setlastObstacleID(actualObstacleID)
                setActualObstacleID(-666)
                holdClickDiff.diffX = cursorX - room.ball.x
                holdClickDiff.diffY = cursorY - room.ball.y
                return;
            }

            for (let index = 0; index < room.map.obstacles.length; index++) {
                if (checkCollisionsActualObstacle(cursorX, cursorY)) {
                    checkHoldClickExpandCollision(cursorX, cursorY)
                    setHoldClick(true)
                    for (let i = 0; i < room.map.obstacles.length; i++)
                        if (actualObstacleID == room.map.obstacles[i].id) {
                            holdClickDiff.diffX = cursorX - room.map.obstacles[i].x
                            holdClickDiff.diffY = cursorY - room.map.obstacles[i].y
                        }
                    return
                }
                else if (checkHoldClickExpandCollision(cursorX, cursorY)) {
                    setHoldClick(true)

                    holdClickDiff.diffX = cursorX - room.map.obstacles[index].x
                    holdClickDiff.diffY = cursorY - room.map.obstacles[index].y
                    return
                }
                else if (checkCollisionsObstacle(room.map.obstacles[index], cursorX, cursorY)) {
                    if (actualObstacleID != room.map.obstacles[index].id) {
                        setlastObstacleID(actualObstacleID)
                        setActualObstacleID(room.map.obstacles[index].id)
                    }
                    else (checkHoldClickExpandCollision(cursorX, cursorY))

                    setHoldClick(true)
                    holdClickDiff.diffX = cursorX - room.map.obstacles[index].x
                    holdClickDiff.diffY = cursorY - room.map.obstacles[index].y
                    return
                }
            }
            setlastObstacleID(actualObstacleID)
            setActualObstacleID(-1)
        }
    }

    function handleCanvasMouseUp(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        setHoldClick(false)
        setHoldClickExpand(0)
    }

    function dragNdrop(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        var canvas = document.getElementById('canvas') as HTMLCanvasElement
        if (canvas != null) {
            var bound = canvas.getBoundingClientRect()
            let cursorX = (event.clientX - bound.left) / (bound.right - bound.left) * canvas.width
            let cursorY = (event.clientY - bound.top) / (bound.bottom - bound.top) * canvas.height
            if (holdClick) {
                if (actualObstacleID === -666) {
                    room.ball.initial_x = room.ball.x = cursorX - holdClickDiff.diffX
                    room.ball.initial_y = room.ball.y = cursorY - holdClickDiff.diffY
                    
                    if (room.ball.initial_y < room.ball.radius)
                        room.ball.initial_y = room.ball.y = room.ball.radius
                    else if (room.ball.initial_y > room.canvas.height - room.ball.radius)
                        room.ball.initial_y = room.ball.y = room.canvas.height - room.ball.radius

                    render()
                }
                for (let index = 0; index < room.map.obstacles.length; index++) {
                    if (actualObstacleID == room.map.obstacles[index].id) {
                        var ctx = canvas.getContext('2d')
                        if (!holdClickExpand) {
                            room.map.obstacles[index].x = cursorX - holdClickDiff.diffX
                            room.map.obstacles[index].y = cursorY - holdClickDiff.diffY
                        }
                        else if (holdClickExpand == 1) {
                            room.map.obstacles[index].width = room.map.obstacles[index].width + room.map.obstacles[index].x - cursorX
                            room.map.obstacles[index].height = room.map.obstacles[index].height + room.map.obstacles[index].y - cursorY
                            room.map.obstacles[index].x = cursorX
                            room.map.obstacles[index].y = cursorY
                        }
                        else if (holdClickExpand == 2) {
                            room.map.obstacles[index].height = room.map.obstacles[index].height + room.map.obstacles[index].y - cursorY
                            room.map.obstacles[index].y = cursorY
                        }
                        else if (holdClickExpand == 3) {
                            room.map.obstacles[index].width = cursorX - room.map.obstacles[index].x
                            room.map.obstacles[index].height = room.map.obstacles[index].height + room.map.obstacles[index].y - cursorY
                            room.map.obstacles[index].y = cursorY
                        }
                        else if (holdClickExpand == 4) {
                            room.map.obstacles[index].width = cursorX - room.map.obstacles[index].x
                        }
                        else if (holdClickExpand == 5) {
                            room.map.obstacles[index].width = cursorX - room.map.obstacles[index].x
                            room.map.obstacles[index].height = cursorY - room.map.obstacles[index].y
                        }
                        else if (holdClickExpand == 6) {
                            room.map.obstacles[index].height = cursorY - room.map.obstacles[index].y
                        }
                        else if (holdClickExpand == 7) {
                            room.map.obstacles[index].height = cursorY - room.map.obstacles[index].y
                            room.map.obstacles[index].width = room.map.obstacles[index].width + room.map.obstacles[index].x - cursorX
                            room.map.obstacles[index].x = cursorX
                        }
                        else if (holdClickExpand == 8) {
                            room.map.obstacles[index].width = room.map.obstacles[index].width + room.map.obstacles[index].x - cursorX
                            room.map.obstacles[index].x = cursorX
                        }
                        render()
                        setInputValue()
                    }
                }
            }
        }
    }

    const [inviteInput, setInvitInput] = useState('')

    const utilsData = useSelector((state: RootState) => state.utils);

    const [declineInvite, setDeclineInvite] = useState([false, ""])

    utilsData.socket.on('decline_invitation', function (invitePlayer: any) {
        console.log('tete')
        setDeclineInvite([true, invitePlayer.login])
    })

    utilsData.socket.on('start', function (roomID: string) {
        props.setRoomID(roomID);
        props.setGameStart(true);
    });

    function inviteButtonClick() {
        if (!checkAllCollisionsBall(room.ball)) {
            utilsData.socket.emit('INVITE_CUSTOM', { user: userData.user, gameRoom: room, userLoginToSend: inviteInput })
        }
    }

    return (
        <div className='Font'>
            <Navbar />
            <main>
                <div className="canvasDiv">
                    <canvas
                        id='canvas'
                        className='createMapCanvas'
                        height={canvas.height}
                        width={canvas.width}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseMove={dragNdrop}
                    />
                </div>
                <div className="parameterDiv">
                    <div className="blocksContainerCollumn">
                        <div className="blocksContainerRow">
                            <button type="button" className='Button addObstacle' onClick={async () => {

                                setlastObstacleID(actualObstacleID)

                                room.map.addObstacle('red', actualObstacleID ? 100 : 50, 50, 50, 50, nbObstacle + 1)
                                setActualObstacleID(nbObstacle + 1)

                                setNbObstacle(nbObstacle + 1)

                            }}> Add obstacle </button>
                            <button type="button" className='Button delObstacle' onClick={async () => {

                                for (let index = 0; index < room.map.obstacles.length; index++) {
                                    const element = room.map.obstacles[index];
                                    if (actualObstacleID == element.id) {
                                        room.map.obstacles.splice(index, 1)
                                        setActualObstacleID(-1)
                                    }
                                }

                            }}> Del obstacle </button>
                        </div>
                        <div className="rangediv">
                            <input
                                className='rangeBar xInput'
                                type="range"
                                value={xInput}
                                min='0'
                                max={canvas.width - 1}
                                onChange={e => {
                                    for (let index = 0; index < room.map.obstacles.length; index++)
                                        if (actualObstacleID == room.map.obstacles[index].id)
                                            room.map.obstacles[index].x = Number(e.target.value)
                                    setXInput(Number(e.target.value))
                                }}>
                            </input>
                        </div>
                        <div className="rangediv">
                            <input
                                className='rangeBar yInput'
                                type="range"
                                value={yInput}
                                min='0'
                                max={canvas.height - 1}
                                onChange={e => {
                                    for (let index = 0; index < room.map.obstacles.length; index++)
                                        if (actualObstacleID == room.map.obstacles[index].id)
                                            room.map.obstacles[index].y = Number(e.target.value)
                                    setYInput(Number(e.target.value))
                                }}>
                            </input>
                        </div>
                        <div className="rangediv">
                            <input
                                className='rangeBar widthInput'
                                type="range"
                                value={widthInput}
                                min={-canvas.width}
                                max={canvas.width}
                                onChange={e => {
                                    for (let index = 0; index < room.map.obstacles.length; index++)
                                        if (actualObstacleID == room.map.obstacles[index].id)
                                            room.map.obstacles[index].width = Number(e.target.value)
                                    setWidthInput(Number(e.target.value))
                                }}>
                            </input>
                        </div>
                        <div className="rangediv">
                            <input
                                className='rangeBar heightInput'
                                type="range"
                                value={heightInput}
                                min={-canvas.height}
                                max={canvas.height}
                                onChange={e => {
                                    for (let index = 0; index < room.map.obstacles.length; index++)
                                        if (actualObstacleID == room.map.obstacles[index].id)
                                            room.map.obstacles[index].height = Number(e.target.value)
                                    setHeightInput(Number(e.target.value))
                                }}>
                            </input>
                        </div>
                        <input className="inviteBar" value={inviteInput} onChange={(e) => { setInvitInput(e.target.value); setDeclineInvite([false, ""]) }} onKeyDown={(event) => { if (event.key == 'Enter') inviteButtonClick() }} placeholder='ID of client to invite' />
                        <button
                            className="Button invite"
                            id="inviteButton"
                            onClick={inviteButtonClick}></button>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default CreateMap;