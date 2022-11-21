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

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const tmp = arrClient.find(item => item.id == client.id)

    // if (tmp != undefined && tmp.username != "" && tmp.username != undefined) {
    //   checkReconnexionArr.push({ username: tmp.username, date: new Date() })
    // }

    const indexOfClient = arrClient.findIndex(obj => obj.id === client.id);
    if (indexOfClient !== -1)
      arrClient.splice(indexOfClient, 1);
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
    console.log("event");
    if ((tmp = checkReconnexionArr.findIndex(item => item.username == user.login)) >= 0)
      checkReconnexionArr.splice(tmp, 1)
    // else if (user.login) {
    //   this.FriendListService.getUserFriendListWithLogin(user.login).then((res) => {
    //     for (let i = 0; i < res.length; i++) {
    //       let loginTmp: string;
    //       if (res[i].login_user1 == user.login)
    //         loginTmp = res[i].login_user2;
    //       else
    //         loginTmp = res[i].login_user1;
    //       const _client = arrClient.find(obj => obj.username == loginTmp);
    //       if (_client) {
    //     console.log("emit");
    //         this.server.to(_client.id).emit('friendConnection', true);
    //       }
    //     }
    //   })
    //   arrClient.forEach((client) => {
    //     console.log("emit");
    //     this.server.to(client.id).emit('getClientStatus', { user: user.login, status: 'online' })
    //   })
    // }

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
        arrRoom.forEach((element) => {
          const _participantInRoom = element.users.find(obj => obj.username == user.login);
          if (_participantInRoom)
            _participantInRoom.id = client.id;
        });
        const _notif = arrNotifs.find(obj => obj.username == user.login);
        if (!_notif) {
          let newNotifClient: NotifClient = {
            username: user.login,
            notifs: []
          }
          arrNotifs.push(newNotifClient);
        }
        else {
          console.log("emit");

          this.server.to(client.id).emit('ChatNotifsInit', _notif.notifs);
        }

        let index: number
        while ((index = arrNotifInWait.findIndex(item => item.login == user.login)) != -1) {
          console.log("emit");
          this.server.to(item.id).emit('notif', arrNotifInWait[index].notif)
          arrNotifInWait.splice(index, 1);
        }

        //this.server.to(client.id).emit('friendsList', arrClient);
      }

    })

  };

  async afterInit(server: any) {
    this.logger.log('Init');
    this.RoomsService.getAllRooms().then((res) => {
      res.forEach(item => {
        let newRoom: Room = {
          id: item.id,
          name: item.name,
          users: []
        };
        arrRoom.push(newRoom);
        //i++;
      })
    });
    this.ParticipantsService.getAllParticipants().then((res) => {
      res.forEach(item => {
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
    })
  }



  @Interval(1000)
  checkBanAndMute() {
    time = time + 1;
    const getAllBan = this.BlacklistService.getAllBanTimer();
    getAllBan.then(async item => {
      const a: { login_banned: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, alwaysOrNot: boolean, date: number, timer: number }[] = item;
      a.forEach(async item => {
        if (item.timer + item.date <= time && !item.alwaysOrNot) {
          if (!item['userOrRoom']) {
            this.BlacklistService.removeUserBan(item['id_sender'], item['login_banned']).then((res) => {
              if (res) {
                const _client = arrClient.find(obj => obj.username == item.login_sender);
                if (_client)
                  console.log("emit");

                this.server.to(_client.id).emit('debanedUser', true);
              }
            })
          }
          else {
            this.BlacklistService.removeRoomBan(item['room_id'], item['login_banned']).then((res) => {
              if (res) {
                const _room = arrRoom.find(obj => obj.id == item.room_id);
                if (_room) {
                  let i = 0;
                  while (_room.users.length > i) {
                    console.log("emit");
                    let iencli = arrClient.find(obj => obj.username == _room.users[i].username);
                    if (_room.users[i].id != iencli.id)
                      _room.users[i].id = iencli.id;
                    this.server.to(_room.users[i].id).emit('debanedUserInRoom', true);
                    i++;
                  }
                }
              }
            })
          }
        }
      });
    });
    const getAllMute = this.MutelistService.getAllMuteTimer();
    getAllMute.then(async item => {
      const b: { login_muted: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, alwaysOrNot: boolean, date: number, timer: number }[] = item;
      b.forEach(async item => {
        if (item['timer'] + item['date'] <= time && !item.alwaysOrNot) {
          this.MutelistService.removeRoomMute(item['room_id'], item['login_muted']).then((res) => {
            if (res) {
              const _room = arrRoom.find(obj => obj.id == item.room_id);
              if (_room) {
                let i = 0;
                while (_room.users.length > i) {
                  let iencli = arrClient.find(obj => obj.username == _room.users[i].username);
                  if (_room.users[i].id != iencli.id)
                    _room.users[i].id = iencli.id;
                  this.server.to(_room.users[i].id).emit('demutedUserInRoom', true);
                  i++;
                }
              }
            }
          })
        }
      });
    });
  }

  @SubscribeMessage('deconnection')
  deconnection(client: Socket, info: { user: any }) {
    console.log('Event deconnection')
    const login = arrClient.find(obj => obj.id == client.id).username;
    if (login != null) {
      this.FriendListService.getUserFriendListWithLogin(login).then((res) => {
        for (let i = 0; i < res.length; i++) {
          let loginTmp: string;
          if (res[i].login_user1 == login)
            loginTmp = res[i].login_user2;
          else
            loginTmp = res[i].login_user1;
          const _client = arrClient.find(obj => obj.username == loginTmp);
          if (_client) {
            //this.getAllFriendConnected(client, info);
            console.log("emit friendDeconnection to ", _client.username);
            this.server.to(_client.id).emit('friendDeconnection', true);
          }
        }
        const indexOfClient = arrClient.findIndex(obj => obj.id === client.id);
        if (indexOfClient !== -1)
          arrClient.splice(indexOfClient, 1);
      })
    }
  }

  @SubscribeMessage('msgConnection')
  handleMessage(client: Socket, message: string) {
    console.log('Event msgConnection')
    const _client_temp = arrClient.find(obj => obj.id === client.id);
    const newmessage = `Hey! You have the id: ${client.id}, ${_client_temp.id} and your username is: ${_client_temp.username}. Welcome to our server!`;
    this.server.to(client.id).emit('msgToClient', newmessage);
    this.server.to(client.id).emit('ID', client.id);
    console.log("emit");
    console.log("emit");

  }

  //INVITATION REQUESTS EVENTS

  @SubscribeMessage('createInvitationRequest')
  async createInvitationRequest(client: Socket, data: any) {
    console.log('Event createInvitationRequest')
    this.logger.log(`${client.id} said: create Invitation Request`);
    const checkIfInvit = await this.invitationRequestService.checkInvitationRequest(data.id_user1, data.id_user2);
    console.log("check invitaiton request: ", checkIfInvit);
    if (!checkIfInvit) {
      let verifBan = false;
      if (!data.userOrRoom) {
        const checkIfBanned = await this.BlacklistService.checkUserBan(data.sender_login, data.receiver_login);
        verifBan = checkIfBanned;
      }
      else {
        const checkIfBanned = await this.BlacklistService.checkRoomBan(data.sender_id, data.sender_login, data.room_name);
        verifBan = checkIfBanned;
      }
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
        if (arrClient)
          arrClient.forEach((item) => {
            if (item.username == invitationRequest.receiver_login)
              this.server.to(item.id).emit('notif', { type: 'PENDINGINVITATION' })
          })

        //const invitationRequestReturn = await this.http.post('https://10.4.5.1:5001/invitationRequest', invitationRequest);
        const invitationRequestReturn = await this.invitationRequestService.createInvitationRequest(invitationRequest)
        const _client_receiver = arrClient.find(obj => obj.username === data.receiver_login);
        if (_client_receiver != null) {
          console.log("emit");
          console.log("emit");

          this.server.to(_client_receiver.id).emit('newInvitationReceived', data);
          this.server.to(_client_receiver.id).emit('refreshUser', true);
        }
        if (invitationRequestReturn)
          console.log("emit");

        this.server.to(client.id).emit('refreshUser', true);
      }
    }
  };

  @SubscribeMessage('removeInvitationRequest')
  async removeInvitationRequest(client: Socket, data: any) {
    console.log('Event removeInvitationRequest')
    const checkIfInvit = await this.invitationRequestService.checkInvitationRequest(data.id_user1, data.id_user2);
    if (checkIfInvit) {
      this.logger.log(`${client.id} said : remove Invitation Request`);
      //const invitationRequestReturn = await this.http.post('https://10.4.5.1:5001/invitationRequest/' + data.id_user1 + '/' + data.id_user2);
      const invitationRequestReturn = await this.invitationRequestService.removeInvitationRequest(data.id_user1, data.id_user2)
      console.log("emit");

      this.server.to(client.id).emit('returnRemoveInvitationRequest', true);
    }
  }

  //FRIENDLIST EVENTS

  @SubscribeMessage('addFriend')
  async addFriend(client: Socket, data: any) {
    console.log('Event addFriend')
    const checkIfRelationExist = await this.FriendListService.checkExistRelation(data.id_user1, data.id_user2);
    if (!checkIfRelationExist) {
      this.logger.log(`${client.id} add Friend`);
      const newFriend = {
        id_user1: data.id_user1,
        id_user2: data.id_user2,
        login_user1: data.login_user1,
        login_user2: data.login_user2
      }
      //const addFriendReturn = await this.http.post('https://10.4.5.1:5001/friendList/', newFriend);
      const addFriendReturn = await this.FriendListService.createFriendShip(newFriend);
      const _client1 = arrClient.find(obj => obj.username === data.login_user1);
      const _client2 = arrClient.find(obj => obj.username === data.login_user2);
      if (_client1) {
        console.log("emit");

        this.server.to(_client1.id).emit('refreshUser', data);
      }
      if (_client2) {
        console.log("emit");

        this.server.to(_client1.id).emit('refreshUser', data);
      }
      if (addFriendReturn) {
        const _client11 = arrClient.find(obj => obj.username === data.login_user1);
        const _client22 = arrClient.find(obj => obj.username === data.login_user2);
        if (_client11) {
          console.log("emit");

          this.server.to(_client11.id).emit('newFriendReceived', data);
        }
        if (_client22) {
          console.log("emit");

          this.server.to(_client22.id).emit('newFriendReceived', data);
        }
      }
    }
  }

  @SubscribeMessage('removeFriend')
  async removeFriend(client: Socket, data: any) {
    console.log('Event removeFriend')
    this.logger.log(`${client.id} remove Friend`);
    //const removeFriendReturn = await this.http.post('https://10.4.5.1:5001/friendList/' + data.id_user1 + '/' + data.id_user2);
    const _check = await this.FriendListService.checkExistRelation(data.id_user1, data.id_user2);
    if (_check) {
      const removeFriendReturn = await this.FriendListService.removeFriendShip(data.id_user1, data.id_user2);
      const _notif = arrNotifs.find(obj => obj.username == data.login_user1);
      if (_notif) {
        const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.login_user2);
        if (_notifToReset)
          _notif.notifs.splice(_notifToReset, 1);
      }
      const _notif2 = arrNotifs.find(obj => obj.username == data.login_user2);
      if (_notif2) {
        const _notifToReset2 = _notif2.notifs.findIndex(obj => obj.name == data.login_user1);
        if (_notifToReset2)
          _notif2.notifs.splice(_notifToReset2, 1);
      }
      const _client1 = arrClient.find(obj => obj.username === data.login_user1);
      const _client2 = arrClient.find(obj => obj.username === data.login_user2);
      if (_client1) {
        console.log("emit");

        this.server.to(_client1.id).emit('refreshUser', data);
      }
      if (_client2) {
        console.log("emit");

        this.server.to(_client1.id).emit('refreshUser', data);
      }
      if (removeFriendReturn) {
        const _client1 = arrClient.find(obj => obj.username == data.login_user1);
        if (_client1) {
          console.log("emit");
          this.server.to(_client1.id).emit('returnRemoveFriend', true);

        }
        const _client2 = arrClient.find(obj => obj.username == data.login_user2);
        if (_client2) {
          console.log("emit");

          this.server.to(_client2.id).emit('returnRemoveFriend', true);

        }
      }
    }
  }

  //ROOMS EVENTS

  @SubscribeMessage('createChatRooms')
  async createChatRooms(client: Socket, data: any) {
    console.log('Event createChatRooms')
    this.logger.log(`${client.id} create Rooms`);
    const search = arrRoom.find(obj => obj.name == data.name);
    console.log("check search: ", search);
    if (search) {
      return;
    }
    console.log("data.room_name: ", data.name);
    const checkIfRoom = await this.RoomsService.checkRoom(data.name);
    console.log("check checkIfRoom: ", checkIfRoom);
    if (checkIfRoom)
      return;
    let password = data.password;
    if (password.lenght <= 0 || !password)
      password = "NoPassword";
    const newRooms = {
      name: data.name,
      description: data.description,
      password: password,
      identifiant: data.identifiant,
      owner_id: data.owner_id,
      publicOrPrivate: data.publicOrPrivate,
      passwordOrNot: data.passwordOrNot
    }
    //const roomReturn = await this.http.post('https://10.4.5.1:5001/rooms', newRooms);
    const roomReturn = await this.RoomsService.createRoom(newRooms);
    const newParticipant = {
      user_id: data.owner_id,
      user_login: data.owner_login,
      room_id: roomReturn.id,
      room_name: data.name,
      admin: true
    }
    const tmp_room_id = roomReturn.id;
    //const participantReturn = await this.http.post('https://10.4.5.1:5001/participants', newParticipant);
    const participantReturn = await this.ParticipantsService.createParticipant(newParticipant);
    const _client = arrClient.find(obj => obj.id === client.id);
    const newRoom = {
      id: tmp_room_id,
      name: data.name,
      users: []
    }
    if (_client != null)
      newRoom.users.push(_client);
    arrRoom.push(newRoom);
    console.log("newRoom: ", newRoom.users);
    for (let i = 0; i < arrClient.length; i++) {
      console.log("emit");

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
    const room = arrRoom.find(obj => obj.name == data.name);
    let i = 0;
    while (i < room.users.length) {
      console.log("emit");
      let iencli = arrClient.find(obj => obj.username == room.users[i].username);
      if (room.users[i].id != iencli.id)
        room.users[i].id = iencli.id;
      this.server.to(room.users[i].id).emit('newMsgReceived', true);
      i++;
    }
  };

  @SubscribeMessage('removeRoom')
  async removeRoom(client: Socket, data: any) {
    console.log('Event removeRoom')
    const checkIfRoom = await this.RoomsService.checkRoom(data.room_name);
    if (checkIfRoom) {
      this.logger.log(`${client.id} remove Room`);
      //const removeRoomReturn = await this.http.post('https://10.4.5.1:5001/rooms/' + data.id + '/' + data.room_name);
      const removeRoomReturn = await this.RoomsService.removeRoom(data.id, data.room_name);
      if (removeRoomReturn) {
        const _room = arrRoom.find(obj => obj.name == data.room_name);
        if (_room != null) {
          let i = 0;
          while (i < _room.users.length) {
            //const removeParticipantReturn = await this.http.post('https://10.4.5.1:5001/participants/' + _room.users[i].username + '/' + _room.name);
            const removeParticipantReturn = await this.ParticipantsService.removeParticipant(_room.users[i].username, _room.name);
            const _notif = arrNotifs.find(obj => obj.username == _room.users[i].username);
            if (_notif) {
              const _notifToReset = _notif.notifs.findIndex(obj => obj.name == _room.name);
              if (_notifToReset)
                _notif.notifs.splice(_notifToReset, 1);
            }
            i++;
          }
          //const toRemoveMsg = {
          //  room_id: _room.id,
          //  room_name: _room.name
          //}
          //const removeAllRoomMessagesReturn = await this.http.post('https://10.4.5.1:5001/messages/removeAllRoomMessages/', toRemoveMsg);
          const removeAllRoomMessagesReturn = await this.MessagesService.removeAllRoomMessages(_room.id, _room.name);
          i = 0;
          while (i < arrClient.length) {
            console.log("emit");

            this.server.to(arrClient[i].id).emit('roomHasBeenDeleted', _room.name);
            i++;
          }
          const index = arrRoom.indexOf(_room);
          arrRoom.splice(index, 1);
        }

      };
    }
  }

  @SubscribeMessage('joinChatRoom')
  async joinChatRoom(client: Socket, data: any) {
    console.log('Event joinChatRoom')
    this.logger.log(`${client.id} want to join `, data.room_name);
    let tmpPassword: string = data.password;
    if (tmpPassword.length <= 0)
      tmpPassword = "noPassword";
    //const tmp = 'https://10.4.5.1:5001/rooms/' + data.user_id + '/' + data.user_login + '/' + data.room_id + '/' + data.room_name + '/' + tmpPassword + '/';
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
      //const participantReturn = await this.http.post('https://10.4.5.1:5001/participants', newParticipant);
      const participantReturn = await this.ParticipantsService.createParticipant(newParticipant);
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
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      while (i < room.users.length) {
        console.log("emit");
        let iencli = arrClient.find(obj => obj.username == room.users[i].username);
        if (room.users[i].id != iencli.id)
          room.users[i].id = iencli.id;
        this.server.to(room.users[i].id).emit('newMsgReceived', true);
        i++;
      }
      const _client = arrClient.find(obj => obj.username === data.user_login);
      if (_client != null) {
        console.log("emit");
        this.server.to(_client.id).emit('joinChatRoomAccepted', true);
        const a = arrRoom.find(obj => obj.name == data.room_name);
        if (a) {
          a.users.push(_client);
          let i = 0;
          while (i < a.users.length) {
            let iencli = arrClient.find(obj => obj.username == a.users[i].username);
            if (a.users[i].id != iencli.id)
              a.users[i].id = iencli.id;
            console.log("emit newParticipant to ", a.users[i].username, ", id: ", a.users[i].id);
            this.server.to(a.users[i].id).emit('newParticipant', true);
            i++;
          }
        }
      }
    }
    else {
      console.log("emit");

      this.server.to(client.id).emit('cantJoinChatRoom', checkIfCanJoinReturn);
    }
  }


  @SubscribeMessage('changePassword')
  async changePassword(client: Socket, data: any) {
    console.log('Event changePassword')
    this.logger.log(`${client.id} want to change password to `, data.room_name);
    if (data.passwordOrNot && data.password.lenght <= 0) {
      return;
    }
    let verif = false;
    //const checkIfAdmin = await http.get('https://10.4.5.1:5001/participants/checkAdmin/' + data.login + '/' + data.room_name);
    const checkIfAdmin = await this.ParticipantsService.checkAdmin(data.login, data.room_name);
    if (checkIfAdmin == true) {
      /*const newMdp = {
        room_name: data.room_name,
        passwordOrNot: data.passwordOrNot,
        password: data.password
      }*/
      //const changeMdpReturn = await http.post('https://10.4.5.1:5001/rooms/changePassword/', newMdp);
      const changeMdpReturn = await this.RoomsService.changePassword(data.room_name, data.passwordOrNot, data.password);
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
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      while (i < room.users.length) {
        console.log("emit");
        let iencli = arrClient.find(obj => obj.username == room.users[i].username);
        if (room.users[i].id != iencli.id)
          room.users[i].id = iencli.id;
        this.server.to(room.users[i].id).emit('newMsgReceived', true);
        i++;
      }
    }
  }

  //PARTICIPANTS EVENTS

  @SubscribeMessage('createParticipant')
  async createParticipant(client: Socket, data: any) {
    console.log('Event createParticipant')
    const checkIfRoom = await this.RoomsService.checkRoom(data.room_name);
    if (!checkIfRoom)
      return;
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
    //const participantReturn = await this.http.post('https://10.4.5.1:5001/participants', newParticipant);
    const participantReturn = await this.ParticipantsService.createParticipant(newParticipant);
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
    const room = arrRoom.find(obj => obj.name == data.room_name);
    let i = 0;
    while (i < room.users.length) {
      console.log("emit");
      let iencli = arrClient.find(obj => obj.username == room.users[i].username);
      if (room.users[i].id != iencli.id)
        room.users[i].id = iencli.id;
      this.server.to(room.users[i].id).emit('newMsgReceived', true);
      i++;
    }
    const _client = arrClient.find(obj => obj.username === data.user_login);
    if (_client != null) {
      const a = arrRoom.find(obj => obj.name == data.room_name);
      a.users.push(_client);
      let i = 0;
      while (i < a.users.length) {
        console.log("emit");
        let iencli = arrClient.find(obj => obj.username == a.users[i].username);
        if (a.users[i].id != iencli.id)
          a.users[i].id = iencli.id;
        this.server.to(a.users[i].id).emit('newParticipant', true);
        i++;
      }
    }
  }

  @SubscribeMessage('removeParticipant')
  async removeParticipant(client: Socket, data: any) {
    console.log('Event removeParticipant')
    this.logger.log(`${client.id} want remove Participant`);
    const _client_sender = arrClient.find(obj => obj.id == client.id);
    if (_client_sender) {
      const verifIfParticipant = await this.ParticipantsService.checkParticipant(data.login, data.room_name);
      if (verifIfParticipant) {
        if (_client_sender.username != data.login) {
          const verifIfAdmin = await this.ParticipantsService.checkAdmin(_client_sender.username, data.room_name);
          if (!verifIfAdmin) {
            return;
          }
        }
        const verifIfReceiverIsAdmin = await this.ParticipantsService.checkAdmin(data.login, data.room_name);
        if (verifIfReceiverIsAdmin) {
          const verifIfOwner = await this.RoomsService.checkIfOwner(data.id_sender, data.room_name);
          if (!verifIfOwner)
            return;
        }
        const removeParticipantReturn = await this.ParticipantsService.removeParticipant(data.login, data.room_name);
        const _notif = arrNotifs.find(obj => obj.username == data.login);
        if (_notif) {
          const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.room_name);
          if (_notifToReset)
            _notif.notifs.splice(_notifToReset, 1);
        }
        if (removeParticipantReturn) {
          console.log("emit");

          this.server.to(client.id).emit('removeParticipantReturn', true);
          const _client = arrClient.find(obj => obj.username == data.login);
          if (_client != undefined) {
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
            const room2 = arrRoom.find(obj => obj.name == data.room_name);
            let i2 = 0;
            while (i2 < room2.users.length) {
              console.log("emit");
              let iencli = arrClient.find(obj => obj.username == room2.users[i2].username);
              if (room2.users[i2].id != iencli.id)
                room2.users[i2].id = iencli.id;
              this.server.to(room2.users[i2].id).emit('newMsgReceived', true);
              i2++;
            }
            console.log("emit");

            this.server.to(_client.id).emit('kickedOutOfTheGroup', true);
            console.log("emit");

            if (_client_sender.username != data.login)
              this.server.to(_client.id).emit('notif', { type: 'YOUWEREKICKEDOUTTHEGROUP', data: { room_name: data.room_name, login_sender: _client_sender.username } })
            const index = arrRoom.find(obj => obj.name == data.room_name).users.indexOf(_client);
            arrRoom.find(obj => obj.name == data.room_name).users.splice(index, 1);
            const room = arrRoom.find(obj => obj.name == data.room_name);
            let i = 0;
            while (i < room.users.length) {
              console.log("emit removeParticipantReturn to ", room.users[i].username, ",id : ", room.users[i].id);
              let iencli = arrClient.find(obj => obj.username == room.users[i].username);
              if (room.users[i].id != iencli.id)
                room.users[i].id = iencli.id;
              this.server.to(room.users[i].id).emit('removeParticipantReturn', true);
              i++;
            }
          }
          else
            arrNotifInWait.push({ login: data.login, notif: { type: 'YOUWEREKICKEDOUTTHEGROUP', data: { room_name: data.room_name, login_sender: _client_sender.username } } })
        }
      }
    }
  }

  @SubscribeMessage('createAdmin')
  async createAdmin(client: Socket, data: any) {
    console.log('Event createAdmin')
    let verif = false;
    const checkIfRoom = await this.RoomsService.checkRoom(data.room_name);
    if (!checkIfRoom)
      return ;
    //const checkIfOwner = await this.http.get('https://10.4.5.1:5001/rooms/checkIfOwner/' + data.id_sender + '/' + data.login_sender);
    const checkIfOwner = await this.RoomsService.checkIfOwner(data.id_sender, data.login_sender);
    if (checkIfOwner == true)
      verif = true;
    // const checkIfAdmin = await this.http.get('https://10.4.5.1:5001/participants/checkAdmin/' + data.login_sender + '/' + data.room_name);
    const checkIfAdmin = await this.ParticipantsService.checkAdmin(data.login_sender, data.room_name);
    if (checkIfAdmin == true)
      verif = true;
    //const checkParticipant = await this.http.get('https://10.4.5.1:5001/participants/checkIfAdminOrParticipant/' + data.login_admin + '/' + data.room_name);
    const checkParticipant = await this.ParticipantsService.checkIfAdminOrParticipant(data.login_admin, data.room_name);
    if (checkParticipant == true && verif == true) {
      this.logger.log(`${client.id} create Admin: `, data.login_admin);
      const newParticipant = {
        user_id: data.id_admin,
        user_login: data.login_admin,
        room_id: data.room_id,
        room_name: data.room_name,
        admin: true
      };
      //const participantReturn = await this.http.post('https://10.4.5.1:5001/participants/admin', newParticipant);
      const participantReturn = await this.ParticipantsService.createAdmin(newParticipant);
      if (participantReturn) {
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
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i2 = 0;
        while (i2 < room.users.length) {
          console.log("emit");
          let iencli = arrClient.find(obj => obj.username == room.users[i2].username);
          if (room.users[i2].id != iencli.id)
            room.users[i2].id = iencli.id;
          this.server.to(room.users[i2].id).emit('newMsgReceived', true);
          i2++;
        }
        const a = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        while (i < a.users.length) {
          console.log("emit");
          let iencli = arrClient.find(obj => obj.username == a.users[i].username);
          if (a.users[i].id != iencli.id)
            a.users[i].id = iencli.id;
          this.server.to(a.users[i].id).emit('refreshParticipants', true);
          i++;
        }
      }
    }
  }

  @SubscribeMessage('removeAdmin')
  async removeAdmin(client: Socket, data: any) {
    console.log('Event removeAdmin')
    let verif = false;
    const checkIfOwner = await this.RoomsService.checkIfOwner(data.id_sender, data.login_sender);
    if (checkIfOwner == true)
      verif = true;
    const checkIfAdmin = await this.ParticipantsService.checkAdmin(data.login_sender, data.room_name);
    if (checkIfAdmin == true)
      verif = true;
    let checkParticipant = await this.ParticipantsService.checkAdmin(data.login_admin, data.room_name);
    const checkIfParticipantIsOwner = await this.RoomsService.checkIfOwner(data.id_admin, data.room_name);
    if (checkIfParticipantIsOwner == true)
      checkParticipant = false;
    if (checkParticipant == true && verif == true) {
      this.logger.log(`${client.id} remove Admin: `, data.login_admin);
      const newParticipant = {
        user_id: data.id_admin,
        user_login: data.login_admin,
        room_id: data.room_id,
        room_name: data.room_name,
        admin: true
      };
      //const participantReturn = await this.http.post('https://10.4.5.1:5001/participants/admin', newParticipant);
      const participantReturn = await this.ParticipantsService.removeAdmin(newParticipant);
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
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i2 = 0;
      while (i2 < room.users.length) {
        console.log("emit");
        let iencli = arrClient.find(obj => obj.username == room.users[i2].username);
        if (room.users[i2].id != iencli.id)
          room.users[i2].id = iencli.id;
        this.server.to(room.users[i2].id).emit('newMsgReceived', true);
        i2++;
      }
      const a = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      while (i < a.users.length) {
        console.log("emit");
        let iencli = arrClient.find(obj => obj.username == a.users[i].username);
        if (a.users[i].id != iencli.id)
          a.users[i].id = iencli.id;
        this.server.to(a.users[i].id).emit('refreshParticipants', true);
        i++;
      }
    }
  }

  //NEW CHAT EVENTS

  NewMsgNotif = (receiver_name: string, sender_name: string, userOrRoom: boolean) => {
    let _notifClient = arrNotifs.find(obj => obj.username == receiver_name);
    if (_notifClient) {
      let _notif;
      if (!userOrRoom) {
        _notif = _notifClient.notifs.find(obj => (obj.name == sender_name && !obj.userOrRoom));
      }
      else {
        _notif = _notifClient.notifs.find(obj => (obj.name == sender_name && obj.userOrRoom));
      }
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
        console.log("emit");

        this.server.to(_client.id).emit('newChatNotif', { name: sender_name, userOrRoom: userOrRoom });
      }
    }
    else {
      return;
    }
  };

  @SubscribeMessage('delChatNotifs')
  delChatNotifs(client: Socket, data: any) {
    console.log('Event delChatNotifs')
    const _notif = arrNotifs.find(obj => obj.username == data.loginOwner);
    if (_notif) {
      const _notifToReset = _notif.notifs.find(obj => (obj.name == data.name && obj.userOrRoom == data.userOrRoom));
      if (_notifToReset) {
        _notifToReset.nb = 0;
      }
    }
  }

  @SubscribeMessage('createMsg')
  createMsg(client: Socket, data: any) {
    console.log('Event createMsg')
    this.logger.log(`${client.id} create newMsg: ${data.text}`);
    if (!data.userOrRoom) {
      this.BlacklistService.checkUserBan(data.login_sender, data.login_receiver).then((res) => {
        if (!res) {
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
          this.MessagesService.createMessages(newMsg).then((res) => {
            const _client_receiver = arrClient.find(obj => obj.username === data.login_receiver);
            if (_client_receiver != null) {
              console.log("emit");

              this.server.to(_client_receiver.id).emit('newMsgReceived', data);
            }
            this.NewMsgNotif(data.login_receiver, data.login_sender, false);
          })
        }
      })
    }
    else {
      this.BlacklistService.checkRoomBan(data.id_sender, data.login_sender, data.room_name).then((res) => {
        if (!res) {
          this.MutelistService.checkRoomMute(data.id_sender, data.login_sender, data.room_name).then((res) => {
            if (!res) {
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
              this.MessagesService.createMessages(newMsg).then((res) => {
                const room = arrRoom.find(obj => obj.name == data.room_name);
                console.log("room: ", room);
                console.log("room.users: ", room.users.length);
                let i = 0;
                while (i < room.users.length) {
                  let iencli = arrClient.find(obj => obj.username == room.users[i].username);
                  if (room.users[i].id != iencli.id)
                    room.users[i].id = iencli.id;
                  console.log("emit to ", room.users[i].username, ", id: ", room.users[i].id);
                  this.server.to(room.users[i].id).emit('newMsgReceived', data);
                  this.NewMsgNotif(room.users[i].username, data.room_name, true);
                  i++;
                }
              })
            }
            else {
              console.log("emit");
              this.server.to(client.id).emit('mutedUserInRoom', true);

            }
          })
        }
        else {
          console.log("emit");
          this.server.to(client.id).emit('kickedOutOfTheGroup', true);

        }
      })
    }
  }

  //BLACK LIST EVENTS

  @SubscribeMessage('createBan')
  async createBan(client: Socket, data: any) {
    console.log('Event createBan')
    const checkIfBan = await this.BlacklistService.checkUserBan(data.login_banned, data.login_sender);
    if (checkIfBan)
      return ;
    this.logger.log(`${client.id} create newBan: ${data.login_banned}`);
    //const checkFriendship = await this.http.get('https://10.4.5.1:5001/friendList/' + data.id_banned + '/' + data.id_sender);
    const checkFriendship = await this.FriendListService.checkExistRelation(data.id_banned, data.id_sender);
    if (checkFriendship == true) {
      this.logger.log(`${client.id} remove Friend`);
      //const removeFriendReturn = await this.http.post('https://10.4.5.1:5001/friendList/' + data.id_banned + '/' + data.id_sender);
      const removeFriendReturn = await this.FriendListService.removeFriendShip(data.id_banned, data.id_sender);
      const _notif = arrNotifs.find(obj => obj.username == data.login_banned);
      if (_notif) {
        const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.login_sender);
        if (_notifToReset)
          _notif.notifs.splice(_notifToReset, 1);
      }
      const _notif2 = arrNotifs.find(obj => obj.username == data.login_sender);
      if (_notif2) {
        const _notifToReset2 = _notif2.notifs.findIndex(obj => obj.name == data.login_banned);
        if (_notifToReset2)
          _notif2.notifs.splice(_notifToReset2, 1);
      }
      this.server.to(client.id).emit('returnRemoveFriend', true);
      console.log("emit");

      const _client_receiver = arrClient.find(obj => obj.username === data.login_banned);
      if (_client_receiver != null) {
        this.server.to(_client_receiver.id).emit('returnRemoveFriend', true);
        console.log("emit");

      }
    }
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
      this.server.to(client.id).emit('userBanned', true);
      console.log("emit");

      const _client = arrClient.find(obj => obj.username == data.login_banned);
      if (_client) {
        this.server.to(_client.id).emit('userBanned', true);
        console.log("emit");

      }
    }
  }

  @SubscribeMessage('removeUserBan')
  async removeUserBan(client: Socket, data: any) {
    console.log('Event removeUserBan')
    const verifIfBanExist = await this.BlacklistService.checkUserBan(data.login_banned, data.login_sender);
    if (verifIfBanExist) {
      this.logger.log(`${client.id} want deban: ${data.login_banned}`);
      const removeBanReturn = await this.BlacklistService.removeUserBan(data.id_sender, data.login_banned);
      if (removeBanReturn) {
        const tmp = arrClient.find(obj => obj.id == client.id);
        this.server.to(client.id).emit('debanedUser', true);
        console.log("emit");

        const _client = arrClient.find(obj => obj.username == data.login_banned);
        if (_client) {
          this.server.to(_client.id).emit('debanedUser', true);
          console.log("emit");

        }
      }
    }
  }

  @SubscribeMessage('createRoomBan')
  async createRoomBan(client: Socket, data: any) {
    console.log('Event createRoomBan')
    const checkIfBan = await this.BlacklistService.checkRoomBan(data.id_banned, data.login_banned, data.room_name);
    if (checkIfBan)
      return ;
    this.logger.log(`${client.id} create newRoomBan: ${data.login_banned} in ${data.room_name}`);
    const checkParticipant = await this.ParticipantsService.checkIfAdminOrParticipant(data.login_banned, data.room_name);
    if (checkParticipant) {
      this.logger.log(`${client.id} remove Participant`);
      //const removeParticipantReturn = await this.http.post('https://10.4.5.1:5001/participants/' + data.login_banned + '/' + data.room_name);
      const removeParticipantReturn = await this.ParticipantsService.removeParticipant(data.login_banned, data.room_name);
      const _notif = arrNotifs.find(obj => obj.username == data.login_banned);
      if (_notif) {
        const _notifToReset = _notif.notifs.findIndex(obj => obj.name == data.room_name);
        if (_notifToReset)
          _notif.notifs.splice(_notifToReset, 1);
      }
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
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      while (i < room.users.length) {
        let iencli = arrClient.find(obj => obj.username == room.users[i].username);
        if (room.users[i].id != iencli.id)
          room.users[i].id = iencli.id;
        this.server.to(room.users[i].id).emit('newMsgReceived', true);
        console.log("emit");
        i++;
      }
      this.server.to(client.id).emit('removeParticipantReturn', true);
      console.log("emit");

      const _client = arrClient.find(obj => obj.username == data.login_banned);
      if (_client != undefined) {
        console.log("emit");
        console.log("emit");

        this.server.to(_client.id).emit('kickedOutOfTheGroup', true);
        this.server.to(_client.id).emit('notif', { type: 'YOUWEREBANFROMTHEGROUP', data: { room_name: data.room_name, login_sender: data.login_sender } })
        const index = arrRoom.find(obj => obj.name == data.room_name).users.indexOf(_client);
        arrRoom.find(obj => obj.name == data.room_name).users.splice(index, 1);
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        while (i < room.users.length) {
          let iencli = arrClient.find(obj => obj.username == room.users[i].username);
          if (room.users[i].id != iencli.id)
            room.users[i].id = iencli.id;
          this.server.to(room.users[i].id).emit('removeParticipantReturn', true);
          console.log("emit");

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
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        while (i < room.users.length) {
          let iencli = arrClient.find(obj => obj.username == room.users[i].username);
          if (room.users[i].id != iencli.id)
            room.users[i].id = iencli.id;
          this.server.to(room.users[i].id).emit('newRoomBan', true);
          console.log("emit");
          i++;
        }
      }
    }
  };

  @SubscribeMessage('removeRoomBan')
  async removeRoomBan(client: Socket, data: any) {
    console.log('Event removeRoomBan')
    const verifIfBanExist = await this.BlacklistService.checkRoomBan(data.id_banned, data.login_banned, data.room_name);
    if (verifIfBanExist) {
      this.logger.log(`${client.id} want deban: ${data.login_banned} in room_id: ${data.room_id}`);
      const removeBanReturn = await this.BlacklistService.removeRoomBan(data.room_id, data.login_banned);
      if (removeBanReturn) {
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        while (i < room.users.length) {
          let iencli = arrClient.find(obj => obj.username == room.users[i].username);
          if (room.users[i].id != iencli.id)
            room.users[i].id = iencli.id;
          this.server.to(room.users[i].id).emit('debanedUserInRoom', true);
          console.log("emit");
          i++;
        }
      }
    }
  }

  //MUTELIST EVENTS

  @SubscribeMessage('createRoomMute')
  async createRoomMute(client: Socket, data: any) {
    console.log('Event createRoomMute')
    const checkIfMute = await this.MutelistService.checkRoomMute(data.id_muted, data.login_muted, data.room_name);
    if (checkIfMute)
      return ;
    //const checkParticipant = await http.get('https://10.4.5.1:5001/participants/check/' + data.login_muted + '/' + data.room_name);
    const checkParticipant = await this.ParticipantsService.checkParticipant(data.login_muted, data.room_name);
    if (checkParticipant == true) {
      this.logger.log(`${client.id} create newRoomMute: ${data.login_muted} in ${data.room_name}`);
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
        const room2 = arrRoom.find(obj => obj.name == data.room_name);
        let i2 = 0;
        while (i2 < room2.users.length) {
          let iencli = arrClient.find(obj => obj.username == room2.users[i2].username);
          if (room2.users[i2].id != iencli.id)
            room2.users[i2].id = iencli.id;
          this.server.to(room2.users[i2].id).emit('newMsgReceived', true);
          console.log("emit");
          i2++;
        }
        const room = arrRoom.find(obj => obj.name == data.room_name);
        let i = 0;
        while (i < room.users.length) {
          let iencli = arrClient.find(obj => obj.username == room.users[i].username);
          if (room.users[i].id != iencli.id)
            room.users[i].id = iencli.id;
          this.server.to(room.users[i].id).emit('mutedUserInRoom', true);
          console.log("emit");

          i++;
        }
      }
    }
  }

  @SubscribeMessage('removeRoomMute')
  async removeRoomMute(client: Socket, data: any) {
    console.log('Event removeRoomMute')
    const checkIfMute = await this.MutelistService.checkRoomMute(data.id_muted, data.login_muted, data.room_name);
    if (!checkIfMute)
      return ;
    this.logger.log(`${client.id} want demute: ${data.login_muted} in : ${data.room_name}`);
    const removeMuteReturn = await this.MutelistService.removeRoomMute(data.room_id, data.login_muted);
    if (removeMuteReturn) {
      const room = arrRoom.find(obj => obj.name == data.room_name);
      let i = 0;
      while (i < room.users.length) {
        let iencli = arrClient.find(obj => obj.username == room.users[i].username);
        if (room.users[i].id != iencli.id)
          room.users[i].id = iencli.id;
        this.server.to(room.users[i].id).emit('demutedUserInRoom', true);
        console.log("emit");
        i++;
      }
    }
  }

  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  /*                      POUR PONG                        */
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////


  @SubscribeMessage('CHECK_IF_FRIEND_OR_INVIT')
  async checkIfFriendOrInvit(client: Socket, data: { id1: number, id2: number }) {
    console.log('Event CHECK_IF_FRIEND_OR_INVIT')
    const checkFriend = await this.FriendListService.checkExistRelation(data.id1, data.id2);
    const checkInvit = await this.invitationRequestService.checkInvitationRequest(data.id1, data.id2);
    const checkBan = await this.BlacklistService.checkUserBanWithId(data.id1, data.id2);
    console.log("emit");

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

  @SubscribeMessage('GET_ALL_ROOMS_CAN_I_JOIN')
  async getAllRoomsCanIJoin(client: Socket) {
    console.log('Event GET_ALL_ROOMS_CAN_I_JOIN')
    const _client = arrClient.find(obj => obj.id == client.id);
    if (_client) {
      const _user = await this.UserService.getUserByLogin(_client.username);
      if (_user) {
        const _rooms = await this.RoomsService.getAllRooms();
        const retArr: { id: number, name: string, publicOrPrivate: boolean, passwordOrNot: boolean }[] = [];
        for (let i = 0; _rooms.length > i; i++) {
          const _participant = await this.ParticipantsService.checkParticipant(_user.login, _rooms[i].name);
          const _ban = await this.BlacklistService.checkRoomBan(_user.id, _user.login, _rooms[i].name);
          if (!_participant && !_ban)
            retArr.push({ id: _rooms[i].id, name: _rooms[i].name, publicOrPrivate: _rooms[i].publicOrPrivate, passwordOrNot: _rooms[i].passwordOrNot });
        }
        console.log("emit");

        if (retArr.length <= 0)
          this.server.to(client.id).emit("getAllRoomsCanIJoin", null);
        else
          this.server.to(client.id).emit("getAllRoomsCanIJoin", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED')
  async getAllClientConnected(client: Socket) {
    console.log('Event GET_ALL_CLIENT_CONNECTED')
    const _client = arrClient.find(obj => obj.id == client.id);
    const user = await this.UserService.getAllUsers();
    const retArr = [];
    if (_client && user) {
      for (let i = 0; user.length > i; i++) {
        if (user[i].login != _client.username)
          retArr.push({ id: user[i].id, login: user[i].login, nickname: user[i].nickname, profile_pic: user[i].profile_pic });
      }
    }
    console.log("emit");

    if (retArr.length <= 0)
      this.server.to(client.id).emit("getAllClientConnected", null);
    else
      this.server.to(client.id).emit("getAllClientConnected", retArr);
  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS')
  async getAllClientConnectedNotFriend(client: Socket) {
    console.log('Event GET_ALL_CLIENT_CONNECTED_WITHOUT_FRIENDS')
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
        console.log("emit");

        this.server.to(client.id).emit("getAllClientConnectedWithoutFriend", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS')
  async getAllClientConnectedNotParticipants(client: Socket, data: { room_id: number, room_name: string }) {
    console.log('Event GET_ALL_CLIENT_CONNECTED_WITHOUT_PARTICIPANTS')
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
        console.log("emit");

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
        console.log("emit");

        this.server.to(client.id).emit("getAllClientConnectedWithoutFriend", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_CLIENT_CONNECTED_WITHOUT_BANNED')
  async getAllClientConnectedWithoutBanned(client: Socket, data: { id: number, login: string }) {
    console.log('Event GET_ALL_CLIENT_CONNECTED_WITHOUT_BANNED')
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
        console.log("emit");

        this.server.to(client.id).emit("getAllClientConnectedWithoutBanned", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_USERS_IN_ROOM')
  async getAllUsersInRoom(client: Socket, data: { room_id: number, room_name: string }) {
    console.log('Event GET_ALL_USERS_IN_ROOM')
    const _room = arrRoom.find(obj => obj.id == data.room_id);
    if (_room) {
      const roomParticipants = await this.ParticipantsService.getAllRoomParticipants(data.room_id);
      const messages = await this.MessagesService.getUsersRoomConversMessages(data.room_name);
      const userList = await this.UserService.getAllUsers();
      if (roomParticipants && userList) {
        const retArr = [];
        for (let index = 0; index < userList.length; index++) {
          const search = roomParticipants.find(obj => obj.user_login == userList[index].login);
          if (search) {
            const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
            retArr.push(toPush);
          }
          else {
            if (messages) {
              const search2 = messages.find(obj => obj.login == userList[index].login);
              if (search2) {
                const toPush = { id: userList[index].id, login: userList[index].login, nickname: userList[index].nickname, profile_pic: userList[index].profile_pic };
                retArr.push(toPush);
              }
            }
          }
        }
        console.log("emit");

        this.server.to(client.id).emit("getAllUsersInRoomReturn", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_PARTICIPANTS')
  async getAllParticipants(client: Socket, data: { room_id: number, room_name: string }) {
    console.log('Event GET_ALL_PARTICIPANTS')
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
        console.log("emit");

        this.server.to(client.id).emit("getAllParticipantsReturn", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_PARTICIPANTS_BANNED')
  async getAllParticipantsBanned(client: Socket, data: { room_id: number, room_name: string }) {
    console.log('Event GET_ALL_PARTICIPANTS_BANNED')
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
        console.log("emit getAllParticipantsBannedReturn to ", client.id, ", retArr: ", retArr);

        this.server.to(client.id).emit("getAllParticipantsBannedReturn", retArr);
      }
    }
  }

  @SubscribeMessage('GET_ALL_USERS_BANNED')
  async getAllUsersBanned(client: Socket, data: { id: number, login: string }) {
    console.log('Event GET_ALL_USERS_BANNED')
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
        console.log("emit");

        this.server.to(client.id).emit("getAllUsersBannedReturn", retArr);
      }
    }
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
    console.log("emit");

    this.server.to(client.id).emit('friendsList', arrClient);
  }

  @SubscribeMessage('CHANGE_NICKNAME')
  async changeNickname(client: Socket, info: { user: any, newNickname: string }) {
    console.log('Event CHANGE_NICKNAME')

    this.UserService.updateNickname(info.user.login, info.newNickname).catch((err) => {
      console.log("emit");

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
      console.log("emit");

      if (res != undefined)
        this.server.to(client.id).emit('changeNicknameSuccess', res)
    })
  }
}
