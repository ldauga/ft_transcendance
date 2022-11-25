export { Canvas, Player, gameRoomClass, Obstacle, Ball }

const STILL = 0
const MOTION = 1
const EXPAND = 2

class Canvas {
	width: number
	height: number

	constructor() {
		this.width = 800
		this.height = 600
	}
}

class Player {
	id: string

	user: {
		id: number,
		login: string,
		nickname: string,
		wins: number,
		looses: number,
		rank: number,
		profile_pic: string
	} | null

	connected: boolean
	sendNotif: boolean
	dateDeconnection: number

	width: number
	height: number

	down: boolean
	up: boolean

	cheat: boolean

	expansion: boolean
	reduce: boolean

	x: number
	y: number

	speed: number

	score: number

	ready: boolean

	constructor(canvas: Canvas, id: string = "", user: {
		id: number,
		login: string,
		nickname: string,
		wins: number,
		looses: number,
		rank: number,
		profile_pic: string
	} | null = null) {
		this.id = id
		this.user = user

		this.connected = false
		this.sendNotif = false
		this.dateDeconnection = 0

		this.width = canvas.width / 40
		this.height = canvas.height / 5

		this.down = false
		this.up = false

		this.cheat = false

		this.expansion = false
		this.reduce = false

		this.x = canvas.width / 8 - this.width / 2
		this.y = canvas.height / 2 - this.height / 2

		this.speed = 3

		this.score = 0

		this.ready = false

	}

	resetPos(canvas: Canvas) {
		this.width = canvas.width / 40
		this.height = canvas.height / 5

		this.down = false
		this.up = false

		this.x = canvas.width / 8 - this.width / 2
		this.y = canvas.height / 2 - this.height / 2

		this.speed = 3
	}

}

function random(min: number, max: number): number {
	return (Math.floor(Math.random() * (max - min + 1)) + min)
}

class Spectator {
	id: string

	user: {
		id: number,
		login: string,
		nickname: string,
		wins: number,
		looses: number,
		rank: number,
		profile_pic: string
	}

	pannel: boolean

	x: number
	y: number

	constructor(
		id: string,
		user: {
			id: number,
			login: string,
			nickname: string,
			wins: number,
			looses: number,
			rank: number,
			profile_pic: string
		}) {
		this.id = id

		this.user = user

		this.pannel = false

		this.x = 0
		this.y = 0

	}
}

class Ball {
	x: number
	y: number

	dx: number
	dy: number

	speed: number

	radius: number

	particle_x: Array<number>
	particle_y: Array<number>

	initial_x: number
	initial_y: number

	constructor(canvas: Canvas) {
		this.x = canvas.width / 2
		this.y = canvas.height / 2

		this.speed = 3
		
		this.dx = random(0, 1) ? -this.speed : this.speed
		
		this.dy = 0

		this.radius = 10

		this.particle_x = new Array()
		this.particle_y = new Array()

		this.initial_x = -1;
		this.initial_y = -1;
	}

	reset(canvas: Canvas) {
		if (this.initial_x < 0) {
			this.x = canvas.width / 2
			this.y = canvas.height / 2
		}
		else {
			this.x = this.initial_x
			this.y = this.initial_y
		}

		this.speed = 3

		this.dx = random(0, 1) ? -this.speed : this.speed
		this.dy = 0
		

		this.radius = 10

		while (this.particle_x.length) {
			this.particle_x.pop()
			this.particle_y.pop()
		}
	}

	addParticles(x: number, y: number) {
		if (this.particle_x.length && this.particle_x[0] - this.radius < x && this.particle_x[0] + this.radius >= x)
			return

		this.particle_x.unshift(x)
		this.particle_y.unshift(y)

		if (this.particle_x.length > 16)
			this.particle_x.pop()
		if (this.particle_y.length > 16)
			this.particle_y.pop()

	}
}

class Obstacle {
	color: string

	initialX: number
	initialY: number
	initialHeight: number

	x: number
	y: number

	width: number
	height: number

	state: number

	speed: number
	initialSpeed: number

	verif: number

	id: number

