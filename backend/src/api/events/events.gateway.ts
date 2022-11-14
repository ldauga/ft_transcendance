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

interface Participant {
  username: string;
  room_name: string;
}

interface Room {
  id: number;
  name: string;
  users: Client[];
}

interface Notif {
  nb: number;
  name: string;
  userOrRoom: boolean;
}

interface NotifClient {
  username: string;
  notifs: Notif[];
}

let arrClient: Client[] = [];

let arrNotifs: NotifClient[] = [];

let arrNotifInWait: { login: string, notif: {} }[] = [];

let arrRoom: Room[] = [];

let arrParticipants: Participant[] = [];

const http = new HttpService;

const date = new Date();
let time = Math.round((date.valueOf() / 1000));

function getYear() {
  const date = Date();
  if (!date)
    return ("");
  let tmp = date.split(' ');
  if (!tmp || !tmp[3])
    return ("");
  return (tmp[3]);
}

function getMonth() {
  const date = Date();
  if (!date)
    return ("");
  let tmp = date.split(' ');
  if (!tmp || !tmp[1])
    return ("");
  return (tmp[1]);
}

function getDay() {
  const date = Date();
  if (!date)
    return ("");
  let tmp = date.split(' ');
  if (!tmp || !tmp[2])
    return ("");
  console.log("get day: ", tmp[2]);
  return (tmp[2]);
}

function getHour() {
  const date = Date();
  if (!date)
    return ("");
  let tmp = date.split(' ');
  if (!tmp || !tmp[4])
    return ("");
  let tmp2 = tmp[4].split(':');
  if (!tmp2 || !tmp2[0])
    return ("");
  return (tmp2[0]);
}

function getMinute() {
  const date = Date();
  if (!date)
    return ("");
  let tmp = date.split(' ');
  if (!tmp || !tmp[4])
    return ("");
  let tmp2 = tmp[4].split(':');
  if (!tmp2 || !tmp2[1])
    return ("");
  return (tmp2[1]);
}

