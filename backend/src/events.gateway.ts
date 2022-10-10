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
import { gameRoomClass } from './GameRoomClass';
import { isIdentifierOrPrivateIdentifier } from 'typescript';
import { Observable } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from "axios";
import axios from 'axios';

interface Client {
  id: string;
  username: string;
  socket: Socket;
}

interface Participant {
  username: string;
  room_name: string;
}

interface Room {
  id: number;
  name: string;
  users: Client[];
}

let arrClient: Client[] = [];

let arrRoom: Room[] = [];

let arrParticipants: Participant[] = [];

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private http = new HttpService;

  private logger: Logger = new Logger('AppGateway');

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const indexOfClient = arrClient.findIndex(obj => obj.id === client.id);
    // for (let i = 0; i < arrClient.length; i++) {
    //   if (arrClient.find(obj => obj.id !== client.id) && arrClient.find(obj => obj.username != ""))
    //     this.server.to(arrClient[i].id).emit('removeFriend', arrClient[indexOfClient]);
    // }
    if (indexOfClient !== -1)
      arrClient.splice(indexOfClient, 1);

    var room: [number, gameRoomClass] | null = this.getRoomByClientID(client.id)
    if (room != null) {
      for (let i = 0; i < 2; i++)
        if (this.pongInfo[room[0]].players[i].id == client.id) {
          this.pongInfo[room[0]].players[i].connected = false
          this.pongInfo[room[0]].players[i].dateDeconnection = Date.now()
        }
      if (!this.pongInfo[room[0]].players[0].connected && !this.pongInfo[room[0]].players[1].connected)
        this.pongInfo.splice(room[0], 1)
    }
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    const newClient: Client = {
      id: client.id,
      username: "",
      socket: null
    };
    arrClient.push(newClient);
  }

  @SubscribeMessage('storeClientInfo')
  async storeClientInfo(client: Socket, user: { login: string }) {
    console.log("storeClientInfo");
    await arrClient.forEach((item) => {
      if (item.id == client.id) {
        item.username = user.login;
        item.socket = client;
        let i = 0;
        while (i < arrParticipants.length) {
          const participantReturn = arrParticipants.find(obj => obj.username == user.login);
          if (participantReturn) {
            arrRoom.find(obj => obj.name == participantReturn.room_name).users.push(item);
            const index = arrParticipants.indexOf(participantReturn);
            if (index >= 0)
              arrParticipants.splice(index, 1);
          }
          else
            i++;
        }
        console.log("test");
        //this.server.to(client.id).emit('friendsList', arrClient);
      }
    })
    // console.log("arrParticipant.lenght = ", arrParticipants.length);
    // console.log("arrRoom: ", arrRoom);
  };

  async afterInit(server: any) {
    this.logger.log('Init');
    const getAllRoomsReturn = await this.http.get('http://localhost:5001/rooms');
    await getAllRoomsReturn.forEach(async item => {
      const a: { id: number, name: string }[] = item.data;
      let i = 0;
      while (i < a.length) {
        let newRoom: Room = {
          id: a[i].id,
          name: a[i].name,
          users: []
        }
        arrRoom.push(newRoom);
        i++;
      }
    });
    const getAllParticipantsReturn = await this.http.get('http://localhost:5001/participants');
    await getAllParticipantsReturn.forEach(item => {
      const a: { login: string, room_name: string }[] = item.data;
      let i = 0;
      while (i < a.length) {
        let newParticipant: Participant = {
          username: a[i].login,
          room_name: a[i].room_name
        }
        arrParticipants.push(newParticipant);
        i++;
      }
    });
  }

  @SubscribeMessage('msgConnection')
  async handleMessage(client: Socket, message: string) {
    const _client_temp = arrClient.find(obj => obj.id === client.id);
    const newmessage = `Hey! You have the id: ${client.id}, ${_client_temp.id} and your username is: ${_client_temp.username}. Welcome to our server!`;
    this.server.to(client.id).emit('msgToClient', newmessage);
    this.server.to(client.id).emit('ID', client.id);
  }

  //INVITATION REQUESTS EVENTS

  @SubscribeMessage('createInvitationRequest')
  async createInvitationRequest(client: Socket, data: any) {
    this.logger.log(`${client.id} said: create Invitation Request`);
    const invitationRequest = {
      id_user1: data.id_user1,
      id_user2: data.id_user2,
      user1_accept: data.user1_accept,
      user2_accept: data.user2_accept,
      sender_login: data.sender_login,
      receiver_login: data.receiver_login,
      userOrRoom: data.userOrRoom,
      room_id: data.room_id,
      room_name: data.room_name

    }

    arrClient.forEach((item) => {
      if (item.username == invitationRequest.receiver_login)
        this.server.to(item.id).emit('notif', { type: 'PENDINGINVITATION' })
    })

    const invitationRequestReturn = await this.http.post('http://localhost:5001/invitationRequest', invitationRequest);
    console.log(invitationRequestReturn.forEach(item => (console.log('invitationRequestReturn in eventgateway'))));
    const _client_receiver = arrClient.find(obj => obj.username === data.receiver_login);
    if (_client_receiver != null) {
      console.log("newMsgReceived to ", _client_receiver.username);
      this.server.to(_client_receiver.id).emit('newInvitationReceived', data);
    }
  }

  @SubscribeMessage('removeInvitationRequest')
  async removeInvitationRequest(client: Socket, data: any) {
    this.logger.log(`${client.id} said : remove Invitation Request`);
    const invitationRequestReturn = await this.http.post('http://localhost:5001/invitationRequest/' + data.id_user1 + '/' + data.id_user2);
    console.log(invitationRequestReturn.forEach(item => (console.log('removeInvitationRequestReturn in eventgateway'))));
    this.server.to(client.id).emit('returnRemoveInvitationRequest', true);
  }

  //FRIENDLIST EVENTS

  @SubscribeMessage('addFriend')
  async addFriend(client: Socket, data: any) {
    this.logger.log(`${client.id} add Friend`);
    const newFriend = {
      id_user1: data.id_user1,
      id_user2: data.id_user2,
      login_user1: data.login_user1,
      login_user2: data.login_user2
    }
    const addFriendReturn = await this.http.post('http://localhost:5001/friendList/', newFriend);
    console.log(addFriendReturn.forEach(item => (console.log('addFriendReturn in eventgateway'))));
    let _client_data = arrClient.find(obj => obj.username === data.login_user2);
    if (client.id == _client_data.id) {
      _client_data = arrClient.find(obj => obj.username === data.login_user1);
    }
    if (_client_data != null) {
      console.log("newFriend to ", _client_data.username);
      this.server.to(_client_data.id).emit('newFriendReceived', data);
    }
  }

  @SubscribeMessage('removeFriend')
  async removeFriend(client: Socket, data: any) {
    this.logger.log(`${client.id} remove Friend`);
    const removeFriendReturn = await this.http.post('http://localhost:5001/friendList/' + data.id_user1 + '/' + data.id_user2);
    console.log(removeFriendReturn.forEach(item => (console.log('removeFriendReturn in eventgateway'))));
    this.server.to(client.id).emit('returnRemoveFriend', true);
  }

  //ROOMS EVENTS

  @SubscribeMessage('createChatRooms')
  async createChatRooms(client: Socket, data: any) {
    this.logger.log(`${client.id} create Rooms`);
    const newRooms = {
      name: data.name,
      description: data.description,
      password: data.password,
      identifiant: data.identifiant,
      owner_id: data.owner_id
    }
    const roomReturn = await this.http.post('http://localhost:5001/rooms', newRooms);
    roomReturn.forEach(async item => {
      console.log('chat room created');
      const newParticipant = {
        user_id: data.owner_id,
        user_login: data.owner_login,
        room_id: item.data.id,
        room_name: data.name
      }
      const tmp_room_id = item.data.id;
      const participantReturn = await this.http.post('http://localhost:5001/participants', newParticipant);
      console.log(participantReturn.forEach(item => (console.log('participantReturn in eventgateway'))));
      console.log('participant created');
      console.log('arrClient: ', arrClient);
      console.log('data: ', data);
      const _client = arrClient.find(obj => obj.username === data.owner_login);
      console.log('_client: ', _client);
      if (_client != null) {
        const newRoom = {
          id: tmp_room_id,
          name: data.name,
          users: []
        }
        newRoom.users.push(_client);
        arrRoom.push(newRoom);
        console.log('arrRoom: ', arrRoom);
        this.server.to(client.id).emit('newRoomCreated', true);
      }
    });
  }

  @SubscribeMessage('removeRoom')
  async removeRoom(client: Socket, data: any) {
    this.logger.log(`${client.id} remove Room`);
    const removeRoomReturn = await this.http.post('http://localhost:5001/rooms/' + data.id + '/' + data.room_name);
    console.log(removeRoomReturn.forEach(item => (console.log('removeRoomReturn in eventgateway'))));
    // this.server.to(client.id).emit('removeRoomReturn', true);
  }

  //PARTICIPANTS EVENTS

  @SubscribeMessage('createParticipant')
  async createParticipant(client: Socket, data: any) {
    this.logger.log(`${client.id} create Participant`);
    const newParticipant = {
      user_id: data.user_id,
      user_login: data.user_login,
      room_id: data.room_id,
      room_name: data.room_name
    }
    const participantReturn = await this.http.post('http://localhost:5001/participants', newParticipant);
    console.log(participantReturn.forEach(item => (console.log('participantReturn in eventgateway'))));
    console.log('arrClient: ', arrClient);
    const _client = arrClient.find(obj => obj.username === data.user_login);
    console.log('_client: ', _client);
    if (_client != null) {
      console.log(_client.username, " join ", data.room_name);
      console.log('arrRoom: ', arrRoom);
      const a = arrRoom.find(obj => obj.name == data.room_name);
      console.log('a: ', a);
      a.users.push(_client);
      console.log('arrRoom: ', arrRoom);
    }
  }

  @SubscribeMessage('removeParticipant')
  async removeParticipant(client: Socket, data: any) {
    this.logger.log(`${client.id} remove Participant`);
    const removeParticipantReturn = await this.http.post('http://localhost:5001/participants/' + data.login + '/' + data.room_name);
    console.log(removeParticipantReturn.forEach(item => (console.log('removeParticipantReturn in eventgateway'))));
    this.server.to(client.id).emit('removeParticipantReturn', true);
    const _client = arrClient.find(obj => obj.username === data.user_login);
    if (_client != null) {
      console.log(_client.username, " join ", data.room_name);
      const index = arrRoom.find(obj => obj.name == data.name).users.indexOf(_client);
      arrRoom.find(obj => obj.name == data.name).users.slice(index);
    }
  }

  //NEW CHAT EVENTS

  @SubscribeMessage('createMsg')
  async createMsg(client: Socket, data: any) {
    this.logger.log(`${client.id} create newMsg: ${data.text}`);
    const newMsg = {
      id_sender: data.id_sender,
      id_receiver: data.id_receiver,
      login_sender: data.login_sender,
      login_receiver: data.login_receiver,
      userOrRoom: data.userOrRoom,
      room_id: data.room_id,
      room_name: data.room_name,
      text: data.text
    }
    const returnMsg = this.http.post('http://localhost:5001/messages/', newMsg);
    console.log(returnMsg.forEach(item => (console.log('returnMsg in eventgateway'))));
    if (!data.userOrRoom) {
      const _client_receiver = arrClient.find(obj => obj.username === data.login_receiver);
      if (_client_receiver != null) {
        console.log("newMsgReceived to ", _client_receiver.username);
        this.server.to(_client_receiver.id).emit('newMsgReceived', data);
      }
    }
    else {
      console.log("arrRoom ", arrRoom);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      console.log("room ", room);
      console.log("room.users ", room.users);
      console.log("room.users.length: ", room.users.length);
      while (i < room.users.length) {
        console.log('new Msg to ', room.users[i].username);
        this.server.to(room.users[i].id).emit('newMsgReceived', data);
        i++;
      }
    }
  }

  //OLD CHAT EVENTS

  @SubscribeMessage('msgToOtherClient')
  async msgToOtherClient(client: Socket, data: any) {
    this.logger.log(`${data.sender} said: ${data.text} to ${data.recipient}`);
    const _client_temp = arrClient.find(obj => obj.username === data.recipient);
    if (_client_temp != null)
      this.server.to(_client_temp.id).emit('msgInputToOtherClient', data);
  }

  @SubscribeMessage('setUsername')
  async setUsername(client: Socket, data: string) {
    this.logger.log(`${client.id} set his username: ${data}`);
    if (arrClient.find(obj => obj.username === data)) {
      this.server.to(client.id).emit('usernameRefused', arrClient);
    }
    else {
      arrClient.find(obj => obj.id === client.id).username = data;
      this.server.to(client.id).emit('usernameAccepted', arrClient);
    }
  }


  @SubscribeMessage('usernameRegistered')
  async usernameRegistered(client: Socket, data: string) {
    const _client_temp = arrClient.find(obj => obj.id === client.id);
    for (let i = 0; i < arrClient.length; i++) {
      if (arrClient[i].id !== client.id && arrClient[i].username.length > 0) {
        this.logger.log(`Envoie new friends ${_client_temp.username} to ${arrClient[i].username}, id = ${arrClient[i].id}`);
        this.server.to(arrClient[i].id).emit('newFriend', _client_temp);
      }
      this.server.to(client.id).emit('friendsList', arrClient);
    }
  }

  @SubscribeMessage('msgToServer')
  async msgReceived(client: Socket, data: any) {
    this.logger.log(`${client.id} said: ${data.text}`);
    this.server.to(client.id).emit('msgToClient', 505);
  }

  @SubscribeMessage('JOIN_ROOM')
  async joinRoom(client: Socket, roomId: string) {

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
    for (let i = 0; i < this.pongInfo.length; i++)
      for (let j = 0; j < 2; j++)
        if (this.pongInfo[i].players[j].user.login == ClientLogin)
          return [i, this.pongInfo[i]]
    return null
  }

  @SubscribeMessage('CHECK_RECONNEXION')
  checkReconnexion(
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
    this.pongInfo.forEach((item) => {
      item.players.forEach((player) => {
        if (item.started && player.user.login == info.user.login) {
          this.joinRoom(client, item.roomID)
          player.id = client.id
          player.connected = true
          player.sendNotif = false
          this.server.to(client.id).emit('start', item.roomID)
        }
      })
    })
  }


  @SubscribeMessage('JOIN_QUEUE')
  async joinQueue(
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
      },
      gameMap: string
    }) {

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
        }
        break
      }
    }
  }

  @SubscribeMessage('SPECTATE_CLIENT')
  async spectateClient(client: Socket,
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
      specID: string
    }) {

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

    this.server.to(client.id).emit('start', room[1].roomID);
  }

  @Interval(3)
  handleInterval() {
    for (let index = 0; index < this.pongInfo.length; index++) {
      if (this.pongInfo[index].started) {
        for (let i = 0; i < 2; i++)
          if (!this.pongInfo[index].players[i].connected) {
            this.pongInfo[index].players[i].ready = false
            if (!this.pongInfo[index].players[i].sendNotif) {
              arrClient.forEach((item) => {
                if (item.username == this.pongInfo[index].players[i].user.login) {
                  this.server.to(item.id).emit('notif', { type: 'DISCONNECTGAME', data: { roomId: this.pongInfo[index].roomID, opponentLogin: this.pongInfo[index].players[i ? 0 : 1].user.login } })
                  this.pongInfo[index].players[i].sendNotif = true;
                }
              })
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

              const match = this.http.post('http://localhost:5001/matchesHistory', data);

              match.forEach((item) => { })

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

    var room = this.getRoomByID(roomID);

    if (room != null) {

      if (this.pongInfo[room[0]].players[0].score == 3 || this.pongInfo[room[0]].players[1].score == 3) {

        this.pongInfo[room[0]].players.forEach((player, index, playersArr) => {
          var K = ((player.user.rank < 1000) ? 80 : ((player.user.rank < 1500) ? 50 : ((player.user.rank < 2000) ? 30 : 20)))

          var winChance = (1 / (1 + (10 * ((playersArr[(index ? 0 : 1)].user.rank - player.user.rank) / 400))))

          var newElo = player.user.rank + (K * (player.score == 3 ? 1 : 0 - winChance))

          console.log('K :', K, 'winChance :', winChance, 'newElo :', newElo)

        })

        const data = {
          id_user1: room[1].players[0].user.id,
          score_u1: room[1].players[0].score,
          id_user2: room[1].players[1].user.id,
          score_u2: room[1].players[1].score,
          winner_id: room[1].players[0].score === 3 ? room[1].players[0].user.id : room[1].players[1].user.id,
        }

        const match = this.http.post('http://localhost:5001/matchesHistory', data);

        match.forEach((item) => { })

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

    const match = this.http.post('http://localhost:5001/matchesHistory', data);

    match.forEach((item) => { })

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
    var room = this.getRoomByID(info[0])
    if (room != null) {

      for (let index = 0; index < 2; index++)
        if (this.pongInfo[room[0]].players[index].id == client.id)
          this.pongInfo[room[0]].players[index].ready = true

    }
  }

  @SubscribeMessage('SPACE')
  async space(client: Socket, info: [string, boolean]) {
    var room = this.getRoomByID(info[0])
    if (room != null) {

      for (let index = 0; index < 2; index++)
        if (this.pongInfo[room[0]].players[index].id == client.id) {
          if (info[1])
            this.pongInfo[room[0]].players[index].speed = 2
          else
            this.pongInfo[room[0]].players[index].speed = 1
        }

    }
  }

  @SubscribeMessage('ARROW_UP')
  async arrowUp(client: Socket, info: [string, boolean]) {
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
      userLoginToSend: string
    }) {
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

    this.server.to(info.sendTo).emit('decline_invitation', info.user)
    this.pongInfo.splice(this.getRoomByID("custom" + info.sendTo)[0], 1)
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

    var room = this.getRoomByID("custom" + info.inviteID)

    this.joinRoom(client, room[1].roomID)

    this.pongInfo[room[0]].players[0].connected = true
    this.pongInfo[room[0]].started = true
    this.pongInfo[room[0]].setOponnent(client.id, info.user)

    this.server.to(room[1].roomID).emit('start', "custom" + info.inviteID)

  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED')
  async getAllClientConnected(client: Socket) {
    this.server.to(client.id).emit("getAllClientConnected", arrClient);
  }

  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  /*                      POUR PONG                        */
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  @SubscribeMessage('friendsListRequest')
  async listFriendsRequest(client: Socket) {
    this.logger.log(`${arrClient.find(obj => obj.id === client.id).username} request her friends list`);
    this.server.to(client.id).emit('friendsList', arrClient);
  }

}