	constructor(color: string, x: number, y: number, width: number, height: number, state: number, speed: number = 0) {
		this.color = color

		this.width = width
		this.height = height
		this.initialHeight = height

		this.x = x
		this.initialX = x
		this.initialY = y
		this.y = y

		this.state = state

		this.speed = speed
		this.initialSpeed = speed

		this.verif = 0

		this.id = 0;
	}
}

class Map {

	mapColor: string

	obstacles: Array<Obstacle>

	constructor(gameMap: string, canvas: Canvas) {

		this.obstacles = new Array()

		this.mapColor = 'black'
		if (gameMap == 'custom') {
			this.mapColor = 'black'
			return
		}
		if (gameMap == 'map1')
			this.mapColor = 'black'
		else if (gameMap == 'map2') {
			this.mapColor = 'black'
			this.obstacles.push(new Obstacle("#4B4B4B", canvas.width / 2 - 10, canvas.height / 2 - 30, 20, 60, MOTION, 2))
		}
		else if (gameMap == 'map3') {
			this.mapColor = 'black'
			this.obstacles.push(new Obstacle("#4B4B4B", canvas.width / 2 - 10, canvas.height / 2 - 30, 20, 60, EXPAND, 1))
		}
	}

	resetObstaclesPos() {
		for (let index = 0; index < this.obstacles.length; index++) {
			this.obstacles[index].x = this.obstacles[index].initialX
			this.obstacles[index].y = this.obstacles[index].initialY
			this.obstacles[index].height = this.obstacles[index].initialHeight
			this.obstacles[index].speed = this.obstacles[index].initialSpeed
			this.obstacles[index].verif = 0
		}
	}

	addObstacle(color: string, x: number, y: number, width: number, height: number, id: number) {
		let length = this.obstacles.push(new Obstacle(color, x, y, width, height, STILL))
		this.obstacles[length - 1].id = id
	}

}

class gameRoomClass {
	roomID: string

	started: boolean
	firstConnectionInviteProfie: boolean

	map: Map

	players: Array<Player>

	spectate: Array<Spectator>

	canvas: Canvas

	ball: Ball

	constructor(roomId: string, creatorID: string, creatorUser: {
		id: number,
		login: string,
		nickname: string,
		wins: number,
		looses: number,
		rank: number,
		profile_pic: string
	} | null, gameMap: string) {
		this.roomID = roomId

		this.started = false
		this.firstConnectionInviteProfie = false

		this.canvas = new Canvas()

		this.map = new Map(gameMap, this.canvas)

		this.players = new Array()

		this.spectate = new Array()

		this.players.push(new Player(this.canvas, creatorID, creatorUser))
		this.players.push(new Player(this.canvas))

		this.ball = new Ball(this.canvas)

		if (gameMap == 'map2' || gameMap == 'map3')
			this.ball.x += (this.ball.dx > 0 ? -1 : 1) * 100

	}

	setOponnent(id: string, user: {
		id: number,
		login: string,
		nickname: string,
		wins: number,
		looses: number,
		rank: number,
		profile_pic: string
	} | null) {
		this.players[1].id = id
		this.players[1].user = user
		this.players[1].connected = true
		this.players[1].x = this.canvas.width / 8 * 7 - this.players[1].width / 2
	}

	checkCollisionSpectator(index: number, x: number, y: number): boolean {
		var ptop = y - 40
		var pbottom = y + 40
		var pleft = x - 40
		var pright = x + 40

		for (let i = 0; i < this.spectate.length; i++) {
			if (index != i) {
				var btop = this.spectate[i].y - 40
				var bbottom = this.spectate[i].y + 40
				var bleft = this.spectate[i].x - 40
				var bright = this.spectate[i].x + 40

				if (pleft < bright && ptop < bbottom && pright > bleft && pbottom > btop)
					return true
			}
		}

		return false
	}