const checkReconnexionArr = []

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const tmp = arrClient.find(item => item.id == client.id)

    if (tmp != undefined && tmp.username != "" && tmp.username != undefined) {
      // console.log(arrClient.find(item => item.id == client.id))
      checkReconnexionArr.push({ username: tmp.username, date: new Date() })
    }

    // const friendList = await this.FriendListService.getUserFriendListWithLogin(tmp.username);

    // for (let i = 0; i < friendList.length; i++) {
    //   let loginTmp;
    //   if (friendList[i].login_user1 == tmp.username)
    //     loginTmp = friendList[i].login_user2;
    //   else
    //     loginTmp = friendList[i].login_user1;
    //   const _client = arrClient.find(obj => obj.username == loginTmp);
    //   if (_client) {
    //     this.server.to(_client.id).emit('friendConnection', true);
    //     console.log("emit friendConnection to ", _client.username);
    //   }
    // }
    // }

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
    //   for (let i = 0; i < 2; i++)
    //     if (this.pongInfo[room[0]].players[i].id == client.id) {
    //       this.pongInfo[room[0]].players[i].connected = false
    //       this.pongInfo[room[0]].players[i].dateDeconnection = Date.now()
    //       if (!this.pongInfo[room[0]].players[0].connected && !this.pongInfo[room[0]].players[1].connected && !this.pongInfo[room[0]].firstConnectionInviteProfie) {
    //         this.logger.log(`Room ${room[1].roomID} has been deleted.`)
    //         this.pongInfo.splice(room[0], 1)
    //         return;
    //       }
    //     }
    // room = this.getRoomBySpectateID(client.id)
    // if (room != null) {
    //   let tmp = this.pongInfo[room[0]].spectate.findIndex(obj => obj.id == client.id)
    //   if (tmp != -1) this.pongInfo[room[0]].spectate.splice(tmp, 1)
    // }
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
  async storeClientInfo(client: Socket, user: { login: string }) {

    let tmp: number;


    if ((tmp = checkReconnexionArr.findIndex(item => item.username == user.login)) >= 0)
      checkReconnexionArr.splice(tmp, 1)
    else if (user.login) {
      const friendList = await this.FriendListService.getUserFriendListWithLogin(user.login);


      for (let i = 0; i < friendList.length; i++) {
        let loginTmp: string;
        if (friendList[i].login_user1 == user.login)
          loginTmp = friendList[i].login_user2;
        else
          loginTmp = friendList[i].login_user1;
        const _client = arrClient.find(obj => obj.username == loginTmp);
        if (_client) {
          this.server.to(_client.id).emit('friendConnection', true);
        }
      }

      arrClient.forEach((client) => {
        this.server.to(client.id).emit('getClientStatus', { user: user.login, status: 'login' })
      })
    }

    arrClient.forEach((item) => {
      if (item.id == client.id) {
        item.username = user.login;
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
        arrRoom.forEach((item) => {
          const _participantInRoom = item.users.find(obj => obj.username == user.login);
          if (_participantInRoom)
            _participantInRoom.id = client.id;
        });
        const _notif = arrNotifs.find(obj => obj.username == user.login);
        this.logger.log("ClientStore _notif = ", _notif);
        if (!_notif) {
          let newNotifClient: NotifClient = {
            username: user.login,
            notifs: []
          }
          arrNotifs.push(newNotifClient);
        }
        else {
          this.logger.log("ClientStore _notif.notifs.length = ", _notif.notifs.length);
          if (_notif.notifs[0])
            this.logger.log("ClientStore _notif.notifs[0].nb = ", _notif.notifs[0].nb);
          // for (let i =0; i < arrNotifs.length; )
          this.server.to(client.id).emit('ChatNotifsInit', _notif.notifs);
        }

        let index: number
        console.log('arrNotifInWait :', arrNotifInWait)
        while ((index = arrNotifInWait.findIndex(item => item.login == user.login)) != -1) {
          this.server.to(item.id).emit('notif', arrNotifInWait[index].notif)
          arrNotifInWait.splice(index, 1);
        }

        //console.log("test");
        //this.server.to(client.id).emit('friendsList', arrClient);
      }

    })

    // console.log("arrParticipant.lenght = ", arrParticipants.length);
    // console.log("arrRoom: ", arrRoom);
  };

  async afterInit(server: any) {
    this.logger.log('Init');
    //const getAllRoomsReturn = await this.http.get('https://localhost:5001/rooms');
    const getAllRoomsReturn = await this.RoomsService.getAllRooms();
    getAllRoomsReturn.forEach(async (item) => {
      // console.log(item);
      //const a: { id: number; name: string; publicOrPrivate: boolean; }[] = item;
      //let i = 0;
      //while (i < a.length) {
      let newRoom: Room = {
        id: item.id,
        name: item.name,
        users: []
      };
      arrRoom.push(newRoom);
      //i++;
    });
    const getAllParticipantsReturn = await this.ParticipantsService.getAllParticipants();
    await getAllParticipantsReturn.forEach(item => {
      //const a: { login: string, room_name: string }[] = item.data;
      //let i = 0;
      //while (i < a.length) {
      let newParticipant: Participant = {
        username: item.login,
        room_name: item.room_name
      }
      arrParticipants.push(newParticipant);
      //i++;
      //}
    });
  }

  @Interval(1000)
  tmpFunction() {
    checkReconnexionArr.forEach(async (user, index) => {
      //console.log(new Date().getSeconds() - user.date.getSeconds())
      if (new Date().getSeconds() - user.date.getSeconds() != 0) {
        const friendList = await this.FriendListService.getUserFriendListWithLogin(user.username);
        for (let i = 0; i < friendList.length; i++) {
          let loginTmp: string;
          if (friendList[i].login_user1 == user.username)
            loginTmp = friendList[i].login_user2;
          else
            loginTmp = friendList[i].login_user1;
          const _client = arrClient.find(obj => obj.username == loginTmp);
          if (_client) {
            this.server.to(_client.id).emit('friendDeconnection', true);
            console.log("emit friendConnection to ", _client.username);
          }
        }

        arrClient.forEach((client) => {
          this.server.to(client.id).emit('getClientStatus', { user: user.username, status: 'offline' })
        })

        checkReconnexionArr.splice(index, 1)
      }
    })



  }

  @Interval(1000)
  sendNotifGame() {
    this.pongInfo.forEach(room => {
      if (room.firstConnectionInviteProfie)
        return
      let player: Player
      if ((player = room.players.find(player => !player.connected)) != undefined) {
        let client: Client
        if ((client = arrClient.find(client => client.username == player.user.login)) != undefined) {
          this.server.to(client.id).emit('notif', { type: 'DISCONNECTGAME', data: { roomId: room.roomID, opponentLogin: room.players.find(item => item.user.login != player.user.login).user.login } })
        }
      }
    })

  }

  @Interval(1000)
  checkBanAndMute() {
    time = time + 1;
    //const getAllBan = http.get('https://localhost:5001/blackList');
    const getAllBan = this.BlacklistService.getAllBanTimer();
    getAllBan.then(async item => {
      const a: { login_banned: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, alwaysOrNot: boolean, date: number, timer: number }[] = item;
      a.forEach(async item => {
        //console.log("date + timer = ", item.timer + item.date, ", time = ", time);
        if (item.timer + item.date <= time && !item.alwaysOrNot) {
          console.log("go remove");
          if (!item['userOrRoom']) {
            //const removeUserBanReturn = await http.post('https://localhost:5001/blackList/removeUserBan/' + item.id_sender + '/' + item.login_banned);
            const removeUserBanReturn = await this.BlacklistService.removeUserBan(item['id_sender'], item['login_banned'])
            console.log('removeUserBanReturn in eventgateway', removeUserBanReturn);
            if (removeUserBanReturn) {
              //EventsGateway.prototype.sendToOneClient(item.login_sender, 'debanedUser');
              // EventsGateway.prototype.sendToOneClient(item.login_sender, 'debanedUser');
              const _client = arrClient.find(obj => obj.username == item.login_sender);
              if (_client)
                this.server.to(_client.id).emit('debanedUser', true);
            }
          }
          else {
            //const removeRoomBanReturn = await http.post('https://localhost:5001/blackList/removeRoomBan/' + item.room_id + '/' + item.login_banned);
            const removeRoomBanReturn = await this.BlacklistService.removeRoomBan(item['room_id'], item['login_banned'])
            console.log('removeRoomBanReturn in eventgateway', removeRoomBanReturn);
            if (removeRoomBanReturn) {
              //EventsGateway.prototype.sendToOneClient(item.login_sender, 'debanedUser');
              // EventsGateway.prototype.sendToOneClient(item.login_sender, 'debanedUser');
              const _room = arrRoom.find(obj => obj.id == item.room_id);
              if (_room) {
                let i = 0;
                while (_room.users.length > i) {
                  this.server.to(_room.users[i].id).emit('debanedUserInRoom', true);
                  i++;
                }
              }
            }
          }
        }
      });
    });
    //const getAllMute = http.get('https://localhost:5001/muteList');
    const getAllMute = this.MutelistService.getAllMuteTimer();
    getAllMute.then(async item => {
      const b: { login_muted: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, alwaysOrNot: boolean, date: number, timer: number }[] = item;
      b.forEach(async item => {
        //console.log("date + timer = ", item.timer + item.date, ", time = ", time);
        if (item['timer'] + item['date'] <= time && !item.alwaysOrNot) {
          console.log("go remove");
          //const removeUserMuteReturn = await http.post('https://localhost:5001/muteList/removeRoomMute/' + item['room_id'] + '/' + item['login_muted']);
          const removeUserMuteReturn = await this.MutelistService.removeRoomMute(item['room_id'], item['login_muted']);
          console.log('removeUserMuteReturn in eventgateway', removeUserMuteReturn);
          if (removeUserMuteReturn) {
            //EventsGateway.prototype.sendToOneClient(item.login_sender, 'debanedUser');
            // EventsGateway.prototype.sendToOneClient(item.login_sender, 'debanedUser');
            const _room = arrRoom.find(obj => obj.id == item.room_id);
            if (_room) {
              let i = 0;
              while (_room.users.length > i) {
                this.server.to(_room.users[i].id).emit('demutedUserInRoom', true);
                i++;
              }
            }
          }
        }
      });
    });
  }

  @SubscribeMessage('deconnection')
  async deconnection(client: Socket, info: { user: any }) {
    const login = arrClient.find(obj => obj.id == client.id).username;
    console.log("login: ", login);
    if (login != null) {
      const friendList = await this.FriendListService.getUserFriendListWithLogin(login);
      for (let i = 0; i < friendList.length; i++) {
        let loginTmp: string;
        if (friendList[i].login_user1 == login)
          loginTmp = friendList[i].login_user2;
        else
          loginTmp = friendList[i].login_user1;
        const _client = arrClient.find(obj => obj.username == loginTmp);
        if (_client) {
          //this.getAllFriendConnected(client, info);
          console.log("emit friendDeconnection to ", _client.username);
          this.server.to(_client.id).emit('friendDeconnection', true);
        }
      }
    }
    const indexOfClient = arrClient.findIndex(obj => obj.id === client.id);
    if (indexOfClient !== -1)
      arrClient.splice(indexOfClient, 1);
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
    let verifBan = false;
    if (!data.userOrRoom) {
      const checkIfBanned = await this.BlacklistService.checkUserBan(data.sender_login, data.receiver_login);
      verifBan = checkIfBanned;
    }
    else {
      const checkIfBanned = await this.BlacklistService.checkRoomBan(data.sender_id, data.sender_login, data.room_name);
      verifBan = checkIfBanned;
    }
    console.log("verifBan: ", verifBan);
    if (!verifBan) {
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

      //const invitationRequestReturn = await this.http.post('https://localhost:5001/invitationRequest', invitationRequest);
      const invitationRequestReturn = await this.invitationRequestService.createInvitationRequest(invitationRequest)
      console.log(invitationRequestReturn)
      //  console.log(invitationRequestReturn.forEach(item => (console.log('invitationRequestReturn in eventgateway'))));
      const _client_receiver = arrClient.find(obj => obj.username === data.receiver_login);
      if (_client_receiver != null) {
        console.log("newMsgReceived to ", _client_receiver.username);
        this.server.to(_client_receiver.id).emit('newInvitationReceived', data);
        this.server.to(_client_receiver.id).emit('refreshUser', true);
      }
      if (invitationRequestReturn)
        this.server.to(client.id).emit('refreshUser', true);
    }
  };

  @SubscribeMessage('removeInvitationRequest')
  async removeInvitationRequest(client: Socket, data: any) {
    this.logger.log(`${client.id} said : remove Invitation Request`);
    //const invitationRequestReturn = await this.http.post('https://localhost:5001/invitationRequest/' + data.id_user1 + '/' + data.id_user2);
    const invitationRequestReturn = await this.invitationRequestService.removeInvitationRequest(data.id_user1, data.id_user2)
    console.log('removeInvitationRequestReturn in eventgateway', invitationRequestReturn);
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
    //const addFriendReturn = await this.http.post('https://localhost:5001/friendList/', newFriend);
    const addFriendReturn = await this.FriendListService.createFriendShip(newFriend);
    //console.log(addFriendReturn.forEach(item => (console.log('addFriendReturn in eventgateway'))));
    console.log(addFriendReturn)
    if (addFriendReturn) {
      const _client1 = arrClient.find(obj => obj.username === data.login_user1);
      const _client2 = arrClient.find(obj => obj.username === data.login_user2);
      if (_client1) {
        console.log("newFriend to ", _client1.username);
        this.server.to(_client1.id).emit('newFriendReceived', data);
      }
      if (_client2) {
        console.log("newFriend to ", _client1.username);
        this.server.to(_client1.id).emit('newFriendReceived', data);
      }
    }
  }

  @SubscribeMessage('removeFriend')
  async removeFriend(client: Socket, data: any) {
    this.logger.log(`${client.id} remove Friend`);
    console.log("arrClient: ", arrClient);
    //const removeFriendReturn = await this.http.post('https://localhost:5001/friendList/' + data.id_user1 + '/' + data.id_user2);
    const removeFriendReturn = await this.FriendListService.removeFriendShip(data.id_user1, data.id_user2);
    const _notif = arrNotifs.find(obj => obj.username == data.login_user1);
    if (_notif) {
      const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.login_user2);
      if (_notifToReset)
        _notif.notifs.splice(_notifToReset);
    }
    const _notif2 = arrNotifs.find(obj => obj.username == data.login_user2);
    if (_notif2) {
      const _notifToReset2 = _notif2.notifs.findIndex(obj => obj.name == data.login_user1);
      if (_notifToReset2)
        _notif2.notifs.splice(_notifToReset2);
    }
    console.log('removeFriendReturn in eventgateway', removeFriendReturn);
    if (removeFriendReturn) {
      const _client1 = arrClient.find(obj => obj.username == data.login_user1);
      if (_client1)
        this.server.to(_client1.id).emit('returnRemoveFriend', true);
      const _client2 = arrClient.find(obj => obj.username == data.login_user2);
      if (_client2)
        this.server.to(_client2.id).emit('returnRemoveFriend', true);
    }
  }

  //ROOMS EVENTS

  @SubscribeMessage('createChatRooms')
  async createChatRooms(client: Socket, data: any) {
    this.logger.log(`${client.id} create Rooms`);
    const search = arrRoom.find(obj => obj.name == data.name);
    if (search) {
      console.log("room name already exist");
      return;
    }
    console.log("data: ", data);
    console.log("createChatRoom password: ", data.password, data.password.lenght);
    let password = data.password;
    if (password.lenght <= 0 || !password)
      password = "NoPassword";
    console.log("createChatRoom password: ", password, password.length);
    const newRooms = {
      name: data.name,
      description: data.description,
      password: password,
      identifiant: data.identifiant,
      owner_id: data.owner_id,
      publicOrPrivate: data.publicOrPrivate,
      passwordOrNot: data.passwordOrNot
    }
    //const roomReturn = await this.http.post('https://localhost:5001/rooms', newRooms);
    const roomReturn = await this.RoomsService.createRoom(newRooms);
    console.log('chat room created');
    const newParticipant = {
      user_id: data.owner_id,
      user_login: data.owner_login,
      room_id: roomReturn.id,
      room_name: data.name,
      admin: true
    }
    const tmp_room_id = roomReturn.id;
    //const participantReturn = await this.http.post('https://localhost:5001/participants', newParticipant);
    const participantReturn = await this.ParticipantsService.createParticipant(newParticipant);
    console.log('participantReturn in eventgateway', participantReturn);
    console.log('participant created');
    // console.log('arrClient: ', arrClient);
    // console.log('data: ', data);
    const _client = arrClient.find(obj => obj.username === data.owner_login);
    // console.log('_client: ', _client);
    const newRoom = {
      id: tmp_room_id,
      name: data.name,
      users: []
    }
    if (_client != null)
      newRoom.users.push(_client);
    arrRoom.push(newRoom);
    console.log('arrRoom: ', arrRoom);
    for (let i = 0; i < arrClient.length; i++) {
      this.server.to(arrClient[i].id).emit('newRoomCreated', true);
    }
    const newMsg = {
      id_sender: data.owner_id,
      id_receiver: 0,
      login_sender: data.owner_login,
      login_receiver: "",
      userOrRoom: true,
      serverMsg: true,
      room_id: tmp_room_id,
      room_name: data.name,
      text: data.owner_login + " created chat room",
      year: getYear(),
      month: getMonth(),
      day: getDay(),
      hour: getHour(),
      minute: getMinute()
    }
    const createMsgReturn = await this.MessagesService.createMessages(newMsg);
    console.log('createMsgReturn in eventgateway', createMsgReturn);
    const room = arrRoom.find(obj => obj.name == data.name);
    console.log("room: ", room);
    let i = 0;
    while (i < room.users.length) {
      console.log("newMsgReceived to ", room.users[i].username);
      this.server.to(room.users[i].id).emit('newMsgReceived', true);
      i++;
    }
  };

  @SubscribeMessage('removeRoom')
  async removeRoom(client: Socket, data: any) {
    this.logger.log(`${client.id} remove Room`);
    //const removeRoomReturn = await this.http.post('https://localhost:5001/rooms/' + data.id + '/' + data.room_name);
    const removeRoomReturn = await this.RoomsService.removeRoom(data.id, data.room_name);
    console.log("removeRoomReturn: ", removeRoomReturn);
    if (removeRoomReturn) {
      // console.log("test");
      const _room = arrRoom.find(obj => obj.name == data.room_name);
      if (_room != null) {
        console.log(_room.name, " has been deleted");
        let i = 0;
        while (i < _room.users.length) {
          //const removeParticipantReturn = await this.http.post('https://localhost:5001/participants/' + _room.users[i].username + '/' + _room.name);
          const removeParticipantReturn = await this.ParticipantsService.removeParticipant(_room.users[i].username, _room.name);
          const _notif = arrNotifs.find(obj => obj.username == _room.users[i].username);
          if (_notif) {
            const _notifToReset = _notif.notifs.findIndex(obj => obj.name == _room.name);
            if (_notifToReset)
              _notif.notifs.splice(_notifToReset);
          }
          console.log("delete members"), removeParticipantReturn;
          i++;
        }
        //const toRemoveMsg = {
        //  room_id: _room.id,
        //  room_name: _room.name
        //}
        //const removeAllRoomMessagesReturn = await this.http.post('https://localhost:5001/messages/removeAllRoomMessages/', toRemoveMsg);
        const removeAllRoomMessagesReturn = await this.MessagesService.removeAllRoomMessages(_room.id, _room.name);
        console.log("delete members", removeAllRoomMessagesReturn);
        if (removeAllRoomMessagesReturn) {
          i = 0;
          while (i < arrClient.length) {
            this.server.to(arrClient[i].id).emit('roomHasBeenDeleted', _room.name);
            console.log("Send roomHasBeenDeleted to ", arrClient[i].username);
            i++;
          }
        }
        const index = arrRoom.indexOf(_room);
        arrRoom.splice(index);
      }

    };
  }

  @SubscribeMessage('joinChatRoom')
  async joinChatRoom(client: Socket, data: any) {
    this.logger.log(`${client.id} want to join `, data.room_name);
    let tmpPassword: string = data.password;
    if (tmpPassword.length <= 0)
      tmpPassword = "noPassword";
    //const tmp = 'https://localhost:5001/rooms/' + data.user_id + '/' + data.user_login + '/' + data.room_id + '/' + data.room_name + '/' + tmpPassword + '/';
    //const checkIfCanJoinReturn = await this.http.get(tmp);
    const checkIfCanJoinReturn = await this.RoomsService.checkIfCanJoin(data.user_id, data.user_login, data.room_id, data.room_name, tmpPassword);
    if (checkIfCanJoinReturn == "ok") {
      const verifIfOwner = await this.RoomsService.checkIfOwner(data.user_id, data.room_name);
      const adminTmp = verifIfOwner;
      this.logger.log(`${client.id} create Participant`);
      const newParticipant = {
        user_id: data.user_id,
        user_login: data.user_login,
        room_id: data.room_id,
        room_name: data.room_name,
        admin: adminTmp
      }
      //const participantReturn = await this.http.post('https://localhost:5001/participants', newParticipant);
      const participantReturn = await this.ParticipantsService.createParticipant(newParticipant);
      console.log('participantReturn in eventgateway', participantReturn);
      const newMsg = {
        id_sender: data.user_id,
        id_receiver: 0,
        login_sender: data.user_login,
        login_receiver: "",
        userOrRoom: true,
        serverMsg: true,
        room_id: data.room_id,
        room_name: data.room_name,
        text: data.user_login + " join chat room",
        year: getYear(),
        month: getMonth(),
        day: getDay(),
        hour: getHour(),
        minute: getMinute()
      }
      const createMsgReturn = await this.MessagesService.createMessages(newMsg);
      console.log('createMsgReturn in eventgateway', createMsgReturn);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      console.log("room: ", room);
      let i = 0;
      while (i < room.users.length) {
        this.server.to(room.users[i].id).emit('newMsgReceived', true);
        i++;
      }
      console.log('arrClient: ', arrClient);
      const _client = arrClient.find(obj => obj.username === data.user_login);
      console.log('_client: ', _client);
      if (_client != null) {
        console.log(_client.username, " join ", data.room_name);
        this.server.to(_client.id).emit('joinChatRoomAccepted', true);
        console.log('arrRoom: ', arrRoom);
        const a = arrRoom.find(obj => obj.name == data.room_name);
        console.log('a: ', a);
        a.users.push(_client);
        console.log('arrRoom: ', arrRoom);
        let i = 0;
        while (i < a.users.length) {
          this.server.to(a.users[i].id).emit('newParticipant', true);
          i++;
        }
      }
    }
    else {
      this.server.to(client.id).emit('cantJoinChatRoom', checkIfCanJoinReturn);
    }
  }


  @SubscribeMessage('changePassword')
  async changePassword(client: Socket, data: any) {
    this.logger.log(`${client.id} want to change password to `, data.room_name);
    if (data.passwordOrNot && data.password.lenght <= 0) {
      console.log("empty password");
      return;
    }
    let verif = false;
    //const checkIfAdmin = await http.get('https://localhost:5001/participants/checkAdmin/' + data.login + '/' + data.room_name);
    const checkIfAdmin = await this.ParticipantsService.checkAdmin(data.login, data.room_name);
    if (checkIfAdmin == true) {
      console.log("room_name: ", data.room_name);
      /*const newMdp = {
        room_name: data.room_name,
        passwordOrNot: data.passwordOrNot,
        password: data.password
      }*/
      //const changeMdpReturn = await http.post('https://localhost:5001/rooms/changePassword/', newMdp);
      const changeMdpReturn = await this.RoomsService.changePassword(data.room_name, data.passwordOrNot, data.password);
      console.log('changeMdpReturn in eventgateway', changeMdpReturn);
      const newMsg = {
        id_sender: 0,
        id_receiver: 0,
        login_sender: "server",
        login_receiver: "",
        userOrRoom: true,
        serverMsg: true,
        room_id: data.room_id,
        room_name: data.room_name,
        text: "password has been changed",
        year: getYear(),
        month: getMonth(),
        day: getDay(),
        hour: getHour(),
        minute: getMinute()
      }
      const createMsgReturn = await this.MessagesService.createMessages(newMsg);
      console.log('createMsgReturn in eventgateway', createMsgReturn);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      console.log("room: ", room);
      let i = 0;
      while (i < room.users.length) {
        this.server.to(room.users[i].id).emit('newMsgReceived', true);
        i++;
      }
    }
    else {
      console.log("can't change password: user isn't admin");
    }
  }

  //PARTICIPANTS EVENTS

  @SubscribeMessage('createParticipant')
  async createParticipant(client: Socket, data: any) {
    this.logger.log(`${client.id} create Participant, data: `, data);
    const verifIfOwner = await this.RoomsService.checkIfOwner(data.user_id, data.room_name);
    const adminTmp = verifIfOwner;
    const checkIfPrivate = await this.RoomsService.checkIfPrivate(data.room_name);
    const newParticipant = {
      user_id: data.user_id,
      user_login: data.user_login,
      room_id: data.room_id,
      room_name: data.room_name,
      admin: adminTmp,
      publicOrPrivate: checkIfPrivate
    }
    //const participantReturn = await this.http.post('https://localhost:5001/participants', newParticipant);
    const participantReturn = await this.ParticipantsService.createParticipant(newParticipant);
    console.log('participantReturn in eventgateway', participantReturn);
    const newMsg = {
      id_sender: data.user_id,
      id_receiver: 0,
      login_sender: data.user_login,
      login_receiver: "",
      userOrRoom: true,
      serverMsg: true,
      room_id: data.room_id,
      room_name: data.room_name,
      text: data.user_login + " join chat room",
      year: getYear(),
      month: getMonth(),
      day: getDay(),
      hour: getHour(),
      minute: getMinute()
    }
    const createMsgReturn = await this.MessagesService.createMessages(newMsg);
    console.log('createMsgReturn in eventgateway', createMsgReturn);
    const room = arrRoom.find(obj => obj.name == data.room_name);
    console.log("room: ", room);
    let i = 0;
    while (i < room.users.length) {
      this.server.to(room.users[i].id).emit('newMsgReceived', true);
      i++;
    }
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
      console.log("room: ", a);
      let i = 0;
      while (i < a.users.length) {
        console.log("send newParticipent to ", a.users[i].username);
        this.server.to(a.users[i].id).emit('newParticipant', true);
        i++;
      }
    }
  }

  @SubscribeMessage('removeParticipant')
  async removeParticipant(client: Socket, data: any) {
    this.logger.log(`${client.id} want remove Participant`);
    const _client_sender = arrClient.find(obj => obj.id == client.id);
    if (_client_sender.username != data.login) {
      console.log(_client_sender.username, " want remove ", data.login);
      const verifIfAdmin = await this.ParticipantsService.checkAdmin(_client_sender.username, data.room_name);
      if (!verifIfAdmin) {
        console.log("Fail, he isn't admin");
        return;
      }
    }
    else
      console.log(_client_sender.username, " want quit room ");
    const verifIfReceiverIsAdmin = await this.ParticipantsService.checkAdmin(data.login, data.room_name);
    console.log("verifIfReceiverIsAdmin: ", verifIfReceiverIsAdmin);
    if (verifIfReceiverIsAdmin) {
      const verifIfOwner = await this.RoomsService.checkIfOwner(data.id_sender, data.room_name);
      console.log("verifIfOwner: ", verifIfOwner);
      if (!verifIfOwner)
        return;
    }
    const removeParticipantReturn = await this.ParticipantsService.removeParticipant(data.login, data.room_name);
    const _notif = arrNotifs.find(obj => obj.username == data.login);
    if (_notif) {
      const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.room_name);
      if (_notifToReset)
        _notif.notifs.splice(_notifToReset);
    }
    if (removeParticipantReturn) {
      this.server.to(client.id).emit('removeParticipantReturn', true);
      const _client = arrClient.find(obj => obj.username == data.login);
      if (_client != undefined) {
        console.log(_client.username, " quit ", data.room_name);
        const newMsg = {
          id_sender: 0,
          id_receiver: 0,
          login_sender: "server",
          login_receiver: "",
          userOrRoom: true,
          serverMsg: true,
          room_id: data.room_id,
          room_name: data.room_name,
          text: data.login + " quit chat room",
          year: getYear(),
          month: getMonth(),
          day: getDay(),
          hour: getHour(),
          minute: getMinute()
        }
        const createMsgReturn = await this.MessagesService.createMessages(newMsg);
        console.log('createMsgReturn in eventgateway', createMsgReturn);
        const room2 = arrRoom.find(obj => obj.name == data.room_name);
        console.log("room: ", room2);
        let i2 = 0;
        while (i2 < room2.users.length) {
          this.server.to(room2.users[i2].id).emit('newMsgReceived', true);
          i2++;
        }
        this.server.to(_client.id).emit('kickedOutOfTheGroup', true);
        if (_client_sender.username != data.login)
          this.server.to(_client.id).emit('notif', { type: 'YOUWEREKICKEDOUTTHEGROUP', data: { room_name: data.room_name, login_sender: _client_sender.username } })
        const index = arrRoom.find(obj => obj.name == data.room_name).users.indexOf(_client);
        arrRoom.find(obj => obj.name == data.room_name).users.splice(index);
        const room = arrRoom.find(obj => obj.name == data.room_name);
        console.log("room: ", room);
        let i = 0;
        while (i < room.users.length) {
          this.server.to(room.users[i].id).emit('removeParticipantReturn', true);
          i++;
        }
      }
      else
        arrNotifInWait.push({ login: data.login, notif: { type: 'YOUWEREKICKEDOUTTHEGROUP', data: { room_name: data.room_name, login_sender: _client_sender.username } } })
    }
  }

  @SubscribeMessage('createAdmin')
  async createAdmin(client: Socket, data: any) {
    let verif = false;
    //const checkIfOwner = await this.http.get('https://localhost:5001/rooms/checkIfOwner/' + data.id_sender + '/' + data.login_sender);
    const checkIfOwner = await this.RoomsService.checkIfOwner(data.id_sender, data.login_sender);
    if (checkIfOwner == true)
      verif = true;
    // const checkIfAdmin = await this.http.get('https://localhost:5001/participants/checkAdmin/' + data.login_sender + '/' + data.room_name);
    const checkIfAdmin = await this.ParticipantsService.checkAdmin(data.login_sender, data.room_name);
    if (checkIfAdmin == true)
      verif = true;
    //const checkParticipant = await this.http.get('https://localhost:5001/participants/checkIfAdminOrParticipant/' + data.login_admin + '/' + data.room_name);
    const checkParticipant = await this.ParticipantsService.checkIfAdminOrParticipant(data.login_admin, data.room_name);
    this.logger.log(`${checkParticipant} data`);
    console.log("verif : ", verif);
    if (checkParticipant == true && verif == true) {
      this.logger.log(`${client.id} create Admin: `, data.login_admin);
      const newParticipant = {
        user_id: data.id_admin,
        user_login: data.login_admin,
        room_id: data.room_id,
        room_name: data.room_name,
        admin: true
      };
      //const participantReturn = await this.http.post('https://localhost:5001/participants/admin', newParticipant);
      const participantReturn = await this.ParticipantsService.createAdmin(newParticipant);
      console.log('participantReturn in eventgateway', participantReturn);
      const newMsg = {
        id_sender: 0,
        id_receiver: 0,
        login_sender: "server",
        login_receiver: "",
        userOrRoom: true,
        serverMsg: true,
        room_id: data.room_id,
        room_name: data.room_name,
        text: data.login_admin + " is admin",
        year: getYear(),
        month: getMonth(),
        day: getDay(),
        hour: getHour(),
        minute: getMinute()
      }
      const createMsgReturn = await this.MessagesService.createMessages(newMsg);
      console.log('createMsgReturn in eventgateway', createMsgReturn);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      console.log("room: ", room);
      let i2 = 0;
      while (i2 < room.users.length) {
        this.server.to(room.users[i2].id).emit('newMsgReceived', true);
        i2++;
      }
      const a = arrRoom.find(obj => obj.name == data.room_name);
      console.log("room: ", a);
      let i = 0;
      while (i < a.users.length) {
        console.log("refreshParticipants to ", a.users[i].username)
        this.server.to(a.users[i].id).emit('refreshParticipants', true);
        i++;
      }
    }
  }

  @SubscribeMessage('removeAdmin')
  async removeAdmin(client: Socket, data: any) {
    let verif = false;
    console.log("remove admin");
    //const checkIfOwner = await this.http.get('https://localhost:5001/rooms/checkIfOwner/' + data.id_sender + '/' + data.login_sender);
    const checkIfOwner = await this.RoomsService.checkIfOwner(data.id_sender, data.login_sender);
    if (checkIfOwner == true)
      verif = true;
    // const checkIfAdmin = await this.http.get('https://localhost:5001/participants/checkAdmin/' + data.login_sender + '/' + data.room_name);
    const checkIfAdmin = await this.ParticipantsService.checkAdmin(data.login_sender, data.room_name);
    if (checkIfAdmin == true)
      verif = true;
    //const checkParticipant = await this.http.get('https://localhost:5001/participants/checkIfAdminOrParticipant/' + data.login_admin + '/' + data.room_name);
    const checkParticipant = await this.ParticipantsService.checkAdmin(data.login_admin, data.room_name);
    this.logger.log(`${checkParticipant} data`);
    console.log("verif : ", verif);
    if (checkParticipant == true && verif == true) {
      this.logger.log(`${client.id} remove Admin: `, data.login_admin);
      const newParticipant = {
        user_id: data.id_admin,
        user_login: data.login_admin,
        room_id: data.room_id,
        room_name: data.room_name,
        admin: true
      };
      //const participantReturn = await this.http.post('https://localhost:5001/participants/admin', newParticipant);
      const participantReturn = await this.ParticipantsService.removeAdmin(newParticipant);
      console.log('participantReturn in eventgateway', participantReturn);
      const newMsg = {
        id_sender: 0,
        id_receiver: 0,
        login_sender: "server",
        login_receiver: "",
        userOrRoom: true,
        serverMsg: true,
        room_id: data.room_id,
        room_name: data.room_name,
        text: data.login_admin + " is not longer admin",
        year: getYear(),
        month: getMonth(),
        day: getDay(),
        hour: getHour(),
        minute: getMinute()
      }
      const createMsgReturn = await this.MessagesService.createMessages(newMsg);
      console.log('createMsgReturn in eventgateway', createMsgReturn);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      console.log("room: ", room);
      let i2 = 0;
      while (i2 < room.users.length) {
        this.server.to(room.users[i2].id).emit('newMsgReceived', true);
        i2++;
      }
      const a = arrRoom.find(obj => obj.name == data.room_name);
      console.log("room: ", a);
      let i = 0;
      while (i < a.users.length) {
        console.log("refreshParticipants to ", a.users[i].username)
        this.server.to(a.users[i].id).emit('refreshParticipants', true);
        i++;
      }
    }
  }

  //NEW CHAT EVENTS

  NewMsgNotif = (receiver_name: string, sender_name: string, userOrRoom: boolean) => {
    console.log("NewMsgNotif arrNotif.length: ", arrNotifs.length);
    let _notifClient = arrNotifs.find(obj => obj.username == receiver_name);
    console.log("_notifClient.notifs.length", _notifClient.notifs.length)
    if (_notifClient) {
      let _notif;
      if (!userOrRoom) {
        _notif = _notifClient.notifs.find(obj => (obj.name == sender_name && !obj.userOrRoom));
      }
      else {
        console.log("sender_name: ", sender_name, ", userOrRoom: ", userOrRoom);
        _notif = _notifClient.notifs.find(obj => (obj.name == sender_name && obj.userOrRoom));
      }
      console.log("_notif: ", _notif);
      if (_notif) {
        _notif.nb += 1;
      }
      else {
        let newNotif = {
          id: 0,
          nb: 1,
          name: sender_name,
          userOrRoom: userOrRoom
        }
        _notifClient.notifs.push(newNotif);
      }
      const _client = arrClient.find(obj => obj.username == receiver_name);
      if (_client) {
        this.logger.log("emit newChatNotif to ", _client.username);
        this.server.to(_client.id).emit('newChatNotif', { name: sender_name, userOrRoom: userOrRoom });
      }
      const tmp = _notifClient.notifs.find(obj => obj.name == sender_name);
      if (tmp)
        this.logger.log("NewMsgNotif _notifClient.sender_name.nb = ", tmp.nb);
      else
        this.logger.log("NewMsgNotif tmp not found");
    }
    else {
      console.log("NewMsgNotif notifClient not found");
      return;
    }
  };

  @SubscribeMessage('delChatNotifs')
  async delChatNotifs(client: Socket, data: any) {
    console.log("delChatNotifs, data.name: ", data.name, ", data.userOrRoom: ", data.userOrRoom);
    const _notif = arrNotifs.find(obj => obj.username == data.loginOwner);
    if (_notif) {
      const _notifToReset = _notif.notifs.find(obj => (obj.name == data.name && obj.userOrRoom == data.userOrRoom));
      if (_notifToReset) {
        _notifToReset.nb = 0;
        console.log("_notifToReset.nb: ", _notifToReset.nb);
      }
      else {
        this.logger.log("delChatNotifs _notifToReset not found");
      }
    }
    else {
      this.logger.log("delChatNotifs _notif not found");
    }
    console.log("DELCHATNOTIFS arrNotif.length: ", arrNotifs.length);
  }

  @SubscribeMessage('createMsg')
  async createMsg(client: Socket, data: any) {
    this.logger.log(`${client.id} create newMsg: ${data.text}`);
    let verifBan = false;
    let verifMute = false;
    if (!data.userOrRoom) {
      //const checkIfBanned = await http.get('https://localhost:5001/blackList/checkUserBan/' + data.login_sender + '/' + data.login_receiver);
      const checkIfBanned = await this.BlacklistService.checkUserBan(data.login_sender, data.login_receiver);
      console.log("item.data: ", checkIfBanned);
      if (checkIfBanned == true)
        verifBan = true;
    }
    else {
      //const checkIfBanned = await http.get('https://localhost:5001/blackList/checkRoomBan/' + data.id_sender + '/' + data.login_sender + '/' + data.room_name);
      const checkIfBanned = await this.BlacklistService.checkRoomBan(data.id_sender, data.login_sender, data.room_name);
      console.log("item.data: ", checkIfBanned);
      if (checkIfBanned == true)
        verifBan = true;
    }
    //const checkIfMuted = await http.get('https://localhost:5001/muteList/checkRoomMute/' + data.id_sender + '/' + data.login_sender + '/' + data.room_name);
    const checkIfMuted = await this.MutelistService.checkRoomMute(data.id_sender, data.login_sender, data.room_name);

    console.log("item.data: ", checkIfMuted);
    if (checkIfMuted == true)
      verifMute = true;
    console.log("verifBan: ", verifBan);
    if (!verifBan && !verifMute) {
      const newMsg = {
        id_sender: data.id_sender,
        id_receiver: data.id_receiver,
        login_sender: data.login_sender,
        login_receiver: data.login_receiver,
        userOrRoom: data.userOrRoom,
        serverMsg: false,
        room_id: data.room_id,
        room_name: data.room_name,
        text: data.text,
        year: getYear(),
        month: getMonth(),
        day: getDay(),
        hour: getHour(),
        minute: getMinute()
      }
      //console.log("msg: ", newMsg);
      //const returnMsg = this.http.post('https://localhost:5001/messages/', newMsg);
      const returnMsg = await this.MessagesService.createMessages(newMsg);
      //console.log('returnMsg in eventgateway', returnMsg);
      //console.log("after post creqteMsg");
      if (!data.userOrRoom) {
        const _client_receiver = arrClient.find(obj => obj.username === data.login_receiver);
        if (_client_receiver != null) {
          //console.log("newMsgReceived to ", _client_receiver.username);
          this.server.to(_client_receiver.id).emit('newMsgReceived', data);
          // this.logger.log("arrNotif.length : ", arrNotifs.length);
          // this.logger.log("arrNotif[0] : ", arrNotifs[0].notifs[0].nb);
        }
        this.NewMsgNotif(data.login_receiver, data.login_sender, false);
      }
      else {
        //console.log("arrRoom ", arrRoom);
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        //console.log("room ", room);
        //console.log("room.users ", room.users);
        console.log("room.users.length: ", room.users.length);
        while (i < room.users.length) {
          console.log('new Msg to ', room.users[i].username, room.users[i].id);
          this.server.to(room.users[i].id).emit('newMsgReceived', data);
          this.NewMsgNotif(room.users[i].username, data.room_name, true);
          i++;
        }
      }
    }
  }

  //BLACK LIST EVENTS

  @SubscribeMessage('createBan')
  async createBan(client: Socket, data: any) {
    this.logger.log(`${client.id} create newBan: ${data.login_banned}`);
    //const checkFriendship = await this.http.get('https://localhost:5001/friendList/' + data.id_banned + '/' + data.id_sender);
    const checkFriendship = await this.FriendListService.checkExistRelation(data.id_banned, data.id_sender);
    if (checkFriendship == true) {
      this.logger.log(`${client.id} remove Friend`);
      //const removeFriendReturn = await this.http.post('https://localhost:5001/friendList/' + data.id_banned + '/' + data.id_sender);
      const removeFriendReturn = await this.FriendListService.removeFriendShip(data.id_banned, data.id_sender);
      const _notif = arrNotifs.find(obj => obj.username == data.login_banned);
      if (_notif) {
        const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.login_sender);
        if (_notifToReset)
          _notif.notifs.splice(_notifToReset);
      }
      const _notif2 = arrNotifs.find(obj => obj.username == data.login_sender);
      if (_notif2) {
        const _notifToReset2 = _notif2.notifs.findIndex(obj => obj.name == data.login_banned);
        if (_notifToReset2)
          _notif2.notifs.splice(_notifToReset2);
      }
      console.log('removeFriendReturn in eventgateway', removeFriendReturn);
      this.server.to(client.id).emit('returnRemoveFriend', true);
      const _client_receiver = arrClient.find(obj => obj.username === data.login_banned);
      if (_client_receiver != null) {
        console.log("returnRemoveFriend to ", _client_receiver.username);
        this.server.to(_client_receiver.id).emit('returnRemoveFriend', true);
      }
    }
    console.log("createBan suite");
    const newBan = {
      id_sender: data.id_sender,
      id_banned: data.id_banned,
      login_sender: data.login_sender,
      login_banned: data.login_banned,
      userOrRoom: data.userOrRoom,
      receiver_login: data.receiver_login,
      room_id: data.room_id,
      room_name: data.room_name,
      cause: data.cause,
      date: time,
      alwaysOrNot: data.alwaysOrNot,
      timer: data.timer
    }
    const returnBan = await this.BlacklistService.createBan(newBan);
    if (returnBan) {
      const tmp = arrClient.find(obj => obj.id == client.id);
      if (tmp)
        console.log("userBanned to ", tmp.username);
      else
        console.log("userBanned to ", client.id);
      this.server.to(client.id).emit('userBanned', true);
      const _client = arrClient.find(obj => obj.username == data.login_banned);
      if (_client) {
        console.log("userBanned to ", _client.username);
        this.server.to(_client.id).emit('userBanned', true);
      }
    }
  }

  @SubscribeMessage('removeUserBan')
  async removeUserBan(client: Socket, data: any) {
    this.logger.log(`${client.id} want deban: ${data.login_banned}`);
    const removeBanReturn = await this.BlacklistService.removeUserBan(data.id_sender, data.login_banned);
    if (removeBanReturn) {
      const tmp = arrClient.find(obj => obj.id == client.id);
      if (tmp)
        console.log("debanedUser to ", tmp.username);
      else
        console.log("debanedUser to ", client.id);
      this.server.to(client.id).emit('debanedUser', true);
      const _client = arrClient.find(obj => obj.username == data.login_banned);
      if (_client) {
        console.log("debanedUser to ", _client.username);
        this.server.to(_client.id).emit('debanedUser', true);
      }
    }
  }

  @SubscribeMessage('createRoomBan')
  async createRoomBan(client: Socket, data: any) {
    this.logger.log(`${client.id} create newRoomBan: ${data.login_banned} in ${data.room_name}`);
    const checkParticipant = await this.ParticipantsService.checkIfAdminOrParticipant(data.login_banned, data.room_name);
    if (checkParticipant) {
      this.logger.log(`${client.id} remove Participant`);
      //const removeParticipantReturn = await this.http.post('https://localhost:5001/participants/' + data.login_banned + '/' + data.room_name);
      const removeParticipantReturn = await this.ParticipantsService.removeParticipant(data.login_banned, data.room_name);
      const _notif = arrNotifs.find(obj => obj.username == data.login_banned);
      if (_notif) {
        const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.room_name);
        if (_notifToReset)
          _notif.notifs.splice(_notifToReset);
      }
      console.log('removeParticipantReturn in eventgateway', removeParticipantReturn);
      const newMsg = {
        id_sender: 0,
        id_receiver: 0,
        login_sender: "server",
        login_receiver: "",
        userOrRoom: true,
        serverMsg: true,
        room_id: data.room_id,
        room_name: data.room_name,
        text: data.login_banned + " was banned",
        year: getYear(),
        month: getMonth(),
        day: getDay(),
        hour: getHour(),
        minute: getMinute()
      }
      const createMsgReturn = await this.MessagesService.createMessages(newMsg);
      console.log('createMsgReturn in eventgateway', createMsgReturn);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      console.log("room: ", room);
      let i = 0;
      while (i < room.users.length) {
        this.server.to(room.users[i].id).emit('newMsgReceived', true);
        i++;
      }
      this.server.to(client.id).emit('removeParticipantReturn', true);
      console.log("arrClient: ", arrClient);
      const _client = arrClient.find(obj => obj.username == data.login_banned);
      // console.log("client: ", _client.username);
      if (_client != undefined) {
        console.log(_client.username, " quit ", data.room_name);
        this.server.to(_client.id).emit('kickedOutOfTheGroup', true);
        this.server.to(_client.id).emit('notif', { type: 'YOUWEREBANFROMTHEGROUP', data: { room_name: data.room_name, login_sender: data.login_sender } })
        const index = arrRoom.find(obj => obj.name == data.room_name).users.indexOf(_client);
        arrRoom.find(obj => obj.name == data.room_name).users.splice(index);
        const room = arrRoom.find(obj => obj.name == data.room_name);
        console.log("room: ", room);
        let i = 0;
        while (i < room.users.length) {
          this.server.to(room.users[i].id).emit('removeParticipantReturn', true);
          i++;
        }
      }
      else
        arrNotifInWait.push({ login: data.login_banned, notif: { type: 'YOUWEREBANFROMTHEGROUP', data: { room_name: data.room_name, login_sender: data.login_sender } } })
    }
    const verifIfBanExist = await this.BlacklistService.checkRoomBan(data.id_banned, data.login_banned, data.room_name);
    const verifIfReceiverIsAdmin = await this.ParticipantsService.checkAdmin(data.login_banned, data.room_name);
    const verifIfSenderIsAdmin = await this.ParticipantsService.checkAdmin(data.login_sender, data.room_name);
    if (verifIfSenderIsAdmin && !verifIfReceiverIsAdmin && !verifIfBanExist) {
      console.log("createBan suite");
      const newBan = {
        id_sender: data.id_sender,
        id_banned: data.id_banned,
        login_sender: data.login_sender,
        login_banned: data.login_banned,
        userOrRoom: data.userOrRoom,
        receiver_login: data.receiver_login,
        room_id: data.room_id,
        room_name: data.room_name,
        cause: data.cause,
        date: time,
        alwaysOrNot: data.alwaysOrNot,
        timer: data.timer
      }
      const returnBan = await this.BlacklistService.createBan(newBan);
      if (returnBan) {
        //console.log("arrRoom ", arrRoom);
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        // console.log("room ", room);
        // console.log("room.users ", room.users);
        // console.log("room.users.length: ", room.users.length);
        while (i < room.users.length) {
          console.log("emit to: ", room.users[i].username);
          this.server.to(room.users[i].id).emit('newRoomBan', true);
          i++;
        }
      }
    }
  };

  @SubscribeMessage('removeRoomBan')
  async removeRoomBan(client: Socket, data: any) {
    this.logger.log(`${client.id} want deban: ${data.login_banned} in room_id: ${data.room_id}`);
    const removeBanReturn = await this.BlacklistService.removeRoomBan(data.room_id, data.login_banned);
    if (removeBanReturn) {
      //console.log("arrRoom ", arrRoom);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      // console.log("room ", room);
      // console.log("room.users ", room.users);
      // console.log("room.users.length: ", room.users.length);
      while (i < room.users.length) {
        console.log("emit to: ", room.users[i].username);
        this.server.to(room.users[i].id).emit('debanedUserInRoom', true);
        i++;
      }
    }
  }

  //MUTELIST EVENTS

  @SubscribeMessage('createRoomMute')
  async createRoomMute(client: Socket, data: any) {
    //const checkParticipant = await http.get('https://localhost:5001/participants/check/' + data.login_muted + '/' + data.room_name);
    const checkParticipant = await this.ParticipantsService.checkParticipant(data.login_muted, data.room_name);
    if (checkParticipant == true) {
      this.logger.log(`${client.id} create newRoomMute: ${data.login_muted} in ${data.room_name}`);
      console.log("data.alwaysOrNot: ", data.alwaysOrNot);
      const newMute = {
        id_sender: data.id_sender,
        id_muted: data.id_muted,
        login_sender: data.login_sender,
        login_muted: data.login_muted,
        userOrRoom: data.userOrRoom,
        receiver_login: data.receiver_login,
        room_id: data.room_id,
        room_name: data.room_name,
        cause: data.cause,
        date: time,
        alwaysOrNot: data.alwaysOrNot,
        timer: data.timer
      }
      const returnMute = await this.MutelistService.createMute(newMute);
      if (returnMute) {
        const newMsg = {
          id_sender: 0,
          id_receiver: 0,
          login_sender: "server",
          login_receiver: "",
          userOrRoom: true,
          serverMsg: true,
          room_id: data.room_id,
          room_name: data.room_name,
          text: data.login_muted + " was muted",
          year: getYear(),
          month: getMonth(),
          day: getDay(),
          hour: getHour(),
          minute: getMinute()
        }
        const createMsgReturn = await this.MessagesService.createMessages(newMsg);
        console.log('createMsgReturn in eventgateway', createMsgReturn);
        const room2 = arrRoom.find(obj => obj.name == data.room_name);
        console.log("room: ", room2);
        let i2 = 0;
        while (i2 < room2.users.length) {
          this.server.to(room2.users[i2].id).emit('newMsgReceived', true);
          i2++;
        }
        //console.log("arrRoom ", arrRoom);
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        // console.log("room ", room);
        // console.log("room.users ", room.users);
        // console.log("room.users.length: ", room.users.length);
        while (i < room.users.length) {
          this.server.to(room.users[i].id).emit('mutedUserInRoom', true);
          i++;
        }
      }
    }
  }

  @SubscribeMessage('removeRoomMute')
  async removeRoomMute(client: Socket, data: any) {
    this.logger.log(`${client.id} want demute: ${data.login_muted} in : ${data.room_name}`);
    const tmp = 'https://localhost:5001/muteList/removeRoomMute/' + data.room_id + '/' + data.login_muted;
    console.log(tmp);
    const removeMuteReturn = await this.MutelistService.removeRoomMute(data.room_id, data.login_muted);
    if (removeMuteReturn) {
      //console.log("arrRoom ", arrRoom);
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      // console.log("room ", room);
      // console.log("room.users ", room.users);
      // console.log("room.users.length: ", room.users.length);
      while (i < room.users.length) {
        this.server.to(room.users[i].id).emit('demutedUserInRoom', true);
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
    for (let i = 0; i < this.pongInfo.length; i++) {
      //console.log('this.pongInfo[i] :', this.pongInfo[i])
      for (let j = 0; j < 2; j++) {
        //console.log('this.pongInfo[i].players[j] :', this.pongInfo[i].players[j])

        if (this.pongInfo[i].players[j].user.login == ClientLogin) {

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

    console.log(tmp)
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

    const room = this.getRoomByClientLogin(info.user.login)

    //console.log('check reconnexion :', room)

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

    // this.pongInfo.forEach((item) => {
    //   item.players.forEach(async (player) => {
    //     if (item.started && player.user.login == info.user.login) {
    //       this.joinRoom(client, item.roomID)
    //       player.id = client.id
    //       player.connected = true
    //       player.sendNotif = false

    //       const friendList = await this.FriendListService.getUserFriendListWithLogin(player.user.login);

    //       for (let i = 0; i < friendList.length; i++) {
    //         let loginTmp: string;
    //         if (friendList[i].login_user1 == player.user.login)
    //           loginTmp = friendList[i].login_user2;
    //         else
    //           loginTmp = friendList[i].login_user1;
    //         const _client = arrClient.find(obj => obj.username == loginTmp);
    //         if (_client) {
    //           this.server.to(_client.id).emit('friendConnection', true);
    //           console.log("emit friendConnection to ", _client.username);
    //         }
    //       }

    //     }


    // })
    // item.spectate.forEach((spectator) => {
    //   if (spectator.user.login == info.user.login) {
    //     this.joinRoom(client, item.roomID)
    //     spectator.id = client.id
    //     spectator.user = info.user
    //     this.server.to(client.id).emit('start', item.roomID)
    //   }
    // })
    // })
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

          this.pongInfo[room[0]].players.forEach(async player => {

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
                //console.log("emit friendConnection to ", _client.username);
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
  async leaveQueue(
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
    }) {
    const room = this.getRoomByClientLogin(info.user.login)

    if (room != null) {
      this.pongInfo.splice(room[0], 1)

      this.server.to(client.id).emit('leave_queue')

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

              const friendList = await this.FriendListService.getUserFriendListWithLogin(this.pongInfo[index].players[i].user.login);

              for (let i = 0; i < friendList.length; i++) {
                let loginTmp: string;
                if (friendList[i].login_user1 == this.pongInfo[index].players[i].user.login)
                  loginTmp = friendList[i].login_user2;
                else
                  loginTmp = friendList[i].login_user1;
                const _client = arrClient.find(obj => obj.username == loginTmp);
                if (_client) {
                  this.server.to(_client.id).emit('friendConnection', true);
                  //console.log("emit friendConnection to ", _client.username);
                }
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

              //const match = http.post('https://localhost:5001/matchesHistory', data);
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
                    //console.log("emit friendConnection to ", _client.username);
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

    var room = this.getRoomByID(roomID);

    if (room != null) {

      if (room[1].spectate.find(spectator => spectator.id == client.id, true) != undefined) {
        this.server.to(client.id).emit('render', this.pongInfo[room[0]])
        return
      }

      if (this.pongInfo[room[0]].players[0].score == 3 || this.pongInfo[room[0]].players[1].score == 3) {

        console.log('ouioui')

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
              //console.log("emit friendConnection to ", _client.username);
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
    var room = this.getRoomByID(info[0])
    if (room != null) {

      this.pongInfo[room[0]].ball.x = this.pongInfo[room[0]].canvas.width / 2
      this.pongInfo[room[0]].ball.dx = 0
      this.pongInfo[room[0]].ball.dy = 0.2

      // for (let index = 0; index < 2; index++)
      //   if (this.pongInfo[room[0]].players[index].id == client.id) {

      //   }

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
      userLoginToSend: string,
    }) {

    console.log(info.userLoginToSend)

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

    var room = this.getRoomByID("custom" + info.inviteID)

    //console.log('room :', room, room[1].map.obstacles)

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

  @SubscribeMessage('CHECK_IF_FRIEND_OR_INVIT')
  async checkIfFriendOrInvit(client: Socket, data: { id1: number, id2: number }) {
    //console.log("CHECK_IF_FRIEND_OR_INVIT id1: ", data.id1, ", id2: ", data.id2);
    const checkFriend = await this.FriendListService.checkExistRelation(data.id1, data.id2);
    const checkInvit = await this.invitationRequestService.checkInvitationRequest(data.id1, data.id2);
    const checkBan = await this.BlacklistService.checkUserBanWithId(data.id1, data.id2);
    //console.log("checkFriend: ", checkFriend, ", checkInvit: ", checkInvit);
    if (checkFriend)
      this.server.to(client.id).emit("returnCheckIfFriendOrInvit", 1);
    else if (checkBan) {
      this.server.to(client.id).emit("returnCheckIfFriendOrInvit", 3);
    }
    else if (checkInvit)
      this.server.to(client.id).emit("returnCheckIfFriendOrInvit", 2);
    else
      this.server.to(client.id).emit("returnCheckIfFriendOrInvit", 0);
  }

  @SubscribeMessage('GET_ALL_FRIEND_CONNECTED')
  async getAllFriendConnected(client: Socket, info: { user: any }) {

    const friendList = await this.FriendListService.getUserFriendList(info.user.id)

    let friendRes: any;

    const retArr = []

    friendRes = friendList;

    //console.log("friendRes.length = ", friendRes.length);

    for (let index = 0; index < friendRes.length; index++) {
      var user: any
      //console.log("friendRes-index: ", friendRes[index]);
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

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED')
  async getAllClientConnected(client: Socket) {
    const _client = arrClient.find(obj => obj.id == client.id);
    const user = await this.UserService.getAllUsers();
    const retArr = [];
    if (_client && user) {
      for (let i = 0; user.length > i; i++) {
        if (user[i].login != _client.username)
          retArr.push({ id: user[i].id, login: user[i].login, nickname: user[i].nickname, profile_pic: user[i].profile_pic });
      }
    }
    if (retArr.length <= 0)
      this.server.to(client.id).emit("getAllClientConnected", null);
    else
      this.server.to(client.id).emit("getAllClientConnected", retArr);
  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS')
  async getAllClientConnectedNotFriend(client: Socket) {
    //console.log('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS :');
    const _client = arrClient.find(obj => obj.id == client.id);
    if (_client) {
      const friendList = await this.FriendListService.getUserFriendListWithLogin(_client.username);
      const invitationList = await this.invitationRequestService.getAllUserInvitationByLogin(_client.username);
      const userList = await this.UserService.getAllUsers();
      if (friendList && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search1 = friendList.find(obj => obj.login_user1 == userList[index].login);
          const search2 = friendList.find(obj => obj.login_user2 == userList[index].login);
          const search3 = invitationList.find(obj => obj.sender_login == userList[index].login);
          const search4 = invitationList.find(obj => obj.receiver_login == userList[index].login);
          if (!search1 && !search2 && !search3 && !search4) {
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
            retArr.push(toPush);
          }
        }
        //console.log("send getAllClientConnectedWithoutFriend to ", _client.username);
        this.server.to(client.id).emit("getAllClientConnectedWithoutFriend", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS')
  async getAllClientConnectedNotParticipants(client: Socket, data: { room_id: number, room_name: string }) {
    //console.log('GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS :');
    const _room = arrRoom.find(obj => obj.id == data.room_id);
    if (_room) {
      const roomParticipants = await this.ParticipantsService.getAllRoomParticipants(data.room_id);
      const userList = await this.UserService.getAllUsers();
      if (roomParticipants && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search = roomParticipants.find(obj => obj.user_login == userList[index].login);
          if (!search) {
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
            retArr.push(toPush);
          }
        }
        //console.log("send getAllClientConnectedWithoutParticipants to ", client.id);
        this.server.to(client.id).emit("getAllClientConnectedWithoutParticipants", retArr);
      }
    }

    const _client = arrClient.find(obj => obj.id == client.id);
    if (_client) {
      const friendList = await this.FriendListService.getUserFriendListWithLogin(_client.username);
      const userList = await this.UserService.getAllUsers();
      if (friendList && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search1 = friendList.find(obj => obj.login_user1 == userList[index].login);
          const search2 = friendList.find(obj => obj.login_user2 == userList[index].login);
          if (!search1 && !search2) {
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
            retArr.push(toPush);
          }
        }
        //console.log("send getAllClientConnectedWithoutFriend to ", _client.username);
        this.server.to(client.id).emit("getAllClientConnectedWithoutFriend", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED_WITHOUT_BANNED')
  async getAllClientConnectedWithoutBanned(client: Socket, data: { id: number, login: string }) {
    const _client = arrClient.find(obj => obj.id == client.id);
    if (_client) {
      const blackList = await this.BlacklistService.getAllUserBan(data.id, data.login);
      const userList = await this.UserService.getAllUsers();
      if (blackList && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search1 = blackList.find(obj => obj.login_banned == userList[index].login);
          if (!search1 && userList[index].login != data.login) {
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
            retArr.push(toPush);
          }
        }
        //console.log("send getAllClientConnectedWithoutFriend to ", _client.username);
        this.server.to(client.id).emit("getAllClientConnectedWithoutBanned", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_PARTICIPANTS')
  async getAllParticipants(client: Socket, data: { room_id: number, room_name: string }) {
    //console.log('GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS :');
    const _room = arrRoom.find(obj => obj.id == data.room_id);
    if (_room) {
      const roomParticipants = await this.ParticipantsService.getAllRoomParticipants(data.room_id);
      const userList = await this.UserService.getAllUsers();
      if (roomParticipants && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search = roomParticipants.find(obj => obj.user_login == userList[index].login);
          if (search) {
            const tmpMute = await this.MutelistService.checkRoomMute(userList[index].id, userList[index].login, data.room_name);
            const tmpAdmin = await this.ParticipantsService.checkAdmin(userList[index].login, data.room_name);
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic, admin: tmpAdmin, mute: tmpMute };
            retArr.push(toPush);
          }
        }
        //console.log("send getAllClientConnectedWithoutParticipants to ", client.id);
        this.server.to(client.id).emit("getAllParticipantsReturn", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_PARTICIPANTS_BANNED')
  async getAllParticipantsBanned(client: Socket, data: { room_id: number, room_name: string }) {
    //console.log('GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS :');
    const _room = arrRoom.find(obj => obj.id == data.room_id);
    if (_room) {
      const roomBanned = await this.BlacklistService.getAllRoomBan(data.room_id, data.room_name);
      const userList = await this.UserService.getAllUsers();
      if (roomBanned && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search = roomBanned.find(obj => obj.login_banned == userList[index].login);
          if (search) {
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
            retArr.push(toPush);
          }
        }
        //console.log("send getAllClientConnectedWithoutParticipants to ", client.id);
        this.server.to(client.id).emit("getAllParticipantsBannedReturn", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_USERS_BANNED')
  async getAllUsersBanned(client: Socket, data: { id: number, login: string }) {
    //console.log('GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS :');
    const _client = arrClient.find(obj => obj.username == data.login);
    if (_client) {
      const userBanned = await this.BlacklistService.getAllUserBan(data.id, data.login);
      const userList = await this.UserService.getAllUsers();
      if (userBanned && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search = userBanned.find(obj => obj.login_banned == userList[index].login);
          if (search) {
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
            retArr.push(toPush);
          }
        }
        //console.log("send getAllClientConnectedWithoutParticipants to ", client.id);
        this.server.to(client.id).emit("getAllUsersBannedReturn", retArr);
      }
    }
  }

  @SubscribeMessage('GET_CLIENT_STATUS')
  async getClientStatus(client: Socket, info: { user: any }) {
    if (this.getRoomByClientLogin(info.user.login))
      this.server.to(client.id).emit('getClientStatus', { login: info.user.login, status: 'in-game' })
    else if (arrClient.find((item) => item.username == info.user.login))
      this.server.to(client.id).emit('getClientStatus', { user: info.user.login, status: 'online' })
    else
      this.server.to(client.id).emit('getClientStatus', { user: info.user.login, status: 'offline' })
  }

  @SubscribeMessage('AffNotistack')
  async AffNotistack(client: Socket, info: { text: string, type: string }) {
    this.server.to(client.id).emit('returnAffNotistack', { text: info.text, type: info.type })
  }

  @SubscribeMessage('CHECK_IF_IN_GAME')
  async CheckIfInGame(client: Socket, info: { login: string }) {
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
    this.logger.log(`${arrClient.find(obj => obj.id === client.id).username} request her friends list`);
    this.server.to(client.id).emit('friendsList', arrClient);
  }

  @SubscribeMessage('CHANGE_NICKNAME')
  async changeNickname(client: Socket, info: { user: any, newNickname: string }) {

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
        case 'Nickname same as login':
          this.server.to(client.id).emit('changeNicknameError', 'already-login')
          break;
      }
    }).then((res) => {
      if (res != undefined)
        this.server.to(client.id).emit('changeNicknameSuccess', res)
    })
  }


}
