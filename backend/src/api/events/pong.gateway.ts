import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { gameRoomClass, Player } from '../../GameRoomClass';
import { FriendListService } from '../friendsList/friendList.service';
import { InvitationRequestService } from '../invitationRequest/invitationRequest.service';
import { RoomsService } from '../rooms/rooms.service';
import { MessagesService } from '../messages/messages.service';
import { ParticipantsService } from '../participants/participants.service';
import { MatchesHistoryService } from '../matchesHistory/matchesHistory.service';
import { BlackListService } from '../blackList/blackList.service';
import { MuteListService } from '../muteList/muteList.service';
import { UserService } from '../user/user.service';
import { freemem } from 'os';
import { info } from 'console';
import { stringify } from 'querystring';

interface Client {
  id: string;
  username: string;
}

let arrClient: Client[] = [];

let arrNotifInWait: { login: string, notif: {} }[] = [];

const http = new HttpService;

const date = new Date();
let time = Math.round((date.valueOf() / 1000));

const checkReconnexionArr = []

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly UserService: UserService,
    private readonly FriendListService: FriendListService,
    private readonly invitationRequestService: InvitationRequestService,
    private readonly RoomsService: RoomsService,
    private readonly MessagesService: MessagesService,
    private readonly ParticipantsService: ParticipantsService,
    private readonly MatchesHistoryService: MatchesHistoryService,
    private readonly BlacklistService: BlackListService,
    private readonly MutelistService: MuteListService,
  ) { }
  @WebSocketServer()
  server: Server;
  //private http = new HttpService;
  private logger: Logger = new Logger('AppGateway');

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const tmp = arrClient.find(item => item.id == client.id)

    if (tmp != undefined && tmp.username != "" && tmp.username != undefined) {
      checkReconnexionArr.push({ username: tmp.username, date: new Date() })
    }

    const indexOfClient = arrClient.findIndex(obj => obj.id === client.id);
    if (indexOfClient !== -1)
      arrClient.splice(indexOfClient, 1);

    const allRoom = this.getAllRoomByClientID(client.id)
    for (let i = 0; i < allRoom.length; i++) {
      for (let index = 0; index < this.pongInfo[allRoom[i].index].players.length; index++) {
        if (this.pongInfo[allRoom[i].index].players[index].id == client.id) {
          this.pongInfo[allRoom[i].index].players[index].connected = false
          this.pongInfo[allRoom[i].index].players[index].dateDeconnection = Date.now()
        }
      }
      if (this.pongInfo[allRoom[i].index].players.length == 1 || (!this.pongInfo[allRoom[i].index].players[0].connected && !this.pongInfo[allRoom[i].index].players[1].connected && !this.pongInfo[allRoom[i].index].firstConnectionInviteProfie)) {
        this.logger.log(`Room ${allRoom[i].room.roomID} has been deleted.`)
        this.pongInfo.splice(allRoom[i].index, 1)
      }
    }
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    const newClient: Client = {
      id: client.id,
      username: ""
    };
    arrClient.push(newClient);
  }

  @SubscribeMessage('storeClientInfo')
  storeClientInfo(client: Socket, user: { login: string }) {
    console.log('Event storeClientInfo')

    let tmp: number;
    console.log("pong");
    if ((tmp = checkReconnexionArr.findIndex(item => item.username == user.login)) >= 0)
      checkReconnexionArr.splice(tmp, 1)
    else if (user.login) {
      this.FriendListService.getUserFriendListWithLogin(user.login).then((res) => {
        for (let i = 0; i < res.length; i++) {
          let loginTmp: string;
          if (res[i].login_user1 == user.login)
            loginTmp = res[i].login_user2;
          else
            loginTmp = res[i].login_user1;
          const _client = arrClient.find(obj => obj.username == loginTmp);
          if (_client) {
            this.server.to(_client.id).emit('friendConnection', true);
          }
        }
      })
      arrClient.forEach((client) => {
        this.server.to(client.id).emit('getClientStatus', { user: user.login, status: 'online' })
      })
    }

    arrClient.forEach((item) => {
      if (item.id == client.id) {
        item.username = user.login;

        let index: number
        while ((index = arrNotifInWait.findIndex(item => item.login == user.login)) != -1) {
          this.server.to(item.id).emit('notif', arrNotifInWait[index].notif)
          arrNotifInWait.splice(index, 1);
        }
      }

    })

  };

  async afterInit(server: any) {
    this.logger.log('Init');
  }

  @Interval(1000)
  sendNotifGame() {
    this.pongInfo.forEach(room => {
      if (room.firstConnectionInviteProfie || !room.started)
        return
      let player: Player
      if ((player = room.players.find(player => !player.connected)) != undefined) {
        if (player.user == null)
          return
        let client: Client
        if ((client = arrClient.find(client => client.username == player.user.login)) != undefined) {
          this.server.to(client.id).emit('notif', { type: 'DISCONNECTGAME', data: { roomId: room.roomID, opponentLogin: room.players.find(item => item.user.login != player.user.login).user.login } })
        }
      }
    })

  }

  @SubscribeMessage('JOIN_ROOM')
  async joinRoom(client: Socket, roomId: string) {
    console.log('Event JOIN_ROOM')

    client.join(roomId);
    this.logger.log(`${client.id} join: ${roomId}`)
  }

  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  /*                      POUR PONG                        */
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////

  private pongInfo: Array<gameRoomClass> = new Array()

  getRoomByID(roomID: string): [number, gameRoomClass] | null {
    for (let i = 0; i < this.pongInfo.length; i++)
      if (this.pongInfo[i].roomID == roomID)
        return [i, this.pongInfo[i]]
    return null
  }

  getRoomByClientID(ClientID: string): [number, gameRoomClass] | null {
    for (let i = 0; i < this.pongInfo.length; i++)
      for (let j = 0; j < 2; j++)
        if (this.pongInfo[i].players[j].id == ClientID)
          return [i, this.pongInfo[i]]
    return null
  }

  getRoomByClientLogin(ClientLogin: string): [number, gameRoomClass] | null {
    for (let i = 0; i < this.pongInfo.length; i++) {
      for (let j = 0; j < 2; j++) {

        if (this.pongInfo[i].players[j].user != null && this.pongInfo[i].players[j].user.login == ClientLogin) {

          return [i, this.pongInfo[i]]
        }
      }
    }
    return null
  }

  getAllRoomByClientID(ClientID: string) {
    const tmp = []
    this.pongInfo.forEach((room, index) => {
      if (room.players.find(player => player.id == ClientID) != undefined)
        tmp.push({ index: index, room: room });
    })

    return tmp
  }

  getRoomBySpectateID(SpectateLogin: string): [number, gameRoomClass] | null {
    for (let i = 0; i < this.pongInfo.length; i++)
      for (let j = 0; j < this.pongInfo[i].spectate.length; j++)
        if (this.pongInfo[i].spectate[j].id == SpectateLogin)
          return [i, this.pongInfo[i]]
    return null
  }

  getRoomBySpectateLogin(SpectateLogin: string): [number, gameRoomClass] | null {
    for (let i = 0; i < this.pongInfo.length; i++)
      for (let j = 0; j < this.pongInfo[i].spectate.length; j++)
        if (this.pongInfo[i].spectate[j].user.login == SpectateLogin)
          return [i, this.pongInfo[i]]
    return null
  }

  @SubscribeMessage('CHECK_RECONNEXION')
  async checkReconnexion(
    client: Socket,
    info: {
      user: {
        id: number,
        login: string,
        nickname: string,
        wins: number,
        looses: number,
        rank: number,
        profile_pic: string
      }
    }) {
      console.log('Event CHECK_RECONNEXION')

    const room = this.getRoomByClientLogin(info.user.login)


    if (room != null) {

      this.joinRoom(client, this.pongInfo[room[0]].roomID)
      this.pongInfo[room[0]].players[this.pongInfo[room[0]].players.findIndex(player => player.user.login == info.user.login)].id = client.id
      this.pongInfo[room[0]].players[this.pongInfo[room[0]].players.findIndex(player => player.user.login == info.user.login)].connected = true
      this.pongInfo[room[0]].players[this.pongInfo[room[0]].players.findIndex(player => player.user.login == info.user.login)].sendNotif = false

      if (this.pongInfo[room[0]].players[this.pongInfo[room[0]].players.findIndex(player => player.user.login == info.user.login)].connected && this.pongInfo[room[0]].players[this.pongInfo[room[0]].players.findIndex(player => player.user.login != info.user.login)].connected && this.pongInfo[room[0]].firstConnectionInviteProfie) {
        this.pongInfo[room[0]].firstConnectionInviteProfie = false
        this.pongInfo[room[0]].players[0].sendNotif = false
        this.pongInfo[room[0]].players[1].sendNotif = false
      }

      const friendList = await this.FriendListService.getUserFriendListWithLogin(this.pongInfo[room[0]].players[this.pongInfo[room[0]].players.findIndex(player => player.user.login == info.user.login)].user.login);
      for (let i = 0; i < friendList.length; i++) {
        let loginTmp: string;
        if (friendList[i].login_user1 == this.pongInfo[room[0]].players[this.pongInfo[room[0]].players.findIndex(player => player.user.login == info.user.login)].user.login)
          loginTmp = friendList[i].login_user2;
        else
          loginTmp = friendList[i].login_user1;
        const _client = arrClient.find(obj => obj.username == loginTmp);
        if (_client) {
          this.server.to(_client.id).emit('friendConnection', true);
        }
      }

      this.server.to(client.id).emit('start', room[1].roomID)

    } else {

      const spectateRoom = this.getRoomBySpectateLogin(info.user.login)

      if (spectateRoom != null) {
        this.joinRoom(client, this.pongInfo[spectateRoom[0]].roomID)
        this.pongInfo[spectateRoom[0]].spectate[this.pongInfo[spectateRoom[0]].spectate.findIndex(spectator => spectator.user.login == info.user.login)].id = client.id
        this.pongInfo[spectateRoom[0]].spectate[this.pongInfo[spectateRoom[0]].spectate.findIndex(spectator => spectator.user.login == info.user.login)].user = info.user
        this.server.to(client.id).emit('start', this.pongInfo[spectateRoom[0]].roomID)
      }

    }
  }

  @SubscribeMessage('JOIN_QUEUE')
  async joinQueue( client: Socket, info: { user: { id: number, login: string, nickname: string, wins: number, looses: number, rank: number, profile_pic: string }, gameMap: string }) {
    console.log('Event JOIN_QUEUE')

    this.server.to(client.id).emit('joined')

    for (let roomId = 0; ; roomId++) {
      var room: [number, gameRoomClass] | null = this.getRoomByID(info.gameMap + roomId.toString())
      if (room == null || !room[1].players[1].id) {
        if (room == null) {
          this.pongInfo.push(new gameRoomClass(info.gameMap + roomId.toString(), client.id, info.user, info.gameMap))
          room = this.getRoomByID(info.gameMap + roomId.toString());
          this.pongInfo[room[0]].players[0].connected = true
        }
        else
          this.pongInfo[room[0]].setOponnent(client.id, info.user)
        this.joinRoom(client, info.gameMap + roomId.toString())

        if (this.pongInfo[room[0]].players[1].id) {
          this.pongInfo[room[0]].started = true
          this.server.to(room[1].roomID).emit('start', room[1].roomID);

          this.pongInfo[room[0]].players.forEach(async player => {

            if (!player.user)
              return

            const friendList = await this.FriendListService.getUserFriendListWithLogin(player.user.login);

            for (let i = 0; i < friendList.length; i++) {
              let loginTmp: string;
              if (friendList[i].login_user1 == player.user.login)
                loginTmp = friendList[i].login_user2;
              else
                loginTmp = friendList[i].login_user1;
              const _client = arrClient.find(obj => obj.username == loginTmp);
              if (_client) {
                this.server.to(_client.id).emit('friendConnection', true);
              }
            }

            arrClient.forEach((client) => {
              this.server.to(client.id).emit('getClientStatus', { user: player.user.login, status: 'in-game' })
            })

          })
        }
        break
      }
    }
  }

  @SubscribeMessage('LEAVE_QUEUE')
  async leaveQueue( client: Socket, info: { user: { id: number, login: string, nickname: string, wins: number, looses: number, rank: number, profile_pic: string },}) {
    console.log('Event LEAVE_QUEUE')
    const room = this.getRoomByClientLogin(info.user.login)

    if (room != null) {
      this.pongInfo.splice(room[0], 1)

      this.server.to(client.id).emit('leave_queue')

    }
  }

  @SubscribeMessage('SPECTATE_CLIENT')
  async spectateClient(client: Socket,info: {user: {  id: number,  login: string,  nickname: string,  wins: number,  looses: number,  rank: number,  profile_pic: string},specID: string}) {
    console.log('Event SPECTATE_CLIENT')

    var room = this.getRoomByID(info.specID)
    if (room == null) {
      room = this.getRoomByClientID(info.specID)
      if (room == null) {
        room = this.getRoomByClientLogin(info.specID)
        if (room == null) {
          this.server.to(client.id).emit('clientNotFound')
          return
        }
      }
    }
    this.joinRoom(client, room[1].roomID)

    this.pongInfo[room[0]].addSpectator(client.id, info.user)

    for (let i = 0; i < this.pongInfo[room[0]].spectate.length; i++) {
      this.logger.log(`pannel: ${this.pongInfo[room[0]].spectate[i].pannel} x: ${this.pongInfo[room[0]].spectate[i].x} | y: ${this.pongInfo[room[0]].spectate[i].y}`)
    }

    this.server.to(client.id).emit('start_spectate', client.id);
  }

  @Interval(3)
  async handleInterval() {
    for (let index = 0; index < this.pongInfo.length; index++) {
      if (this.pongInfo[index].started) {
        for (let i = 0; i < 2; i++)
          if (!this.pongInfo[index].players[i].connected) {
            this.pongInfo[index].players[i].ready = false
            if (!this.pongInfo[index].players[i].sendNotif) {


              if (this.pongInfo[index].players[i].user != null) {

                const friendList = await this.FriendListService.getUserFriendListWithLogin(this.pongInfo[index].players[i].user.login);

                for (let i = 0; i < friendList.length; i++) {

                  let loginTmp: string;

                  if (friendList[i].login_user1 == this.pongInfo[index].players[i].user.login)
                    loginTmp = friendList[i].login_user2;
                  else
                    loginTmp = friendList[i].login_user1;

                  const _client = arrClient.find(obj => obj.username == loginTmp);

                  if (_client)
                    this.server.to(_client.id).emit('friendConnection', true);
                }

                arrClient.forEach((client) => {
                  this.server.to(client.id).emit('getClientStatus', { user: this.pongInfo[index].players[i].user.login, status: 'offline' })
                })

                arrClient.forEach(async (item) => {
                  if (item.username == this.pongInfo[index].players[i].user.login) {
                    this.server.to(item.id).emit('notif', { type: 'DISCONNECTGAME', data: { roomId: this.pongInfo[index].roomID, opponentLogin: this.pongInfo[index].players[i ? 0 : 1].user.login } })
                    this.pongInfo[index].players[i].sendNotif = true;
                  }
                })
              }


            }
            if ((15 - Math.floor((Date.now() - this.pongInfo[index].players[i].dateDeconnection) / 1000)) == 0 && this.pongInfo[index].players[i ? 0 : 1].score != 3) {

              var room = this.getRoomByID(this.pongInfo[index].roomID);

              this.pongInfo[index].players[i ? 0 : 1].score = 3

              const data = {
                id_user1: room[1].players[0].user.id,
                score_u1: room[1].players[0].score,
                id_user2: room[1].players[1].user.id,
                score_u2: room[1].players[1].score,
                winner_id: room[1].players[0].score === 3 ? room[1].players[0].user.id : room[1].players[1].user.id,
              }

              //const match = http.post('https://10.3.3.5:5001/matchesHistory', data);
              const match = this.MatchesHistoryService.createMatch(data);

              room[1].players.forEach((item, index) => {
                if (!item.connected) {
                  arrClient.forEach((client) => {
                    if (client.username == item.user.login)
                      this.server.to(client.id).emit('notif', { type: 'LOOSEGAMEDISCONECT', data: { opponentLogin: room[1].players[index ? 0 : 1].user.login, roomId: room[1].roomID } })
                  })
                }
              })

              this.pongInfo.splice(room[0], 1)

              this.server.to(room[1].roomID).emit('finish', room[1])

              room[1].players.forEach(async player => {
                const friendList = await this.FriendListService.getUserFriendListWithLogin(player.user.login);

                for (let i = 0; i < friendList.length; i++) {
                  let loginTmp: string;
                  if (friendList[i].login_user1 == player.user.login)
                    loginTmp = friendList[i].login_user2;
                  else
                    loginTmp = friendList[i].login_user1;
                  const _client = arrClient.find(obj => obj.username == loginTmp);
                  if (_client) {
                    this.server.to(_client.id).emit('friendConnection', true);
                  }
                }

                arrClient.forEach((client) => {
                  this.server.to(client.id).emit('getClientStatus', { user: player.user.login, status: 'offline' })
                })

              })



              return;
            }

            return this.server.to(this.pongInfo[index].players[i ? 0 : 1].id).emit('deconected')
          }
        if (!(this.pongInfo[index].players[0].score == 3 || this.pongInfo[index].players[1].score == 3))
          if (this.pongInfo[index].players[0].ready && this.pongInfo[index].players[1].ready)
            this.pongInfo[index].moveAll();
      }
    }
  }

  @SubscribeMessage('RENDER')
  async render(client: Socket, roomID: string) {
    //console.log('Event RENDER')

    var room = this.getRoomByID(roomID);

    if (room != null) {

      if (room[1].spectate.find(spectator => spectator.id == client.id, true) != undefined) {
        this.server.to(client.id).emit('render', this.pongInfo[room[0]])
        return
      }

      if (this.pongInfo[room[0]].players[0].score == 3 || this.pongInfo[room[0]].players[1].score == 3) {


        const data = {
          id_user1: room[1].players[0].user.id,
          score_u1: room[1].players[0].score,
          id_user2: room[1].players[1].user.id,
          score_u2: room[1].players[1].score,
          winner_id: room[1].players[0].score === 3 ? room[1].players[0].user.id : room[1].players[1].user.id,
        }

        const match = this.MatchesHistoryService.createMatch(data);

        room[1].players.forEach((item, index) => {
          if (!item.connected) {
            arrClient.forEach((client) => {
              if (client.username == item.user.login)
                this.server.to(client.id).emit('notif', { type: 'LOOSEGAMEDISCONECT', data: { opponent: room[1].players[index ? 0 : 1].user.login, roomId: room[1].roomID } })
            })
          }
        })

        this.pongInfo.splice(room[0], 1)

        this.server.to(room[1].roomID).emit('finish', room[1])

        room[1].players.forEach(async player => {
          const friendList = await this.FriendListService.getUserFriendListWithLogin(player.user.login);

          for (let i = 0; i < friendList.length; i++) {
            let loginTmp: string;
            if (friendList[i].login_user1 == player.user.login)
              loginTmp = friendList[i].login_user2;
            else
              loginTmp = friendList[i].login_user1;
            const _client = arrClient.find(obj => obj.username == loginTmp);
            if (_client) {
              this.server.to(_client.id).emit('friendConnection', true);
            }
          }

          arrClient.forEach((client) => {
            this.server.to(client.id).emit('getClientStatus', { user: player.user.login, status: 'in-game' })
          })
        })

        return;
      }

      this.server.to(client.id).emit('render', this.pongInfo[room[0]])

    }
  }

  @SubscribeMessage('FORFEIT')
  async forfeit(client: Socket, info: {
    user: any,
    roomId: string
  }) {
    
    console.log('Event FORFEIT')
    var room = this.getRoomByID(info.roomId);

    this.pongInfo[room[0]].players.forEach((item, index) => {
      if (item.user.login == info.user.login)
        this.pongInfo[room[0]].players[index ? 0 : 1].score = 3
    })

    const data = {
      id_user1: this.pongInfo[room[0]].players[0].user.id,
      score_u1: this.pongInfo[room[0]].players[0].score,
      id_user2: this.pongInfo[room[0]].players[1].user.id,
      score_u2: this.pongInfo[room[0]].players[1].score,
      winner_id: this.pongInfo[room[0]].players[0].score === 3 ? this.pongInfo[room[0]].players[0].user.id : this.pongInfo[room[0]].players[1].user.id,
    }

    const match = this.MatchesHistoryService.createMatch(data);

    this.pongInfo[room[0]].players.forEach((item, index) => {
      if (!item.connected) {
        arrClient.forEach((client) => {
          if (client.username == item.user.login)
            this.server.to(client.id).emit('notif', { type: 'LOOSEGAMEDISCONECT', data: { opponentLogin: this.pongInfo[room[0]].players[index ? 0 : 1].user.login, roomId: this.pongInfo[room[0]].roomID } })
        })
      }
    })

    this.server.to(this.pongInfo[room[0]].roomID).emit('finish', this.pongInfo[room[0]])

    this.pongInfo.splice(room[0], 1)

  }

  @SubscribeMessage('ENTER')
  async enter(client: Socket, info: [string, boolean]) {
    console.log('Event ENTER')
    var room = this.getRoomByID(info[0])
    if (room != null) {
      for (let index = 0; index < 2; index++)
        if (this.pongInfo[room[0]].players[index].id == client.id)
          if (!(this.pongInfo[room[0]].players[index].ready && this.pongInfo[room[0]].players[index ? 0 : 1].ready)) {
            this.pongInfo[room[0]].players[index].ready = !this.pongInfo[room[0]].players[index].ready
            if (this.pongInfo[room[0]].players[index ? 0 : 1].ready && this.pongInfo[room[0]].firstConnectionInviteProfie)
              this.pongInfo[room[0]].firstConnectionInviteProfie = false
          }
    }
  }

  @SubscribeMessage('SPACE')
  async space(client: Socket, info: [string, boolean]) {
    console.log('Event SPACE')
    var room = this.getRoomByID(info[0])
    if (room != null) {

      if (arrClient.find(item => item.id == client.id).username == 'ldauga')
        for (let index = 0; index < 2; index++)
          if (this.pongInfo[room[0]].players[index].id == client.id) {
            this.pongInfo[room[0]].players[index].cheat = info[1]
          }
    }
  }

  @SubscribeMessage('ARROW_UP')
  async arrowUp(client: Socket, info: [string, boolean]) {
    console.log('Event ARROW_UP')
    var room = this.getRoomByID(info[0])
    if (room != null) {

      for (let index = 0; index < 2; index++)
        if (this.pongInfo[room[0]].players[index].id == client.id)
          this.pongInfo[room[0]].players[index].up = info[1]

    }
  }

  // info type: string -> roomID | boolean -> value of key (press or release)
  @SubscribeMessage('ARROW_DOWN')
  async arrowDown(client: Socket, info: [string, boolean]) {
    console.log('Event ARROW_DOWN')
    var room = this.getRoomByID(info[0])
    if (room != null) {

      for (let index = 0; index < 2; index++)
        if (this.pongInfo[room[0]].players[index].id == client.id)
          this.pongInfo[room[0]].players[index].down = info[1]

    }
  }

  @SubscribeMessage('INVITE_CUSTOM')
  async inviteCustom(client: Socket,
    info: {
      user: {
        id: number,
        login: string,
        nickname: string,
        wins: number,
        looses: number,
        rank: number,
        profile_pic: string
      },
      gameRoom: gameRoomClass,
      userLoginToSend: string,
    }) {
      
      console.log('Event INVITE_CUSTOM')

    const room = this.getRoomByID("custom" + client.id)

    if (room != null)
      this.pongInfo.splice(room[0], 1)
    else
      this.joinRoom(client, "custom" + client.id)

    info.gameRoom.roomID = "custom" + client.id
    info.gameRoom.players[0].connected = true
    info.gameRoom.players[0].id = client.id

    for (let index = 0; index < info.gameRoom.map.obstacles.length; index++) {
      info.gameRoom.map.obstacles[index].initialX = info.gameRoom.map.obstacles[index].x
      info.gameRoom.map.obstacles[index].initialY = info.gameRoom.map.obstacles[index].y
      info.gameRoom.map.obstacles[index].initialHeight = info.gameRoom.map.obstacles[index].height
    }

    this.pongInfo.push(new gameRoomClass(info.gameRoom.roomID, client.id, info.user, "map1"))

    this.pongInfo[this.pongInfo.length - 1].map.obstacles = info.gameRoom.map.obstacles

    this.pongInfo[this.pongInfo.length - 1].ball.x = info.gameRoom.ball.x
    this.pongInfo[this.pongInfo.length - 1].ball.y = info.gameRoom.ball.y

    if (info.gameRoom.ball.initial_x >= 0) {
      this.pongInfo[this.pongInfo.length - 1].ball.x = this.pongInfo[this.pongInfo.length - 1].ball.initial_x = info.gameRoom.ball.initial_x
      this.pongInfo[this.pongInfo.length - 1].ball.y = this.pongInfo[this.pongInfo.length - 1].ball.initial_y = info.gameRoom.ball.initial_y
    }

    arrClient.forEach((item) => {
      if (info.userLoginToSend == item.username)
        this.server.to(item.id).emit('notif', { type: "GAMEINVITE", data: { inviteUser: info.user, inviteUserID: client.id } })
    })
  }

  @SubscribeMessage('DECLINE_INVITATION')
  async declineInvitation(client: Socket,
    info: {
      sendTo: string,
      user: {
        id: number,
        login: string,
        nickname: string,
        wins: number,
        looses: number,
        rank: number,
        profile_pic: string
      }
    }) {
      console.log('Event DECLINE_INVITATION')

    const room = this.getRoomByID("custom" + info.sendTo)

    if (room != null) {
      this.server.to(info.sendTo).emit('decline_invitation', info.user)
      this.pongInfo.splice(room[0], 1)
    }
  }

  @SubscribeMessage('ACCEPT_INVITATION')
  async acceptInvitation(client: Socket,
    info: {
      user: {
        id: number,
        login: string,
        nickname: string,
        wins: number,
        looses: number,
        rank: number,
        profile_pic: string
      },
      inviteID: string
    }) {
      
      console.log('Event ACCEPT_INVITATION')
    var room = this.getRoomByID("custom" + info.inviteID)


    if (room != null) {

      this.joinRoom(client, room[1].roomID)

      this.pongInfo[room[0]].players[0].connected = true
      this.pongInfo[room[0]].started = true
      this.pongInfo[room[0]].setOponnent(client.id, info.user)

      this.pongInfo[room[0]].players[1].connected = true
      this.pongInfo[room[0]].players[1].sendNotif = true

      this.pongInfo[room[0]].firstConnectionInviteProfie = true

      this.server.to(room[1].roomID).emit('start_invite_game')
    } else {

      this.AffNotistack(client, { text: 'Invitation to the game has been cancelled.', type: 'error' })

    }

  }


  @SubscribeMessage('GET_ALL_FRIEND_CONNECTED')
  async getAllFriendConnected(client: Socket, info: { user: any }) {
    console.log('Event GET_ALL_FRIEND_CONNECTED')

    const friendList = await this.FriendListService.getUserFriendList(info.user.id)

    let friendRes: any;

    const retArr = []

    friendRes = friendList;


    for (let index = 0; index < friendRes.length; index++) {
      var user: any
      if (friendRes[index].id_user1 != info.user.id)
        user = await this.UserService.getUserById(friendRes[index].id_user1);
      else
        user = await this.UserService.getUserById(friendRes[index].id_user2);

      if (this.getRoomByClientLogin(user.login) != null && this.getRoomByClientLogin(user.login)[1].players.find(player => player.user != null && player.user.login == user.login).connected)
        retArr.push({ user: user, status: "in-game" })
      else if (arrClient.find(client => client.username == user.login) != undefined)
        retArr.push({ user: user, status: "online" })
      else
        retArr.push({ user: user, status: "offline" })
    }

    this.server.to(client.id).emit("getAllFriendConnected", retArr);
  }

  @SubscribeMessage('GET_CLIENT_STATUS')
  async getClientStatus(client: Socket, info: { user: any }) {
    console.log('Event GET_CLIENT_STATUS')
    if (this.getRoomByClientLogin(info.user.login))
      this.server.to(client.id).emit('getClientStatus', { login: info.user.login, status: 'in-game' })
    else if (arrClient.find((item) => item.username == info.user.login))
      this.server.to(client.id).emit('getClientStatus', { user: info.user.login, status: 'online' })
    else
      this.server.to(client.id).emit('getClientStatus', { user: info.user.login, status: 'offline' })
  }

  @SubscribeMessage('AffNotistack')
  async AffNotistack(client: Socket, info: { text: string, type: string }) {
    console.log('Event AffNotistack')
    this.server.to(client.id).emit('returnAffNotistack', { text: info.text, type: info.type })
  }

  @SubscribeMessage('CHECK_IF_IN_GAME')
  async CheckIfInGame(client: Socket, info: { login: string }) {
    console.log('Event CHECK_IF_IN_GAME')
    const room = this.getRoomByClientLogin(info.login);
    if (room == null)
      this.server.to(client.id).emit('client_not_playing')
    else {
      this.joinRoom(client, room[1].roomID)
      this.server.to(client.id).emit('start_spectate')
    }
  }

  @SubscribeMessage('RENDER_SPECTATE')
  async RenderSpectate(client: Socket, info: { login: string }) {
    console.log('Event RENDER_SPECTATE')
    const room = this.getRoomByClientLogin(info.login);
    if (room != null)
      this.server.to(client.id).emit('render_spectate', room[1])
  }

  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  /*                      POUR PONG                        */
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  @SubscribeMessage('friendsListRequest')
  async listFriendsRequest(client: Socket) {
    console.log('Event friendsListRequest')
    this.logger.log(`${arrClient.find(obj => obj.id === client.id).username} request her friends list`);
    this.server.to(client.id).emit('friendsList', arrClient);
  }

  @SubscribeMessage('CHANGE_NICKNAME')
  async changeNickname(client: Socket, info: { user: any, newNickname: string }) {
    console.log('Event CHANGE_NICKNAME')

    this.UserService.updateNickname(info.user.login, info.newNickname).catch((err) => {
      switch (err.response.message) {
        case 'Cannot set identical nickname':
          this.server.to(client.id).emit('changeNicknameError', 'identical-nickname')
          break;
        case 'Nickname already used':
          this.server.to(client.id).emit('changeNicknameError', 'already-used')
          break;
        case 'No special char':
          this.server.to(client.id).emit('changeNicknameError', 'special-char')
          break;
        case 'Nickname too short':
          this.server.to(client.id).emit('changeNicknameError', 'too-short')
          break;
        case 'Cannot use someone\'s login as a nickname.':
          this.server.to(client.id).emit('changeNicknameError', 'same-as-login');
          break;
      }
    }).then((res) => {
      if (res != undefined)
        this.server.to(client.id).emit('changeNicknameSuccess', res)
    })
  }
}