	addSpectator(
		id: string,
		user: {
			id: number,
			login: string,
			nickname: string,
			wins: number,
			looses: number,
			rank: number,
			profile_pic: string
		}) {

		this.spectate.push(new Spectator(id, user))

		for (let i = 0; i < this.spectate.length; i++) {
			if (this.spectate[i].id == id) {
				var nbPannel1 = 0
				var nbPannel2 = 0
				for (let j = 0; j < i; j++)
					if (this.spectate[j].pannel)
						nbPannel1++;
					else
						nbPannel2++;

				if (nbPannel1 > nbPannel2)
					this.spectate[i].pannel = false
				else
					this.spectate[i].pannel = true

				this.spectate[i].x = random(90, 310)
				this.spectate[i].y = random(90, 910)

				var check = 0
				while (this.checkCollisionSpectator(i, this.spectate[i].x, this.spectate[i].y)) {
					if (check++ == 100) {
						this.spectate.splice(this.spectate.length, 1)
						break
					}
					this.spectate[i].x = random(90, 310)
					this.spectate[i].y = random(90, 910)
				}
			}
		}
	}

	movePlayer() {
		for (let i = 0; i < 2; i++) {
			if (this.players[i].cheat) {
				if (this.ball.y > this.players[i].y + this.players[i].height / 2)
					this.players[i].y += this.players[i].speed
				else if (this.ball.y < this.players[i].y + this.players[i].height / 2)
					this.players[i].y -= this.players[i].speed
			} else {
				if (this.players[i].up)
					if (this.players[i].y >= this.players[i].speed)
						this.players[i].y -= this.players[i].speed
				if (this.players[i].down)
					if (this.players[i].y + this.players[i].height < this.canvas.height)
						this.players[i].y += this.players[i].speed
				if (this.players[i].expansion)
					if (this.players[i].height < this.canvas.height)
						this.players[i].height++
				if (this.players[i].reduce)
					if (this.players[i].height > this.canvas.height / 6)
						this.players[i].height--
			}
		}
	}

	/*
	checkCollisionPlayer1 : retourne 1 si la balle rentre en collision avec le joueur 2
						retourne 0 si la balle ne rentre pas en collision avec le joueur 2
	*/
	checkCollisionPlayer(id: number): boolean {
		var ptop = this.players[id].y
		var pbottom = this.players[id].y + this.players[id].height
		var pleft = this.players[id].x
		var pright = this.players[id].x + this.players[id].width

		var btop = this.ball.y - this.ball.radius
		var bbottom = this.ball.y + this.ball.radius
		var bleft = this.ball.x - this.ball.radius
		var bright = this.ball.x + this.ball.radius

		return pleft < bright && ptop < bbottom && pright > bleft && pbottom > btop
	}

	checkCollisionObstacle(obstacle: Obstacle): boolean {

		const distX = Math.abs(this.ball.x - obstacle.x - obstacle.width / 2);
		const distY = Math.abs(this.ball.y - obstacle.y - obstacle.height / 2);

		if (distX > (obstacle.width / 2 + this.ball.radius)) {
			return false;
		}
		if (distY > (obstacle.height / 2 + this.ball.radius)) {
			return false;
		}

		if (distX <= (obstacle.width / 2)) {
			return true;
		}
		if (distY <= (obstacle.height / 2)) {
			return true;
		}

		const Δx = distX - obstacle.width / 2;
		const Δy = distY - obstacle.height / 2;
		return Δx * Δx + Δy * Δy <= this.ball.radius * this.ball.radius;
	}

	moveBall() {

		for (let i = 0; i < 2; i++)
			if (this.checkCollisionPlayer(i)) {

				let collidePoint = (this.ball.y - (this.players[i].y + this.players[i].height / 2))

				collidePoint = collidePoint / (this.players[i].height / 2)

				let angleRad = (Math.PI / 4) * collidePoint

				let direction = (this.ball.x + this.ball.radius < this.canvas.width / 2) ? 1 : -1

				this.ball.dx = direction * this.ball.speed * Math.cos(angleRad)
				this.ball.dy = this.ball.speed * Math.sin(angleRad)

				if (this.ball.speed < 6) {
					this.ball.speed += 0.1
					this.players[0].speed += 0.1
					this.players[1].speed += 0.1
				}
			}

		for (let index = 0; index < this.map.obstacles.length; index++) {

			if (this.checkCollisionObstacle(this.map.obstacles[index]) && !this.map.obstacles[index].verif) {

				this.map.obstacles[index].verif = 30

				if (this.ball.x + this.ball.radius < this.map.obstacles[index].x + this.map.obstacles[index].width) {
					this.ball.dx *= -1;
				}

				if (this.ball.x - this.ball.radius > this.map.obstacles[index].x) {
					this.ball.dx *= -1;
				}
				if (this.ball.y + this.ball.radius < this.map.obstacles[index].y + this.map.obstacles[index].height) {
					this.ball.dy *= -1;
				}
				if (this.ball.y - this.ball.radius > this.map.obstacles[index].y) {
					this.ball.dy *= -1;
				}
			}
		}

		if (this.ball.y < this.ball.radius)
			this.ball.y = this.ball.radius
		else if (this.ball.y > this.canvas.height - this.ball.radius)
			this.ball.y = this.canvas.height - this.ball.radius

		this.ball.addParticles(this.ball.x, this.ball.y)

		if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius) {
			this.players[0].score++
			this.resetAllPos()
			this.players[0].ready = false
			this.players[1].ready = false
			return
		}

		if (this.ball.x + this.ball.dx < this.ball.radius) {
			this.players[1].score++
			this.resetAllPos()
			this.players[0].ready = false
			this.players[1].ready = false
			return
		}

		if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius || this.ball.y + this.ball.dy < this.ball.radius) {
			this.ball.dy = 0 - this.ball.dy
		}

		this.ball.x += this.ball.dx
		this.ball.y += this.ball.dy
	}

	moveObstacle() {
		for (let index = 0; index < this.map.obstacles.length; index++) {
			if (this.map.obstacles[index].state == MOTION) {
				if (this.checkCollisionObstacle(this.map.obstacles[index]) || this.map.obstacles[index].verif) {
					if (this.map.obstacles[index].verif)
						this.map.obstacles[index].verif--;
					return
				}
				if (this.map.obstacles[index].y + this.map.obstacles[index].height / 2 < this.ball.y)
					if (this.map.obstacles[index].y + this.map.obstacles[index].height < this.canvas.height - this.ball.radius * 2 - this.map.obstacles[index].speed)
						this.map.obstacles[index].y += this.map.obstacles[index].speed
				if (this.map.obstacles[index].y + this.map.obstacles[index].height / 2 > this.ball.y)
					if (this.map.obstacles[index].y > this.ball.radius * 2 + this.map.obstacles[index].speed)
						this.map.obstacles[index].y -= this.map.obstacles[index].speed
			}
			else if (this.map.obstacles[index].state == EXPAND) {
				this.map.obstacles[index].verif = 0
				this.map.obstacles[index].height += this.map.obstacles[index].speed
				this.map.obstacles[index].y -= this.map.obstacles[index].speed / 2
				if (this.map.obstacles[index].height == this.map.obstacles[index].initialHeight || this.map.obstacles[index].height == this.canvas.height)
					this.map.obstacles[index].speed *= -1
			}
			else if (this.map.obstacles[index].verif)
				this.map.obstacles[index].verif = 0
		}
	}

	moveAll() {
		this.moveBall()
		this.moveObstacle()
		this.movePlayer()
	}

	ready(): boolean {
		return this.players[0].ready && this.players[1].ready
	}

	resetAllPos() {
		this.ball.reset(this.canvas)

		if (this.players[0].score > this.players[1].score)
			this.ball.dx = this.ball.speed
		else if (this.players[0].score < this.players[1].score)
			this.ball.dx = -this.ball.speed
		else
			this.ball.dx = random(0, 1) ? -this.ball.speed : this.ball.speed

		if (this.map.obstacles.length && (this.map.obstacles[0].state == MOTION || this.map.obstacles[0].state == EXPAND))
			this.ball.x += (this.ball.dx > 0 ? -1 : 1) * 100

		for (let i = 0; i < 2; i++)
			this.players[i].resetPos(this.canvas)

		this.players[1].x = this.canvas.width / 8 * 7 - this.players[1].width / 2

		this.map.resetObstaclesPos()
	}
}